"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearcherResult = void 0;
const Action_1 = require("../action/Action");
const utils_1 = require("../base/utils");
const TransactionBuilder_1 = require("./TransactionBuilder");
const ethers_1 = require("ethers");
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
class ZapTransaction {
    universe;
    params;
    tx;
    gas;
    input;
    output;
    result;
    constructor(universe, params, tx, gas, input, output, result) {
        this.universe = universe;
        this.params = params;
        this.tx = tx;
        this.gas = gas;
        this.input = input;
        this.output = output;
        this.result = result;
    }
    get fee() {
        return this.universe.nativeToken.quantityFromBigInt(this.universe.gasPrice * this.gas);
    }
    toString() {
        return `ZapTransaction(input:${this.input.formatWithSymbol()},outputs:[${this.output
            .map((i) => i.formatWithSymbol())
            .join(', ')}],txFee:${this.fee.formatWithSymbol()})`;
    }
}
class SearcherResult {
    universe;
    approvals;
    swaps;
    signer;
    constructor(universe, approvals, swaps, signer) {
        this.universe = universe;
        this.approvals = approvals;
        this.swaps = swaps;
        this.signer = signer;
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
    async toTransaction() {
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
            if (await this.approvals.needsApproval(i.token, executorAddress, i.spender)) {
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
        builder.drainERC20([...potentialResidualTokens], this.signer);
        let inputToken = this.swaps.inputs[0].token;
        if (this.universe.commonTokens.ERC20GAS == null) {
            throw new Error('..');
        }
        inputToken =
            inputToken === this.universe.nativeToken
                ? this.universe.commonTokens.ERC20GAS
                : inputToken;
        const payload = {
            tokenIn: inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: builder.contractCalls.map((i) => i.encode()),
            amountOut: this.swaps.outputs[0].amount,
            tokenOut: this.swaps.outputs[0].token.address.address,
        };
        const data = inputIsNativeToken
            ? TransactionBuilder_1.zapperInterface.encodeFunctionData('zapETH', [payload])
            : TransactionBuilder_1.zapperInterface.encodeFunctionData('zapERC20', [payload]);
        const gas = (await this.universe.provider.estimateGas({
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            value: inputIsNativeToken ? ethers_1.ethers.BigNumber.from(this.swaps.inputs[0].amount) : 0,
            from: this.signer.address,
        })).toBigInt();
        const tx = {
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            chainId: (await this.universe.provider.getNetwork()).chainId,
            // TODO: For optimism / arbitrum this needs updating to use type: 0 transactions
            type: 2,
            maxFeePerGas: ethers_1.ethers.BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            gasLimit: ethers_1.ethers.BigNumber.from(gas + gas / 100n),
            value: inputIsNativeToken ? ethers_1.ethers.BigNumber.from(this.swaps.inputs[0].amount) : 0,
            from: this.signer.address,
        };
        return new ZapTransaction(this.universe, payload, tx, gas, this.swaps.inputs[0], this.swaps.outputs, this);
    }
}
exports.SearcherResult = SearcherResult;
//# sourceMappingURL=SearcherResult.js.map