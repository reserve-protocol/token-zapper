import { BigNumber } from '@ethersproject/bignumber';
import { Zero } from '@ethersproject/constants';
import { DestinationOptions, InteractionConvention, } from '../action/Action';
import { parseHexStringIntoBuffer } from '../base/utils';
import { TokenAmounts } from '../entities/TokenAmounts';
import { SwapPath, SwapPaths } from '../searcher/Swap';
import { TransactionBuilder, zapperInterface } from './TransactionBuilder';
import { ZapTransaction } from './ZapTransaction';
const MINT_DIGITS = 10n ** 9n;
class Step {
    inputs;
    action;
    destination;
    outputs;
    constructor(inputs, action, destination, outputs) {
        this.inputs = inputs;
        this.action = action;
        this.destination = destination;
        this.outputs = outputs;
    }
}
const linearize = (executor, tokenExchange) => {
    const out = [];
    const allApprovals = [];
    const balances = new TokenAmounts();
    balances.addQtys(tokenExchange.inputs);
    const recourseOn = (node, nextDestination) => {
        if (node.type === 'SingleSwap') {
            balances.exchange(node.inputs, node.outputs);
            out.push(new Step(node.inputs, node.action, nextDestination, node.outputs));
            for (const approval of node.action.approvals) {
                allApprovals.push(approval);
            }
            return;
        }
        for (let i = 0; i < node.steps.length; i++) {
            const step = node.steps[i];
            const hasNext = node.steps[i + 1] != null;
            let nextAddr = !hasNext ? nextDestination : executor;
            if (step.proceedsOptions === DestinationOptions.Recipient &&
                node.steps[i + 1]?.interactionConvention ===
                    InteractionConvention.PayBeforeCall) {
                nextAddr = node.steps[i + 1].address;
            }
            recourseOn(step, nextAddr);
        }
    };
    for (const groupOfSwaps of tokenExchange.swapPaths) {
        const endDest = groupOfSwaps.destination;
        recourseOn(groupOfSwaps, endDest);
    }
    return [out, balances, allApprovals];
};
export class SearcherResult {
    universe;
    userInput;
    swaps;
    signer;
    outputToken;
    blockNumber;
    constructor(universe, userInput, swaps, signer, outputToken) {
        this.universe = universe;
        this.userInput = userInput;
        this.swaps = swaps;
        this.signer = signer;
        this.outputToken = outputToken;
        this.blockNumber = universe.currentBlock;
    }
    describe() {
        return this.swaps.describe();
    }
    async valueOfDust() {
        let sum = this.universe.usd.zero;
        for (const out of this.swaps.outputs) {
            if (out.token === this.outputToken) {
                continue;
            }
            const price = (await this.universe.fairPrice(out)) ?? this.universe.usd.zero;
            sum = sum.add(price);
        }
        return sum;
    }
    async encodeActions(steps) {
        const blockBuilder = new TransactionBuilder(this.universe);
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (step.action.interactionConvention ===
                InteractionConvention.CallbackBased) {
                throw new Error('Not implemented');
            }
            else {
                blockBuilder.addCall(await step.action.encode(step.inputs, step.destination));
            }
        }
        return blockBuilder.contractCalls;
    }
    async simulateNoNode({ data, value, }) {
        const resp = await this.universe.provider.call({
            data,
            from: this.signer.address,
            to: this.universe.config.addresses.zapperAddress.address,
            value
        });
        return zapperInterface.decodeFunctionResult('zapERC20', resp)
            .out;
    }
    async simulate({ data, value, quantity, inputToken, gasLimit = 10000000, }) {
        if (this.universe.chainId !== 1) {
            return this.simulateNoNode({
                data,
                value,
                quantity,
                inputToken,
                gasLimit,
            });
        }
        const overrides = {};
        const body = JSON.stringify({
            from: this.signer.address,
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            quantity: '0x' + quantity.toString(16),
            gasLimit,
            value: '0x' + value.toString(16),
            token: inputToken.address.address,
            overrides,
        }, null, 1);
        return await (await fetch('https://worker-frosty-pine-5440.mig2151.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        }))
            .json()
            .then((a) => {
            return zapperInterface.decodeFunctionResult('zapERC20', a.data)
                .out;
        });
    }
    async toTransaction(options = {}) {
        const executorAddress = this.universe.config.addresses.executorAddress;
        const inputIsNativeToken = this.userInput.token === this.universe.nativeToken;
        const builder = new TransactionBuilder(this.universe);
        const potentialResidualTokens = new Set();
        const [steps, , allApprovals] = linearize(executorAddress, this.swaps);
        for (const step of steps) {
            for (const qty of step.inputs) {
                if (qty.token === this.universe.nativeToken) {
                    continue;
                }
                potentialResidualTokens.add(qty.token);
            }
            for (const qty of step.outputs) {
                if (qty.token === this.universe.nativeToken) {
                    continue;
                }
                potentialResidualTokens.add(qty.token);
            }
        }
        const approvalNeeded = [];
        const duplicate = new Set();
        await Promise.all(allApprovals.map(async (i) => {
            const key = i.spender.toString() + i.token.address.toString();
            if (duplicate.has(key)) {
                return;
            }
            duplicate.add(key);
            if (await this.universe.approvalsStore.needsApproval(i.token, executorAddress, i.spender, 2n ** 200n)) {
                approvalNeeded.push(i);
            }
        }));
        if (approvalNeeded.length !== 0) {
            builder.setupApprovals(approvalNeeded);
        }
        for (const encodedSubCall of await this.encodeActions(steps)) {
            builder.addCall(encodedSubCall);
        }
        let inputToken = this.swaps.inputs[0].token;
        if (this.universe.commonTokens.ERC20GAS == null) {
            throw new Error('Unexpected: Missing wrapped gas token');
        }
        inputToken =
            inputToken === this.universe.nativeToken
                ? this.universe.commonTokens.ERC20GAS
                : inputToken;
        const amountOut = this.swaps.outputs.find((output) => output.token === this.outputToken);
        if (amountOut == null) {
            throw new Error('Unexpected: output does not contain RToken');
        }
        const dustTokens = [...potentialResidualTokens];
        const outputIsRToken = Object.values(this.universe.rTokens).includes(this.outputToken);
        if (outputIsRToken) {
            builder.contractCalls.pop();
            builder.issueMaxRTokens(this.outputToken, this.signer);
        }
        else {
            console.log("Will not apply maxIssueance optimisation");
        }
        let payload = {
            tokenIn: inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: builder.contractCalls.map((i) => i.encode()),
            amountOut: 1n,
            tokenOut: amountOut.token.address.address,
            tokensUsedByZap: dustTokens.map((i) => i.address.address),
        };
        const value = inputIsNativeToken ? BigNumber.from(payload.amountIn) : Zero;
        let data = inputIsNativeToken
            ? zapperInterface.encodeFunctionData('zapETH', [payload])
            : options.permit2 == null
                ? zapperInterface.encodeFunctionData('zapERC20', [payload])
                : zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
                    payload,
                    options.permit2.permit,
                    parseHexStringIntoBuffer(options.permit2.signature),
                ]);
        const zapperResult = await this.simulate({
            data,
            gasLimit: options.gasLimit,
            quantity: this.userInput.amount,
            value: value.toBigInt(),
            inputToken,
        });
        const dustQuantities = zapperResult.dust
            .map((qty, index) => dustTokens[index].from(qty))
            .filter((i) => i.token !== this.outputToken && i.amount !== 0n);
        const dustValues = await Promise.all(dustQuantities.map(async (i) => [await this.universe.fairPrice(i), i]));
        const amount = zapperResult.amountOut.toBigInt();
        const outputTokenOutput = this.outputToken.from((amount / MINT_DIGITS) * MINT_DIGITS);
        console.log(`Zapper output: ${outputTokenOutput}, dust: ${dustQuantities.join(', ')}`);
        let valueOfDust = this.universe.usd.zero;
        for (const [usdValue, dustQuantity] of dustValues) {
            if (usdValue == null) {
                console.info(`Failed to find a price for ${dustQuantity}`);
                continue;
            }
            valueOfDust = valueOfDust.add(usdValue);
        }
        console.log(`Dust worth: ~${valueOfDust}`);
        const simulatedOutputs = [...dustQuantities, outputTokenOutput];
        const totalValue = (await this.universe.fairPrice(outputTokenOutput))?.add(valueOfDust) ??
            valueOfDust;
        this.swaps = new SwapPaths(this.universe, this.swaps.inputs, this.swaps.swapPaths, simulatedOutputs, totalValue, this.swaps.destination);
        if (outputIsRToken) {
            builder.contractCalls.pop();
            const previous = this.swaps.swapPaths.pop();
            const mintRtoken = this.universe.wrappedTokens.get(this.outputToken)
                .mint;
            this.swaps.swapPaths.push(new SwapPath(previous.inputs, previous.steps, simulatedOutputs, totalValue, previous.destination));
            builder.addCall(await mintRtoken.encodeIssueTo(previous.inputs, 
            // TODO: Find a better way to avoid off by one errors
            outputTokenOutput.token.from(outputTokenOutput.amount - 1000000n), this.signer));
        }
        if (options.returnDust) {
            builder.drainERC20(dustQuantities.map((i) => i.token), this.signer);
        }
        console.log('Final Zap:');
        console.log('  ' + builder.contractCalls.map((i) => i.comment).join('\n  '));
        payload = {
            tokenIn: inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: builder.contractCalls.map((i) => i.encode()),
            amountOut: outputTokenOutput.amount - 1000000000000n,
            tokenOut: amountOut.token.address.address,
            tokensUsedByZap: dustTokens.map((i) => i.address.address),
        };
        data = inputIsNativeToken
            ? zapperInterface.encodeFunctionData('zapETH', [payload])
            : options.permit2 == null
                ? zapperInterface.encodeFunctionData('zapERC20', [payload])
                : zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
                    payload,
                    options.permit2.permit,
                    parseHexStringIntoBuffer(options.permit2.signature),
                ]);
        const zapperResult2 = await this.simulate({
            data,
            gasLimit: options.gasLimit,
            quantity: this.userInput.amount,
            value: value.toBigInt(),
            inputToken,
        });
        let gasNeeded = zapperResult2.gasUsed.toBigInt() + 50000n;
        const tokenBalance = await this.universe.approvalsStore.queryBalance(this.userInput.token, this.signer, this.universe);
        const sufficientBalance = tokenBalance.gte(this.swaps.inputs[0]);
        if (sufficientBalance &&
            (inputIsNativeToken ||
                !(await this.universe.approvalsStore.needsApproval(inputToken, executorAddress, this.universe.config.addresses.zapperAddress, this.swaps.inputs[0].amount)))) {
            gasNeeded = (await this.universe.provider.estimateGas({
                to: this.universe.config.addresses.zapperAddress.address,
                data,
                value: value.toBigInt(),
                from: this.signer.address,
            })).toBigInt();
        }
        const txFee = this.universe.nativeToken.from(gasNeeded * this.universe.gasPrice);
        const txUsdFee = await this.universe.fairPrice(txFee);
        console.log(`Gas used ${gasNeeded}, Tx fee: ${txFee} (${txUsdFee})`);
        let tx = {
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            gasLimit: gasNeeded + gasNeeded / 10n,
            chainId: this.universe.chainId,
            // TODO: For opti & arbi this needs updating to use type: 0 transactions
            value,
            from: this.signer.address,
        };
        if (this.universe.chainId === 1) {
            tx = {
                ...tx,
                type: 2,
                maxFeePerGas: BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            };
        }
        else {
            tx = {
                ...tx,
                type: 0,
                gasPrice: BigNumber.from(this.universe.gasPrice),
            };
        }
        const out = new ZapTransaction(payload, tx, zapperResult2.gasUsed.toBigInt(), this.swaps.inputs[0], this.swaps.outputs);
        return out;
    }
}
//# sourceMappingURL=SearcherResult.js.map