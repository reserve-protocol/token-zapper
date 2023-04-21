"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearcherResult = void 0;
const ethers_1 = require("ethers");
const Action_1 = require("../action/Action");
const utils_1 = require("../base/utils");
const TransactionBuilder_1 = require("./TransactionBuilder");
const ZapTransaction_1 = require("./ZapTransaction");
class Step {
    inputs;
    action;
    destination;
    constructor(inputs, action, destination) {
        this.inputs = inputs;
        this.action = action;
        this.destination = destination;
    }
}
const linearize = (executor, tokenExchange) => {
    const out = [];
    for (const groupOfSwaps of tokenExchange.swapPaths) {
        const endDest = groupOfSwaps.destination;
        for (let i = 0; i < groupOfSwaps.steps.length; i++) {
            const step = groupOfSwaps.steps[i];
            const hasNext = groupOfSwaps.steps[i + 1] != null;
            let nextAddr = !hasNext ? endDest : executor;
            // If this step supports sending funds to a destination, and the next step requires pay before call
            // we will point the output of this to next
            if (step.action.proceedsOptions === Action_1.DestinationOptions.Recipient &&
                groupOfSwaps.steps[i + 1]?.action.interactionConvention ===
                    Action_1.InteractionConvention.PayBeforeCall) {
                nextAddr = groupOfSwaps.steps[i + 1].action.address;
            }
            out.push(new Step(step.input, step.action, nextAddr));
        }
    }
    return out;
};
class SearcherResult {
    universe;
    swaps;
    signer;
    rToken;
    constructor(universe, swaps, signer, rToken) {
        this.universe = universe;
        this.swaps = swaps;
        this.signer = signer;
        this.rToken = rToken;
    }
    describe() {
        return this.swaps.describe();
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
    async toTransaction(options = {
        returnDust: false,
    }) {
        const executorAddress = this.universe.config.addresses.executorAddress;
        const inputIsNativeToken = this.swaps.inputs[0].token === this.universe.nativeToken;
        const builder = new TransactionBuilder_1.TransactionBuilder(this.universe);
        const allApprovals = [];
        const potentialResidualTokens = new Set();
        for (const block of this.swaps.swapPaths) {
            for (const swap of block.steps) {
                if (swap.action.interactionConvention ===
                    Action_1.InteractionConvention.ApprovalRequired) {
                    allApprovals.push(...swap.action.approvals);
                }
                if (swap.input.length > 1) {
                    swap.input.forEach((t) => potentialResidualTokens.add(t.token));
                }
            }
        }
        const approvalNeeded = [];
        await Promise.all(allApprovals.map(async (i) => {
            if (await this.universe.approvalStore.needsApproval(i.token, executorAddress, i.spender)) {
                approvalNeeded.push(i);
            }
        }));
        if (approvalNeeded.length !== 0) {
            builder.setupApprovals(approvalNeeded);
        }
        const steps = linearize(executorAddress, this.swaps);
        for (const encodedSubCall of await this.encodeActions(steps)) {
            builder.addCall(encodedSubCall);
        }
        if (options.returnDust) {
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
            // TODO: For optimism / arbitrum this needs updating to use type: 0 transactions
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