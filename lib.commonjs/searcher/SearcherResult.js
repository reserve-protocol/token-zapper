"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintRTokenSearcherResult = exports.BurnRTokenSearcherResult = exports.TradeSearcherResult = exports.BaseSearcherResult = exports.ThirdPartyIssue = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Action_1 = require("../action/Action");
const utils_2 = require("../base/utils");
const contracts_1 = require("../contracts");
const TokenAmounts_1 = require("../entities/TokenAmounts");
const Swap_1 = require("../searcher/Swap");
const Planner_1 = require("../tx-gen/Planner");
const ZapTransaction_1 = require("./ZapTransaction");
const DefaultMap_1 = require("../base/DefaultMap");
const IERC20__factory_1 = require("../contracts/factories/contracts/IERC20__factory");
const Searcher_1 = require("./Searcher");
const controlflow_1 = require("../base/controlflow");
const simulationUrls = {
    // 8453: 'https://resbasesimulator.mig2151.workers.dev',
    1: 'https://worker-frosty-pine-5440.mig2151.workers.dev',
};
const zapperInterface = contracts_1.Zapper__factory.createInterface();
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
    const balances = new TokenAmounts_1.TokenAmounts();
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
class ThirdPartyIssue extends Error {
    msg;
    constructor(msg) {
        super(msg);
        this.msg = msg;
    }
}
exports.ThirdPartyIssue = ThirdPartyIssue;
class BaseSearcherResult {
    universe;
    userInput;
    swaps;
    signer;
    outputToken;
    planner = new Planner_1.Planner();
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
    async simulateNoNode({ data, value }) {
        try {
            const resp = await this.universe.provider.call({
                data,
                from: this.signer.address,
                to: this.universe.config.addresses.zapperAddress.address,
                value,
            }, 'latest');
            try {
                return zapperInterface.decodeFunctionResult('zapERC20', resp)
                    .out;
            }
            catch (e) {
                console.log(resp);
            }
            if (resp.startsWith('0x08c379a0')) {
                const data = resp.slice(138);
                const msg = Buffer.from(data, 'hex').toString();
                throw new Error(msg);
            }
            else {
                for (let i = 10; i < resp.length; i += 128) {
                    const len = BigInt('0x' + resp.slice(i, i + 64));
                    if (len != 0n && len < 256n) {
                        const data = resp.slice(i + 64, i + 64 + Number(len) * 2);
                        const msg = Buffer.from(data, 'hex').toString();
                        throw new Error(msg);
                    }
                }
            }
            throw new Error('Unknonw error: ' + resp);
        }
        catch (e) {
            if (e.message.includes('LPStakingTime')) {
                console.error('Stargate staking contract out of funds.. Aborting');
                throw new ThirdPartyIssue('Stargate out of funds');
            }
            console.log(e);
        }
        // console.log(
        //   JSON.stringify({
        //     data,
        //     value: value.toString(),
        //     address: this.universe.config.addresses.zapperAddress.address,
        //     from: this.signer.address,
        //     block,
        //   })
        // )
        throw new Error('Failed to simulate');
    }
    async simulate({ data, value, quantity, inputToken, gasLimit = 10000000, }) {
        const url = simulationUrls[this.universe.chainId];
        if (url == null) {
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
            return await (await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            }))
                .json()
                .then((a) => {
                console.log(a);
                if (a.data === '0xundefined') {
                    throw new Error('Failed to simulate');
                }
                const out = zapperInterface.decodeFunctionResult('zapERC20', a.data)
                    .out;
                // console.log(out)
                return out;
            });
        }
        catch (e) {
            console.log(e);
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
        for (const [usdValue] of dustValues) {
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
            swaps: new Swap_1.SwapPaths(this.universe, this.swaps.inputs, this.swaps.swapPaths, simulatedOutputs.map((i) => {
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
    async setupApprovals() {
        const executorAddress = this.universe.config.addresses.executorAddress;
        const approvalNeeded = [];
        const duplicate = new Set();
        await Promise.all(this.allApprovals.map(async (i) => {
            const key = i.spender.toString() + i.token.address.toString();
            if (duplicate.has(key)) {
                return;
            }
            duplicate.add(key);
            if (await this.universe.approvalsStore.needsApproval(i.token, executorAddress, i.spender, ethers_1.constants.MaxUint256.div(2).toBigInt())) {
                approvalNeeded.push(i);
            }
        }));
        for (const approval of approvalNeeded) {
            const token = Planner_1.Contract.createContract(IERC20__factory_1.IERC20__factory.connect(approval.token.address.address, this.universe.provider));
            this.planner.add(token.approve(approval.spender.address, ethers_1.constants.MaxUint256));
        }
    }
    encodePayload(outputTokenOutput, options) {
        const plan = this.planner.plan();
        return {
            tokenIn: this.inputToken.address.address,
            amountIn: this.swaps.inputs[0].amount,
            commands: plan.commands,
            state: plan.state,
            amountOut: outputTokenOutput.amount -
                outputTokenOutput.amount / (options.outputSlippage ?? 250000n),
            tokenOut: this.outputToken.address.address,
            tokens: this.potentialResidualTokens.map((i) => i.address.address),
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
                    (0, utils_2.parseHexStringIntoBuffer)(options.permit2.signature),
                ]);
    }
    encodeTx(data, gasNeeded) {
        let tx = {
            to: this.universe.config.addresses.zapperAddress.address,
            data,
            gasLimit: gasNeeded,
            chainId: this.universe.chainId,
            // TODO: For opti & arbi this needs updating to use type: 0 transactions
            value: bignumber_1.BigNumber.from(this.value),
            from: this.signer.address,
        };
        if (this.universe.chainId === 1 || this.universe.chainId === 8453) {
            tx = {
                ...tx,
                type: 2,
                maxFeePerGas: bignumber_1.BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            };
        }
        else {
            tx = {
                ...tx,
                type: 0,
                gasPrice: bignumber_1.BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
            };
        }
        return tx;
    }
    async toTransactionWithRetry(opts) {
        let root = this;
        for (let i = 0; i < 3; i++) {
            try {
                return root.toTransaction(opts);
            }
            catch (e) {
                if (i == 3 || e instanceof ThirdPartyIssue) {
                    console.log((0, Planner_1.printPlan)(this.planner, this.universe)
                        .map((i) => '  ' + i)
                        .join('\n'));
                    throw e;
                }
                await (0, controlflow_1.wait)(50);
                const [block, gas] = await Promise.all([
                    this.universe.provider.getBlockNumber(),
                    this.universe.provider.getGasPrice().then((i) => i.toBigInt()),
                ]);
                await this.universe.updateBlockState(block, gas);
                const toRToken = this.universe.rTokens[this.outputToken.symbol] != null;
                const searcher = new Searcher_1.Searcher(this.universe);
                if (toRToken) {
                    root = await searcher.findSingleInputToRTokenZap(this.userInput, this.outputToken, this.signer);
                }
                else {
                    root = await searcher.findRTokenIntoSingleTokenZap(this.userInput, this.outputToken, this.signer);
                }
            }
        }
        throw new Error('Failed to create transaction');
    }
    async createZapTransaction(options) {
        try {
            const params = this.encodePayload(this.swaps.outputs[0].token.from(1n), {
                ...options,
                returnDust: false,
            });
            const data = this.encodeCall(options, params);
            const tx = this.encodeTx(data, 300000n);
            const result = await this.simulateAndParse(options, tx.data.toString());
            let dust = this.potentialResidualTokens.map((qty) => qty);
            if (options.returnDust === true) {
                for (const tok of dust) {
                    const balanceOfDust = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, tok, this.universe.config.addresses.executorAddress);
                    Action_1.plannerUtils.erc20.transfer(this.universe, this.planner, balanceOfDust, tok, this.signer);
                }
            }
            const finalParams = this.encodePayload(result.output, options);
            const updatedOutputs = [
                this.outputToken.from(bignumber_1.BigNumber.from(finalParams.amountOut)),
                ...result.simulatedOutputs.filter((i) => i.token !== this.outputToken),
            ];
            const values = await Promise.all(updatedOutputs.map(async (i) => [await this.universe.fairPrice(i), i]));
            const outputValue = values.reduce((a, b) => a.add(b[0] ?? this.universe.usd.zero), this.universe.usd.zero);
            this.swaps = new Swap_1.SwapPaths(this.swaps.universe, this.swaps.inputs, this.swaps.swapPaths, updatedOutputs, outputValue, this.swaps.destination);
            const estimate = result.gasUsed + result.gasUsed / 10n;
            const finalTx = this.encodeTx(this.encodeCall(options, finalParams), estimate);
            return new ZapTransaction_1.ZapTransaction(this.universe, finalParams, finalTx, estimate, this.swaps.inputs[0], this.swaps.outputs, this.planner);
        }
        catch (e) {
            if (e instanceof ThirdPartyIssue) {
                throw e;
            }
            throw e;
        }
    }
}
exports.BaseSearcherResult = BaseSearcherResult;
class TradeSearcherResult extends BaseSearcherResult {
    async toTransaction(options = {}) {
        await this.setupApprovals();
        for (const step of this.swaps.swapPaths[0].steps) {
            await step.action.plan(this.planner, [], this.signer, [this.userInput]);
            if (step.action.proceedsOptions === Action_1.DestinationOptions.Callee) {
                const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, step.outputs[0].token, this.universe.config.addresses.executorAddress);
                Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, step.outputs[0].token, out, this.signer);
            }
        }
        return this.createZapTransaction(options);
    }
}
exports.TradeSearcherResult = TradeSearcherResult;
class BurnRTokenSearcherResult extends BaseSearcherResult {
    universe;
    userInput;
    parts;
    signer;
    outputToken;
    constructor(universe, userInput, parts, signer, outputToken) {
        super(universe, userInput, parts.full, signer, outputToken);
        this.universe = universe;
        this.userInput = userInput;
        this.parts = parts;
        this.signer = signer;
        this.outputToken = outputToken;
    }
    async toTransaction(options = {}) {
        await this.setupApprovals();
        const tokens = new Map();
        const outputs = await this.parts.rtokenRedemption.steps[0].action.plan(this.planner, [
            new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [this.userInput.amount])),
        ], this.universe.config.addresses.executorAddress, [this.userInput]);
        for (let i = 0; i < this.parts.rtokenRedemption.steps[0].action.output.length; i++) {
            tokens.set(this.parts.rtokenRedemption.steps[0].action.output[i], [
                outputs[i],
            ]);
        }
        const executorAddress = this.universe.config.addresses.executorAddress;
        const tradeOutputs = new Map();
        for (const unwrapBasketTokenPath of this.parts.tokenBasketUnwrap) {
            for (const step of unwrapBasketTokenPath.steps) {
                let input = tokens.get(step.action.input[0]);
                if (input == null) {
                    throw new Error('MISSING INPUT');
                }
                const size = await step.action.plan(this.planner, input, executorAddress, step.inputs);
                tokens.set(step.outputs[0].token, size);
            }
        }
        for (const path of this.parts.tradesToOutput) {
            const input = tokens.get(path.inputs[0].token);
            for (const step of path.steps) {
                const out = await step.action.plan(this.planner, input, executorAddress, step.inputs);
                tradeOutputs.set(step.outputs[0].token, out[0]);
            }
        }
        const out = tradeOutputs.has(this.outputToken)
            ? tradeOutputs.get(this.outputToken)
            : Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, this.outputToken, executorAddress);
        Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, this.outputToken, out, this.signer);
        return this.createZapTransaction(options);
    }
}
exports.BurnRTokenSearcherResult = BurnRTokenSearcherResult;
const ONE = 10n ** 18n;
const ONE_Val = new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [ONE]));
class MintRTokenSearcherResult extends BaseSearcherResult {
    universe;
    userInput;
    parts;
    signer;
    outputToken;
    constructor(universe, userInput, parts, signer, outputToken) {
        super(universe, userInput, parts.full, signer, outputToken);
        this.universe = universe;
        this.userInput = userInput;
        this.parts = parts;
        this.signer = signer;
        this.outputToken = outputToken;
    }
    async toTransaction(options = {}) {
        await this.setupApprovals();
        const ethBalance = Planner_1.Contract.createContract(contracts_1.EthBalance__factory.connect(this.universe.config.addresses.ethBalanceOf.address, this.universe.provider));
        const zapperLib = Planner_1.Contract.createContract(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        const trades = new Map();
        for (const trade of this.parts.trading.swapPaths) {
            for (const step of trade.steps) {
                const inputsVal = new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [step.inputs[0].amount]));
                const output = await step.action.plan(this.planner, [inputsVal], this.universe.config.addresses.executorAddress, step.inputs);
                if (output.length === 0) {
                    throw new Error("Unexpected: Didn't get an output");
                }
                for (let i = 0; i < step.action.output.length; i++) {
                    trades.set(step.action.output[i], output[i]);
                }
            }
        }
        const totalUsedInMinting = new TokenAmounts_1.TokenAmounts();
        const numberOfUsers = new DefaultMap_1.DefaultMap(() => 0);
        for (const mintPath of this.parts.minting.swapPaths) {
            for (const step of mintPath.steps) {
                totalUsedInMinting.addQtys(step.inputs);
                numberOfUsers.set(step.inputs[0].token, numberOfUsers.get(step.inputs[0].token) + 1);
            }
        }
        if (totalUsedInMinting.get(this.inputToken).amount !== 0n) {
            trades.set(this.inputToken, Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, this.inputToken, this.universe.config.addresses.executorAddress));
        }
        for (const mintPath of this.parts.minting.swapPaths) {
            for (const step of mintPath.steps) {
                const inputToken = step.inputs[0].token;
                let actionInput = trades.get(inputToken);
                if (actionInput == null) {
                    throw new Error('NO INPUT');
                    continue;
                }
                const total = totalUsedInMinting.get(inputToken);
                if (total.amount !== step.inputs[0].amount) {
                    const currentUsersLeft = numberOfUsers.get(inputToken);
                    if (currentUsersLeft === 1) {
                        if (inputToken === this.universe.nativeToken) {
                            actionInput = this.planner.add(ethBalance.ethBalance(this.universe.config.addresses.executorAddress.address));
                        }
                        else {
                            actionInput = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                        }
                    }
                    else {
                        const fraction = (step.inputs[0].toScaled(ONE) * ONE) / total.toScaled(ONE);
                        actionInput = this.planner.add(zapperLib.fpMul(actionInput, fraction, ONE_Val), `${inputToken} * ${(0, utils_1.formatEther)(fraction)}`, `frac_${step.outputs[0].token.symbol}`);
                        numberOfUsers.set(inputToken, currentUsersLeft - 1);
                    }
                }
                const result = await step.action.plan(this.planner, [actionInput], this.universe.config.addresses.executorAddress, step.inputs);
                for (let i = 0; i < step.outputs.length; i++) {
                    trades.set(step.outputs[i].token, result[i]);
                }
            }
        }
        this.planner.add(zapperLib.mintMaxRToken(this.universe.config.addresses.facadeAddress.address, this.outputToken.address.address, this.signer.address), 'txGen,mint rToken via mintMaxRToken helper');
        return this.createZapTransaction(options);
    }
}
exports.MintRTokenSearcherResult = MintRTokenSearcherResult;
//# sourceMappingURL=SearcherResult.js.map