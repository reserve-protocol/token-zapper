"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintZap = exports.RedeemZap = exports.ZapViaATrade = exports.BaseSearcherResult = exports.ThirdPartyIssue = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const Action_1 = require("../action/Action");
const DefaultMap_1 = require("../base/DefaultMap");
const utils_2 = require("../base/utils");
const contracts_1 = require("../contracts");
const Token_1 = require("../entities/Token");
const TokenAmounts_1 = require("../entities/TokenAmounts");
const Swap_1 = require("../searcher/Swap");
const Planner_1 = require("../tx-gen/Planner");
const ZapTransaction_1 = require("./ZapTransaction");
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
    searcher;
    userInput;
    swaps;
    signer;
    outputToken;
    startTime;
    abortSignal;
    zapId = BigInt((0, utils_1.hexlify)((0, utils_1.randomBytes)(32)));
    planner = new Planner_1.Planner();
    blockNumber;
    commands;
    potentialResidualTokens;
    allApprovals;
    inputToken;
    inputIsNative;
    tokenPrices = new Map();
    async priceQty(qty) {
        const price = await this.fairPrice(qty);
        return new Token_1.PricedTokenQuantity(qty, price);
    }
    async fairPrice(qty) {
        const out = await this.universe.fairPrice(qty);
        if (out != null) {
            const unitPrice = qty.amount === qty.token.scale ? out : out.div(qty.into(out.token));
            this.tokenPrices.set(qty.token, unitPrice);
        }
        return out;
    }
    identity() {
        return this.describe().join('\n');
    }
    async checkIfSearchIsAborted() {
        if (this.abortSignal.aborted) {
            //   throw new Error('Aborted')
        }
    }
    universe;
    constructor(searcher, userInput, swaps, signer, outputToken, startTime, abortSignal) {
        this.searcher = searcher;
        this.userInput = userInput;
        this.swaps = swaps;
        this.signer = signer;
        this.outputToken = outputToken;
        this.startTime = startTime;
        this.abortSignal = abortSignal;
        this.universe = searcher.universe;
        if (this.universe.commonTokens.ERC20GAS == null) {
            throw new Error('Unexpected: Missing wrapped gas token');
        }
        const inputToken = this.swaps.inputs[0].token === this.universe.nativeToken
            ? this.universe.commonTokens.ERC20GAS
            : this.swaps.inputs[0].token;
        this.inputToken = inputToken;
        this.blockNumber = this.universe.currentBlock;
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
    async simulate(opts) {
        const resp = await this.universe.simulateZapFn(opts);
        // If the response starts with a pointer to the first location of the output tuple
        // when we know if can be decoded by the zapper interface
        if (resp.startsWith('0x0000000000000000000000000000000000000000000000000000000000000020')) {
            return zapperInterface.decodeFunctionResult('zapERC20', resp)
                .out;
        }
        // console.log({
        //   block: this.blockNumber,
        //   data: opts.data,
        //   value: opts.value,
        //   to: opts.to,
        //   from: opts.from,
        // })
        // console.log(
        //   `STARTIG_INITIAL_SIMULATION: ${this.userInput} -> ${this.outputToken}`
        // )
        // console.log(printPlan(this.planner, this.universe).join('\n') + '\n\n\n')
        // console.log(resp)
        // Try and decode the error message
        if (resp.startsWith('0xef3dcb2f')) {
            // uint, address, _, uint, bytes...
            const cmdIdx = Number(BigInt('0x' + resp.slice(10, 10 + 64)));
            const addr = '0x' + resp.slice(10 + 64, 10 + 64 * 2);
            const errorMsgLen = Number(BigInt('0x' + resp.slice(10 + 64 * 3, 10 + 64 * 4)));
            const errorMsgCharsInHex = resp.slice(10 + 64 * 4, 10 + 64 * 4 + errorMsgLen * 2);
            const errorMsg = Buffer.from(errorMsgCharsInHex, 'hex').toString();
            const msg = `${cmdIdx}: failed calling '${addr}'. Error: '${errorMsg}'`;
            // console.error(msg)
            throw new Error(msg);
        }
        else if (resp.startsWith('0x08c379a0')) {
            const errorMsgLen = Number(BigInt('0x' + resp.slice(10 + 64)));
            const errorMsgCharsInHex = resp.slice(10 + 64 + 64, 10 + 64 + 64 + errorMsgLen * 2);
            const msg = Buffer.from(errorMsgCharsInHex, 'hex').toString();
            if (msg.includes('LPStakingTime')) {
                console.error('Stargate staking contract out of funds.. Aborting');
                throw new ThirdPartyIssue('Stargate out of funds');
            }
            throw new Error(msg);
        }
        else {
            if (resp.length / 128 > 100) {
                throw new Error('Failed to decode response');
            }
            // Try and randomly see if we can find something that looks like a string 🙃
            for (let i = 10; i < resp.length; i += 128) {
                const len = BigInt('0x' + resp.slice(i, i + 64));
                if (len != 0n && len < 256n) {
                    const data = resp.slice(i + 64, i + 64 + Number(len) * 2);
                    const msg = Buffer.from(data, 'hex').toString();
                    throw new Error(msg);
                }
            }
            throw new Error(`Failed for unknown reasons: '${resp}`);
        }
    }
    async simulateAndParse(options, data) {
        // console.log(
        //   `STARTIG_INITIAL_SIMULATION: ${this.userInput} -> ${this.outputToken}`
        // )
        // console.log(printPlan(this.planner, this.universe).join('\n') + '\n\n\n')
        const zapperResult = await this.universe.perf.measurePromise('Zap Simulation', this.simulate({
            to: this.universe.config.addresses.zapperAddress.address,
            from: this.signer.address,
            data,
            value: this.value,
            setup: {
                inputTokenAddress: this.inputToken.address.address,
                userBalanceAndApprovalRequirements: this.userInput.amount,
            },
        }));
        const dustQuantities = zapperResult.dust
            .map((qty, index) => this.potentialResidualTokens[index].from(qty))
            .filter((i) => i.token !== this.outputToken && i.amount !== 0n);
        const amount = zapperResult.amountOut.toBigInt();
        const outputTokenOutput = this.outputToken.from(amount);
        // console.log(
        //   `INITIAL_SIMULATION_OK: ${this.userInput} -> ${outputTokenOutput} + (${dustQuantities.join(", ")})`
        // )
        const [valueOfOut, ...dustValues] = await this.universe.perf.measurePromise('value dust', Promise.all([
            this.fairPrice(outputTokenOutput),
            ...dustQuantities.map(async (i) => [await this.fairPrice(i), i]),
        ]));
        // console.log(`${outputTokenOutput} => ${valueOfOut} `)
        let valueOfDust = this.universe.usd.zero;
        for (const [usdValue] of dustValues) {
            if (usdValue == null) {
                // console.info(`Failed to find a price for ${dustQuantity}`)
                continue;
            }
            valueOfDust = valueOfDust.add(usdValue);
        }
        const simulatedOutputs = [...dustQuantities, outputTokenOutput];
        const totalValue = valueOfOut?.add(valueOfDust) ?? valueOfDust;
        const gasUsed = zapperResult.gasUsed.toBigInt();
        return {
            gasUsed: gasUsed + 100000n + gasUsed / 10n,
            simulatedOutputs,
            totalValue,
            swaps: new Swap_1.SwapPaths(this.universe, this.swaps.inputs, this.swaps.swapPaths, simulatedOutputs.map((i) => {
                return i.token.from(i.amount - i.amount / (options.outputSlippage ?? 250000n));
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
            await this.checkIfSearchIsAborted();
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
            const token = Planner_1.Contract.createContract(contracts_1.IERC20__factory.connect(approval.token.address.address, this.universe.provider));
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
            amountOut: outputTokenOutput.amount === 1n
                ? 1n
                : outputTokenOutput.amount -
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
        tx = {
            ...tx,
            type: 2,
            maxFeePerGas: bignumber_1.BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
        };
        return tx;
    }
    async createZapTransaction(options) {
        const emitIdContract = Planner_1.Contract.createLibrary(contracts_1.EmitId__factory.connect(this.universe.config.addresses.emitId.address, this.universe.provider));
        this.planner.add(emitIdContract.emitId(this.zapId));
        try {
            const params = this.encodePayload(this.outputToken.from(1n), {
                ...options,
                returnDust: false,
            });
            const data = this.encodeCall(options, params);
            const tx = this.encodeTx(data, 3000000n);
            await this.checkIfSearchIsAborted();
            // console.log(params)
            const result = await this.simulateAndParse(options, tx.data.toString());
            let dust = this.potentialResidualTokens.map((qty) => qty);
            if (options.returnDust === true) {
                for (const tok of dust) {
                    const balanceOfDust = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, tok, this.universe.config.addresses.executorAddress);
                    Action_1.plannerUtils.erc20.transfer(this.universe, this.planner, balanceOfDust, tok, this.signer);
                }
            }
            const finalParams = this.encodePayload(result.output, options);
            const outputTokenQty = this.outputToken.from(bignumber_1.BigNumber.from(finalParams.amountOut));
            const dustOutputQtys = result.simulatedOutputs.filter((i) => i.token !== this.outputToken);
            const gasEstimate = result.gasUsed + result.gasUsed / 12n;
            if (gasEstimate === 0n) {
                throw new Error('Failed to estimate gas');
            }
            const stats = await this.universe.perf.measurePromise('ZapTxStats.create', ZapTransaction_1.ZapTxStats.create(this, {
                gasUnits: gasEstimate,
                input: this.userInput,
                output: outputTokenQty,
                dust: dustOutputQtys,
            }));
            this.swaps = new Swap_1.SwapPaths(this.swaps.universe, this.swaps.inputs, this.swaps.swapPaths, stats.outputs.map((i) => i.quantity), stats.valueUSD, this.swaps.destination);
            const finalTx = this.encodeTx(this.encodeCall(options, finalParams), gasEstimate);
            return await ZapTransaction_1.ZapTransaction.create(this, this.planner, {
                params: finalParams,
                tx: finalTx,
            }, stats);
        }
        catch (e) {
            // console.log(`${this.userInput} -> ${this.outputToken}`)
            if (e instanceof ThirdPartyIssue) {
                throw e;
            }
            throw e;
        }
    }
}
exports.BaseSearcherResult = BaseSearcherResult;
class ZapViaATrade extends BaseSearcherResult {
    async toTransaction(options = {}) {
        await this.setupApprovals().catch((a) => {
            throw a;
        });
        for (const step of this.swaps.swapPaths[0].steps) {
            await this.checkIfSearchIsAborted();
            await step.action
                .plan(this.planner, [], this.signer, [this.userInput])
                .catch((a) => {
                console.log(`${step.action.toString()}.plan failed`);
                console.log(a.stack);
                throw a;
            });
        }
        for (const token of this.potentialResidualTokens) {
            const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, token, this.universe.config.addresses.executorAddress);
            Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        return this.createZapTransaction(options);
    }
}
exports.ZapViaATrade = ZapViaATrade;
class RedeemZap extends BaseSearcherResult {
    searcher;
    userInput;
    parts;
    signer;
    outputToken;
    startTime;
    abortSignal;
    constructor(searcher, userInput, parts, signer, outputToken, startTime, abortSignal) {
        super(searcher, userInput, parts.full, signer, outputToken, startTime, abortSignal);
        this.searcher = searcher;
        this.userInput = userInput;
        this.parts = parts;
        this.signer = signer;
        this.outputToken = outputToken;
        this.startTime = startTime;
        this.abortSignal = abortSignal;
    }
    async toTransaction(options = {}) {
        await this.setupApprovals();
        const unwrapBalances = new Map();
        await this.checkIfSearchIsAborted();
        const outputs = await this.parts.rtokenRedemption.steps[0].action
            .planWithOutput(this.universe, this.planner, [(0, Planner_1.encodeArg)(this.userInput.amount, utils_1.ParamType.fromString('uint256'))], this.universe.config.addresses.executorAddress, [this.userInput])
            .catch((a) => {
            console.log(`${this.parts.rtokenRedemption.steps[0].action.toString()}.plan failed`);
            console.log(a.stack);
            throw a;
        });
        if (outputs == null) {
            throw new Error('MISSING OUTPUTS');
        }
        const outputTokens = this.parts.rtokenRedemption.steps[0].action.outputToken;
        for (let i = 0; i < outputTokens.length; i++) {
            unwrapBalances.set(outputTokens[i], outputs[i]);
        }
        const executorAddress = this.universe.config.addresses.executorAddress;
        const tradeOutputs = new Map();
        for (const unwrapBasketTokenPath of this.parts.tokenBasketUnwrap) {
            for (const step of unwrapBasketTokenPath.steps) {
                await this.checkIfSearchIsAborted();
                const prev = unwrapBalances.get(step.inputs[0].token);
                let input = prev == null
                    ? step.inputs.map((t) => Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, t.token, executorAddress))
                    : [prev];
                if (input == null) {
                    throw new Error('MISSING INPUT');
                }
                const size = await step.action
                    .plan(this.planner, input, executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    console.log(a.stack);
                    throw a;
                });
                if (size != null) {
                    for (let i = 0; i < step.outputs.length; i++) {
                        unwrapBalances.set(step.outputs[i].token, size[i]);
                    }
                }
            }
        }
        const allSupportDynamicInput = this.parts.tradesToOutput.every((i) => i.supportsDynamicInput);
        const tradesToGenerate = allSupportDynamicInput
            ? this.parts.tradesToOutput
            : [
                ...this.parts.tradesToOutput.filter((i) => !i.supportsDynamicInput),
                ...this.parts.tradesToOutput.filter((i) => i.supportsDynamicInput),
            ];
        const tradeInputs = new Map();
        for (const path of tradesToGenerate) {
            for (const step of path.steps) {
                await this.checkIfSearchIsAborted();
                const input = path.inputs.map((t) => tradeInputs.get(t.token) ??
                    (0, Planner_1.encodeArg)(t.amount, utils_1.ParamType.from('uint256')));
                const outputs = await step.action
                    .planWithOutput(this.universe, this.planner, input, executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    console.log(a.stack);
                    throw a;
                });
                for (let i = 0; i < step.outputs.length; i++) {
                    tradeOutputs.set(step.outputs[i].token, outputs[i]);
                }
            }
        }
        const outs = new Set();
        for (const [token] of unwrapBalances) {
            tradeOutputs.delete(token);
            outs.add(token);
            const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, token, executorAddress);
            Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        for (const [token] of tradeOutputs) {
            if (outs.has(token)) {
                continue;
            }
            outs.add(token);
            const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, token, executorAddress);
            Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        if (!outs.has(this.outputToken)) {
            const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, this.outputToken, executorAddress);
            Action_1.plannerUtils.planForwardERC20(this.universe, this.planner, this.outputToken, out, this.signer);
        }
        return this.createZapTransaction(options);
    }
}
exports.RedeemZap = RedeemZap;
const ONE = 10n ** 18n;
const ONE_Val = new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [ONE]));
class MintZap extends BaseSearcherResult {
    searcher;
    userInput;
    parts;
    signer;
    outputToken;
    startTime;
    abortSignal;
    constructor(searcher, userInput, parts, signer, outputToken, startTime, abortSignal) {
        super(searcher, userInput, parts.full, signer, outputToken, startTime, abortSignal);
        this.searcher = searcher;
        this.userInput = userInput;
        this.parts = parts;
        this.signer = signer;
        this.outputToken = outputToken;
        this.startTime = startTime;
        this.abortSignal = abortSignal;
    }
    async toTransaction(options = {}) {
        try {
            const totalUsedInMinting = new TokenAmounts_1.TokenAmounts();
            const numberOfUsers = new DefaultMap_1.DefaultMap(() => 0);
            const totalUsers = new DefaultMap_1.DefaultMap(() => 0);
            for (const mintPath of this.parts.minting.swapPaths) {
                for (const step of mintPath.steps) {
                    totalUsedInMinting.addQtys(step.inputs);
                    for (const { token } of step.inputs) {
                        numberOfUsers.set(token, numberOfUsers.get(token) + 1);
                        totalUsers.set(token, totalUsers.get(token) + 1);
                    }
                }
            }
            const mintingBalances = new TokenAmounts_1.TokenAmounts();
            if (totalUsedInMinting.tokenBalances.has(this.userInput.token)) {
                mintingBalances.tokenBalances.set(this.userInput.token, this.userInput);
            }
            const tradingBalances = new TokenAmounts_1.TokenAmounts();
            tradingBalances.add(this.userInput);
            const trades = new Map();
            await this.setupApprovals();
            const zapperLib = Planner_1.Contract.createLibrary(contracts_1.ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const allBalanceValues = new Map();
            allBalanceValues.set(this.userInput.token, (0, Planner_1.encodeArg)(this.userInput.amount, utils_1.ParamType.from('uint256')));
            const tradeBalanceValues = new Map();
            tradeBalanceValues.set(this.userInput.token, (0, Planner_1.encodeArg)(this.userInput.amount, utils_1.ParamType.from('uint256')));
            const splitTrades = new DefaultMap_1.DefaultMap(() => 0);
            const splitTradesUsed = new DefaultMap_1.DefaultMap(() => 0);
            const splitTradesTotal = new DefaultMap_1.DefaultMap((t) => t.zero);
            const allTrades = this.parts.trading.swapPaths;
            const allSupportDynamicInput = allTrades.every((i) => i.supportsDynamicInput);
            const tradesToGenerate = allSupportDynamicInput
                ? allTrades
                : [
                    ...allTrades.filter((i) => !i.supportsDynamicInput),
                    ...allTrades.filter((i) => i.supportsDynamicInput),
                ];
            for (const trade of tradesToGenerate) {
                const current = splitTrades.get(trade.outputs[0].token);
                const curretAmtUsed = splitTradesTotal.get(trade.outputs[0].token);
                splitTrades.set(trade.outputs[0].token, current + 1);
                splitTradesTotal.set(trade.outputs[0].token, curretAmtUsed.add(trade.outputs[0]));
            }
            for (const trade of tradesToGenerate) {
                for (const step of trade.steps) {
                    await this.checkIfSearchIsAborted();
                    const tradeInput = step.inputs[0];
                    const inputToken = tradeInput.token;
                    // console.log('Subtracting ' + tradeInput + ' from input')
                    let inputsVal = new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [tradeInput.amount]));
                    const users = splitTrades.get(inputToken);
                    const previousTradeGeneratingThisInput = trades.get(inputToken);
                    if (previousTradeGeneratingThisInput != null && users >= 2) {
                        inputsVal = previousTradeGeneratingThisInput;
                        splitTradesUsed.set(inputToken, splitTradesUsed.get(inputToken) + 1);
                        // If we're still sharing with others, split the input
                        if (splitTradesUsed.get(inputToken) !== users) {
                            const total = parseFloat(splitTradesTotal.get(inputToken).format());
                            const fraction = parseFloat(step.inputs[0].format()) / total;
                            inputsVal = this.planner.add(zapperLib.fpMul(inputsVal, (0, utils_1.parseEther)(fraction.toFixed(18)), ONE_Val), `split ${fraction}%`, `frac_${step.outputs[0].token.symbol}`);
                        }
                        else {
                            // Last user gets to use the rest
                            inputsVal = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress, 'LAST?');
                        }
                    }
                    const outputs = await step.action
                        .planWithOutput(this.universe, this.planner, [inputsVal], this.universe.config.addresses.executorAddress, step.inputs)
                        .catch((a) => {
                        console.log(`${step.action.toString()}.plan failed`);
                        console.log(a.stack);
                        throw a;
                    });
                    if (outputs == null || outputs.length === 0) {
                        throw new Error('TRADES MUST GENERATE OUTPUTS: ' + step.action.toString());
                    }
                    step.inputs.forEach((input, i) => {
                        tradingBalances.sub(input);
                    });
                    step.outputs.forEach((output, i) => {
                        tradingBalances.add(output);
                        trades.set(output.token, outputs[i]);
                    });
                }
            }
            for (const input of [
                ...new Set([
                    ...this.parts.minting.inputs,
                    ...(this.parts.minting.swapPaths[0]?.inputs ?? []),
                ].map((i) => i.token)),
            ]) {
                trades.set(input, Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, input, this.universe.config.addresses.executorAddress));
            }
            for (const mintPath of this.parts.minting.swapPaths) {
                for (const step of mintPath.steps) {
                    await this.checkIfSearchIsAborted();
                    const inputToken = step.inputs[0].token;
                    let actionInput = trades.get(inputToken);
                    if (actionInput == null) {
                        throw new Error('NO INPUT');
                    }
                    const total = totalUsedInMinting.get(inputToken);
                    const inputQty = step.inputs[0];
                    const usersLeft = numberOfUsers.get(inputToken);
                    const usersTotal = totalUsers.get(inputToken);
                    if (usersTotal != 1) {
                        if (usersLeft === 1) {
                            actionInput = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                        }
                        else {
                            const fraction = parseFloat(inputQty.format()) / parseFloat(total.format());
                            actionInput = this.planner.add(zapperLib.fpMul(actionInput, (0, utils_1.parseEther)(fraction.toFixed(18)), ONE_Val), `${fraction * 100}% ${inputToken}`, `frac_${step.outputs[0].token.symbol}`);
                            numberOfUsers.set(inputToken, usersLeft - 1);
                        }
                    }
                    const result = await step.action
                        .planWithOutput(this.universe, this.planner, [actionInput], this.universe.config.addresses.executorAddress, step.inputs)
                        .catch((a) => {
                        console.log(`${step.action.toString()}.plan failed`);
                        throw a;
                    });
                    if (result.length !== step.outputs.length) {
                        throw new Error('MINT MUST GENERATE ALL OUTPUTS');
                    }
                    for (let i = 0; i < step.outputs.length; i++) {
                        trades.set(step.outputs[i].token, result[i]);
                    }
                }
            }
            for (const step of this.parts.rTokenMint.steps) {
                await step.action.plan(this.planner, step.inputs.map((i) => trades.get(i.token)), this.signer, step.inputs);
            }
        }
        catch (e) {
            console.log('ToTransaction failed:');
            console.log(e.stack);
            throw e;
        }
        return await this.createZapTransaction(options);
    }
}
exports.MintZap = MintZap;
//# sourceMappingURL=SearcherResult.js.map