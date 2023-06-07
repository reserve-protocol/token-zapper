"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearcherResult = void 0;
const ethers_1 = require("ethers");
const Action_1 = require("../action/Action");
const Token_1 = require("../entities/Token");
const utils_1 = require("../base/utils");
const TransactionBuilder_1 = require("./TransactionBuilder");
const ZapTransaction_1 = require("./ZapTransaction");
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
    const balances = new Token_1.TokenAmounts();
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
            if (step.proceedsOptions === Action_1.DestinationOptions.Recipient &&
                node.steps[i + 1]?.interactionConvention ===
                    Action_1.InteractionConvention.PayBeforeCall) {
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
class SearcherResult {
    universe;
    userInput;
    swaps;
    signer;
    rToken;
    blockNumber;
    constructor(universe, userInput, swaps, signer, rToken) {
        this.universe = universe;
        this.userInput = userInput;
        this.swaps = swaps;
        this.signer = signer;
        this.rToken = rToken;
        this.blockNumber = universe.currentBlock;
    }
    describe() {
        return this.swaps.describe();
    }
    async valueOfDust() {
        let sum = this.universe.usd.zero;
        for (const out of this.swaps.outputs) {
            if (out.token === this.rToken) {
                continue;
            }
            const price = (await this.universe.fairPrice(out)) ?? this.universe.usd.zero;
            sum = sum.add(price);
        }
        return sum;
    }
    async encodeActions(steps) {
        const blockBuilder = new TransactionBuilder_1.TransactionBuilder(this.universe);
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (step.action.interactionConvention ===
                Action_1.InteractionConvention.CallbackBased) {
                const rest = await this.encodeActions(steps.slice(i + 1));
                const encoding = (0, utils_1.parseHexStringIntoBuffer)(TransactionBuilder_1.zapperExecutorInterface.encodeFunctionData('execute', [
                    rest.map((i) => ({
                        to: i.to.address,
                        value: i.value,
                        data: i.payload,
                    })),
                ]));
                blockBuilder.addCall(await step.action.encode(step.inputs, step.destination, encoding));
            }
            else {
                blockBuilder.addCall(await step.action.encode(step.inputs, step.destination));
            }
        }
        return blockBuilder.contractCalls;
    }
    async toTransaction(options) {
        const executorAddress = this.universe.config.addresses.executorAddress;
        const inputIsNativeToken = this.userInput.token === this.universe.nativeToken;
        const builder = new TransactionBuilder_1.TransactionBuilder(this.universe);
        const potentialResidualTokens = new Set();
        const [steps, endBalances, allApprovals] = linearize(executorAddress, this.swaps);
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
            if (await this.universe.approvalStore.needsApproval(i.token, executorAddress, i.spender, 2n ** 200n)) {
                approvalNeeded.push(i);
            }
        }));
        if (approvalNeeded.length !== 0) {
            builder.setupApprovals(approvalNeeded);
        }
        // const rTokenResult = endBalances.get(this.rToken)
        endBalances.tokenBalances.delete(this.rToken);
        const dustAmounts = endBalances.toTokenQuantities();
        for (const encodedSubCall of await this.encodeActions(steps)) {
            builder.addCall(encodedSubCall);
        }
        // Return dust to user if the dust is greater than the tx fee
        let totalDustValue = this.universe.usd.zero;
        for (const [, dustPrice] of await Promise.all(dustAmounts.map(async (qty) => [
            qty,
            (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero,
        ]))) {
            totalDustValue = totalDustValue.add(dustPrice);
        }
        console.log('Value of dust: ' + totalDustValue);
        console.log('Dust qtys: ' + dustAmounts.join(', '));
        if (totalDustValue.gt(this.universe.usd.one)) {
            console.log('Dust ' + dustAmounts.join(', '));
            const approxGasCost = BigInt(this.swaps.outputs.length - 1) * 60000n;
            const gasPrice = this.universe.gasPrice;
            const txFeeToWithdraw = this.universe.nativeToken.from(gasPrice * approxGasCost);
            const txFeeValue = await this.universe.fairPrice(txFeeToWithdraw);
            console.log('Transaction fee: ' + txFeeValue);
            console.log('Value of dust: ' + totalDustValue);
            console.log('Dust qtys: ' + dustAmounts.join(', '));
            // We return the dust in three cases:
            // 1. The dust is greater than the tx fee
            // 2. The dust is, in total greater than 10 USD
            // 3. We failed to estimate the tx fee for whatever reason
            options.returnDust =
                txFeeValue == null ||
                    totalDustValue.gt(txFeeValue) ||
                    totalDustValue.gt(this.universe.usd.one.scalarMul(10n));
        }
        if (options.returnDust) {
            console.log('Will claim dust, and return to ' + this.signer.address);
            builder.drainERC20([...potentialResidualTokens], this.signer);
        }
        let inputToken = this.swaps.inputs[0].token;
        if (this.universe.commonTokens.ERC20GAS == null) {
            throw new Error('Unexpected: Missing wrapped gas token');
        }
        inputToken =
            inputToken === this.universe.nativeToken
                ? this.universe.commonTokens.ERC20GAS
                : inputToken;
        const amountOut = this.swaps.outputs.find((output) => output.token === this.rToken);
        if (amountOut == null) {
            throw new Error('Unexpected: output does not contain RToken');
        }
        // for(const call of builder.contractCalls) {
        //   console.log("comment: ", call.comment)
        //   console.log("to: ", call.to)
        //   console.log("payload: ", call.payload)
        // }
        const payload = {
            tokenIn: inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: builder.contractCalls.map((i) => i.encode()),
            amountOut: amountOut.amount,
            tokenOut: amountOut.token.address.address,
        };
        const value = inputIsNativeToken
            ? ethers_1.ethers.BigNumber.from(this.swaps.inputs[0].amount)
            : ethers_1.ethers.constants.Zero;
        const data = inputIsNativeToken
            ? TransactionBuilder_1.zapperInterface.encodeFunctionData('zapETH', [payload])
            : options.permit2 == null
                ? TransactionBuilder_1.zapperInterface.encodeFunctionData('zapERC20', [payload])
                : TransactionBuilder_1.zapperInterface.encodeFunctionData('zapERC20WithPermit2', [
                    payload,
                    options.permit2.permit,
                    (0, utils_1.parseHexStringIntoBuffer)(options.permit2.signature),
                ]);
        const tx = {
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            chainId: this.universe.chainId,
            // TODO: For opti & arbi this needs updating to use type: 0 transactions
            type: 2,
            maxFeePerGas: ethers_1.ethers.BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            value,
            from: this.signer.address,
        };
        return new ZapTransaction_1.ZapTransaction(this.universe, payload, tx, builder.gasEstimate(), this.swaps.inputs[0], this.swaps.outputs, this);
    }
}
exports.SearcherResult = SearcherResult;
//# sourceMappingURL=SearcherResult.js.map