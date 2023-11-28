import { BigNumber } from '@ethersproject/bignumber';
import { DestinationOptions, InteractionConvention, } from '../action/Action';
import { parseHexStringIntoBuffer } from '../base/utils';
import { TokenAmounts } from '../entities/TokenAmounts';
import { SwapPath, SwapPaths } from '../searcher/Swap';
import { TransactionBuilder, zapperInterface } from './TransactionBuilder';
import { ZapTransaction } from './ZapTransaction';
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
export class BaseSearcherResult {
    universe;
    userInput;
    swaps;
    signer;
    outputToken;
    builder;
    blockNumber;
    commands;
    potentialResidualTokens;
    allApprovals;
    inputToken;
    inputIsNative;
    constructor(universe, userInput, swaps, signer, outputToken) {
        this.universe = universe;
        this.userInput = userInput;
        this.swaps = swaps;
        this.signer = signer;
        this.outputToken = outputToken;
        if (this.universe.commonTokens.ERC20GAS == null) {
            throw new Error('Unexpected: Missing wrapped gas token');
        }
        const inputToken = this.swaps.inputs[0].token === this.universe.nativeToken
            ? this.universe.commonTokens.ERC20GAS
            : this.swaps.inputs[0].token;
        this.inputToken = inputToken;
        this.builder = new TransactionBuilder(universe);
        this.blockNumber = universe.currentBlock;
        const potentialResidualTokens = new Set();
        const executorAddress = this.universe.config.addresses.executorAddress;
        const [steps, , allApprovals] = linearize(executorAddress, this.swaps);
        this.allApprovals = allApprovals;
        this.commands = steps;
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
        this.potentialResidualTokens = [...potentialResidualTokens];
        this.inputIsNative = this.userInput.token === this.universe.nativeToken;
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
    async simulateNoNode({ data, value }) {
        const resp = await this.universe.provider.call({
            data,
            from: this.signer.address,
            to: this.universe.config.addresses.zapperAddress.address,
            value,
        });
        if (resp.startsWith('0x08c379a0')) {
            // const len = Number(BigInt('0x'+resp.slice(10, 74)))
            const data = resp.slice(138);
            const msg = Buffer.from(data, 'hex').toString();
            throw new Error(`${data}: ${msg}`);
        }
        else if (resp.length <= 10 + 64 * 2) {
            throw new Error('Failed with error: ' + resp);
        }
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
        try {
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
                if (a.data === '0xundefined') {
                    throw new Error('Failed to simulate');
                }
                return zapperInterface.decodeFunctionResult('zapERC20', a.data)
                    .out;
            });
        }
        catch (e) {
            return this.simulateNoNode({
                data,
                value,
                quantity,
                inputToken,
                gasLimit,
            });
        }
    }
    async simulateAndParse(options, data) {
        const zapperResult = await this.simulate({
            data,
            value: this.value,
            quantity: this.userInput.amount,
            inputToken: this.inputToken,
        });
        const dustQuantities = zapperResult.dust
            .map((qty, index) => this.potentialResidualTokens[index].from(qty))
            .filter((i) => i.token !== this.outputToken && i.amount !== 0n);
        const dustValues = await Promise.all(dustQuantities.map(async (i) => [await this.universe.fairPrice(i), i]));
        const amount = zapperResult.amountOut.toBigInt();
        const rounding = 10n ** BigInt(this.outputToken.decimals / 2);
        const outputTokenOutput = this.outputToken.from((amount / rounding) * rounding);
        let valueOfDust = this.universe.usd.zero;
        for (const [usdValue, dustQuantity] of dustValues) {
            if (usdValue == null) {
                // console.info(`Failed to find a price for ${dustQuantity}`)
                continue;
            }
            valueOfDust = valueOfDust.add(usdValue);
        }
        const simulatedOutputs = [...dustQuantities, outputTokenOutput];
        const totalValue = (await this.universe.fairPrice(outputTokenOutput))?.add(valueOfDust) ??
            valueOfDust;
        const gasUsed = zapperResult.gasUsed.toBigInt();
        return {
            gasUsed: gasUsed + 100000n + gasUsed / 10n,
            simulatedOutputs,
            totalValue,
            swaps: new SwapPaths(this.universe, this.swaps.inputs, this.swaps.swapPaths, simulatedOutputs.map((i) => {
                if (i.token === this.outputToken) {
                    const slippage = outputTokenOutput.amount / (options.outputSlippage ?? 250000n);
                    return i.token.from(outputTokenOutput.amount - (slippage === 0n ? 1n : slippage));
                }
                return i;
            }), totalValue, this.swaps.destination),
            dust: dustQuantities,
            dustValue: valueOfDust,
            output: outputTokenOutput,
        };
    }
    async setupApprovals(builder) {
        const executorAddress = this.universe.config.addresses.executorAddress;
        const approvalNeeded = [];
        const duplicate = new Set();
        await Promise.all(this.allApprovals.map(async (i) => {
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
    }
    encodePayload(outputTokenOutput, options) {
        return {
            tokenIn: this.inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: this.builder.contractCalls.map((i) => i.encode()),
            amountOut: outputTokenOutput.amount -
                outputTokenOutput.amount / (options.outputSlippage ?? 250000n),
            tokenOut: this.outputToken.address.address,
            tokensUsedByZap: this.potentialResidualTokens.map((i) => i.address.address),
        };
    }
    get value() {
        return this.inputIsNative ? this.userInput.amount : 0n;
    }
    encodeCall(options, payload) {
        return this.inputIsNative
            ? zapperInterface.encodeFunctionData('zapETH', [payload])
            : options.permit2 == null
                ? zapperInterface.encodeFunctionData('zapERC20', [payload])
                : zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
                    payload,
                    options.permit2.permit,
                    parseHexStringIntoBuffer(options.permit2.signature),
                ]);
    }
    encodeTx(data, gasNeeded) {
        let tx = {
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            gasLimit: gasNeeded,
            chainId: this.universe.chainId,
            // TODO: For opti & arbi this needs updating to use type: 0 transactions
            value: BigNumber.from(this.value),
            from: this.signer.address,
        };
        if (this.universe.chainId === 1 || this.universe.chainId === 8453) {
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
                gasPrice: BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            };
        }
        return tx;
    }
}
export class TradeSearcherResult extends BaseSearcherResult {
    async toTransaction(options = {}) {
        this.builder.contractCalls.length = 0;
        const builder = this.builder;
        await this.setupApprovals(builder);
        for (const encodedSubCall of await this.encodeActions(this.commands)) {
            builder.addCall(encodedSubCall);
        }
        builder.drainERC20([this.outputToken], this.signer);
        const amountOut = this.swaps.outputs.find((output) => output.token === this.outputToken);
        if (amountOut == null) {
            throw new Error('Unexpected: output does not contain RToken');
        }
        // First simulate the transaction with infinite slippage
        const simulationResult = await this.simulateAndParse(options, this.encodeCall(options, this.encodePayload(this.outputToken.from(1n), options)));
        this.swaps = simulationResult.swaps;
        const payload = this.encodePayload(simulationResult.output, options);
        const data = this.encodeCall(options, payload);
        // Resimulate the transaction with the correct slippage
        const finalResult = await this.simulateAndParse(options, data);
        this.swaps = finalResult.swaps;
        const tx = this.encodeTx(data, finalResult.gasUsed);
        const out = new ZapTransaction(payload, tx, finalResult.gasUsed, this.swaps.inputs[0], this.swaps.outputs, builder.contractCalls);
        return out;
    }
}
export class BurnRTokenSearcherResult extends BaseSearcherResult {
    async toTransaction(options = {}) {
        this.builder.contractCalls.length = 0;
        const builder = this.builder;
        await this.setupApprovals(builder);
        for (const encodedSubCall of await this.encodeActions(this.commands)) {
            builder.addCall(encodedSubCall);
        }
        const amountOut = this.swaps.outputs.find((output) => output.token === this.outputToken);
        if (amountOut == null) {
            throw new Error('Unexpected: output does not contain RToken');
        }
        const dustTokens = [this.outputToken];
        if (options.returnDust) {
            dustTokens.push(...this.potentialResidualTokens);
        }
        builder.drainERC20([...new Set(dustTokens)], this.signer);
        // First simulate the transaction with infinite slippage
        // console.log(this.swaps.describe().join('\n'))
        const simulationResult = await this.simulateAndParse(options, this.encodeCall(options, this.encodePayload(this.outputToken.from(1n), options)));
        this.swaps = simulationResult.swaps;
        const payload = this.encodePayload(simulationResult.output, options);
        const data = this.encodeCall(options, payload);
        // Resimulate the transaction with the correct slippage
        const finalResult = await this.simulateAndParse(options, data);
        this.swaps = finalResult.swaps;
        const tx = this.encodeTx(data, finalResult.gasUsed);
        const out = new ZapTransaction(payload, tx, finalResult.gasUsed, this.swaps.inputs[0], this.swaps.outputs, builder.contractCalls);
        return out;
    }
}
export class MintRTokenSearcherResult extends BaseSearcherResult {
    async toTransaction(options = {}) {
        this.builder.contractCalls.length = 0;
        const builder = this.builder;
        await this.setupApprovals(builder);
        for (const encodedSubCall of await this.encodeActions(this.commands)) {
            builder.addCall(encodedSubCall);
        }
        const amountOut = this.swaps.outputs.find((output) => output.token === this.outputToken);
        if (amountOut == null) {
            throw new Error('Unexpected: output does not contain RToken');
        }
        builder.contractCalls.pop();
        builder.issueMaxRTokens(this.outputToken, this.signer);
        // console.log(
        //   [
        //     '  Commands: [',
        //     ...this.builder.contractCalls.map(i => '    ' + i.comment),
        //     '  ],',
        //   ].join('\n')
        // )
        // First simulate the transaction with infinite slippage
        const simulationResult = await this.simulateAndParse(options, this.encodeCall(options, this.encodePayload(this.outputToken.from(1n), options)));
        this.swaps = simulationResult.swaps;
        if (options.maxIssueance !== true) {
            builder.contractCalls.pop();
            const previous = this.swaps.swapPaths.pop();
            const mintRtoken = this.universe.wrappedTokens.get(this.outputToken)
                .mint;
            this.swaps.swapPaths.push(new SwapPath(previous.inputs, previous.steps, simulationResult.simulatedOutputs, simulationResult.totalValue, previous.destination));
            builder.addCall(await mintRtoken.encodeIssueTo(previous.inputs, 
            // TODO: Find a better way to avoid off by one errors
            simulationResult.output.token.from(simulationResult.output.amount -
                simulationResult.output.amount / mintRtoken.outputSlippage), this.signer));
        }
        if (options.returnDust) {
            builder.drainERC20(simulationResult.dust
                .filter((i) => i.amount !== 0n)
                .map((i) => i.token), this.signer);
        }
        const payload = this.encodePayload(simulationResult.output, options);
        const data = this.encodeCall(options, payload);
        // Resimulate the transaction with the correct slippage
        const finalResult = await this.simulateAndParse(options, data);
        this.swaps = finalResult.swaps;
        const tx = this.encodeTx(data, finalResult.gasUsed);
        const out = new ZapTransaction(payload, tx, finalResult.gasUsed, this.swaps.inputs[0], this.swaps.outputs, builder.contractCalls);
        return out;
    }
}
//# sourceMappingURL=SearcherResult.js.map