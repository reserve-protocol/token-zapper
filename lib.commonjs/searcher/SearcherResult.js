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
const constants_1 = require("../base/constants");
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
    toId() {
        return this.describe().join('\n');
    }
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
        await Promise.all(this.swaps.outputs.map(async (out) => {
            if (out.token === this.outputToken) {
                return;
            }
            const price = (await this.universe.fairPrice(out)) ?? this.universe.usd.zero;
            sum = sum.add(price);
        }));
        return sum;
    }
    async simulateNoNode({ data, value }) {
        try {
            const resp = await this.universe.provider.send('eth_call', [
                {
                    data,
                    from: this.signer.address,
                    to: this.universe.config.addresses.zapperAddress.address,
                    value: '0x' + value.toString(16),
                },
                'latest',
                {
                    [this.signer.address]: {
                        balance: '0x' + ethers_1.ethers.utils.parseEther('10000').toBigInt().toString(16),
                    },
                },
            ]);
            try {
                return zapperInterface.decodeFunctionResult('zapERC20', resp)
                    .out;
            }
            catch (e) {
                // console.log(
                //   {
                //     data,
                //     from: this.signer.address,
                //     to: this.universe.config.addresses.zapperAddress.address,
                //     value: value.toString(16),
                //   },
                //   'latest',
                //   {
                //     [this.signer.address]: {
                //       balance: ethers.utils.parseEther('10000').toHexString(),
                //     },
                //   }
                // )
                // console.log(resp)
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
            // console.log(e)
            if (e.message.includes('LPStakingTime')) {
                console.error('Stargate staking contract out of funds.. Aborting');
                throw new ThirdPartyIssue('Stargate out of funds');
            }
            // console.log(
            //   // 'error:',
            //   // e.message,
            //   'Failing program:',
            //   printPlan(this.planner, this.universe)
            //     .map((i) => '  ' + i)
            //     .join('\n')
            // )
        }
        // console.log(
        //   JSON.stringify({
        //     data,
        //     value: value.toString(),
        //     address: this.universe.zapperAddress.address,
        //     from: this.signer.address,
        //     block: this.blockNumber,
        //   })
        // )
        throw new Error('Failed to simulate');
    }
    async simulate({ data, value, quantity, inputToken, gasLimit = 10000000, }) {
        const url = constants_1.simulationUrls[this.universe.chainId];
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
                // console.log(a)
                if (a.error != null) {
                    throw new Error(a.error);
                }
                if (a.data.startsWith('0x08c379a0')) {
                    const length = BigInt('0x' + a.data.slice(10, 74));
                    const data = a.data.slice(74, 74 + Number(length) * 2);
                    const msg = Buffer.from(data, 'hex').toString();
                    throw new Error(msg);
                }
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
            // console.log(e)
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
        const amount = zapperResult.amountOut.toBigInt();
        const rounding = 10n ** BigInt(this.outputToken.decimals / 2);
        const outputTokenOutput = this.outputToken.from((amount / rounding) * rounding);
        const [valueOfOut, ...dustValues] = await Promise.all([
            this.universe.fairPrice(outputTokenOutput),
            ...dustQuantities.map(async (i) => [await this.universe.fairPrice(i), i]),
        ]);
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
                if (i.token === this.outputToken) {
                    const slippage = outputTokenOutput.amount -
                        ((options.outputSlippage ?? 0n) * outputTokenOutput.amount) /
                            10000n;
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
    async createZapTransaction(options) {
        try {
            const params = this.encodePayload(this.swaps.outputs[0].token.from(1n), {
                ...options,
                returnDust: false,
            });
            const data = this.encodeCall(options, params);
            const tx = this.encodeTx(data, 300000n);
            // console.log(printPlan(this.planner, this.universe).join('\n'))
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
            const stats = await ZapTransaction_1.ZapTxStats.create(this.universe, {
                gasUnits: gasEstimate,
                input: this.userInput,
                output: outputTokenQty,
                dust: dustOutputQtys,
            });
            this.swaps = new Swap_1.SwapPaths(this.swaps.universe, this.swaps.inputs, this.swaps.swapPaths, stats.outputs.map((i) => i.quantity), stats.valueUSD, this.swaps.destination);
            const finalTx = this.encodeTx(this.encodeCall(options, finalParams), gasEstimate);
            return ZapTransaction_1.ZapTransaction.create(this, this.planner, {
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
class TradeSearcherResult extends BaseSearcherResult {
    async toTransaction(options = {}) {
        await this.setupApprovals().catch((a) => {
            console.log('approvals failed');
            throw a;
        });
        for (const step of this.swaps.swapPaths[0].steps) {
            await step.action
                .plan(this.planner, [], this.signer, [this.userInput])
                .catch((a) => {
                console.log(`${step.action.toString()}.plan failed`);
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
        const outputs = await this.parts.rtokenRedemption.steps[0].action
            .plan(this.planner, [
            new Planner_1.LiteralValue(utils_1.ParamType.fromString('uint256'), utils_1.defaultAbiCoder.encode(['uint256'], [this.userInput.amount])),
        ], this.universe.config.addresses.executorAddress, [this.userInput])
            .catch((a) => {
            console.log(`${this.parts.rtokenRedemption.steps[0].action.toString()}.plan failed`);
            throw a;
        });
        for (let i = 0; i < this.parts.rtokenRedemption.steps[0].action.outputToken.length; i++) {
            tokens.set(this.parts.rtokenRedemption.steps[0].action.outputToken[i], [
                outputs[i],
            ]);
        }
        const executorAddress = this.universe.config.addresses.executorAddress;
        const tradeOutputs = new Map();
        for (const unwrapBasketTokenPath of this.parts.tokenBasketUnwrap) {
            for (const step of unwrapBasketTokenPath.steps) {
                let input = tokens.get(step.action.inputToken[0]);
                if (input == null) {
                    throw new Error('MISSING INPUT');
                }
                const size = await step.action
                    .plan(this.planner, input, executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    throw a;
                });
                tokens.set(step.outputs[0].token, size);
            }
        }
        for (const path of this.parts.tradesToOutput) {
            const input = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, path.steps[0].inputs[0].token, executorAddress);
            for (const step of path.steps) {
                const out = await step.action
                    .plan(this.planner, [input], executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    throw a;
                });
                tradeOutputs.set(step.outputs[0].token, out[0]);
            }
        }
        const out = Action_1.plannerUtils.erc20.balanceOf(this.universe, this.planner, this.outputToken, executorAddress);
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
                const output = await step.action
                    .plan(this.planner, [inputsVal], this.universe.config.addresses.executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    throw a;
                });
                if (output.length === 0) {
                    throw new Error("Unexpected: Didn't get an output");
                }
                for (let i = 0; i < step.action.outputToken.length; i++) {
                    trades.set(step.action.outputToken[i], output[i]);
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
                const result = await step.action
                    .plan(this.planner, [actionInput], this.universe.config.addresses.executorAddress, step.inputs)
                    .catch((a) => {
                    console.log(`${step.action.toString()}.plan failed`);
                    throw a;
                });
                for (let i = 0; i < step.outputs.length; i++) {
                    trades.set(step.outputs[i].token, result[i]);
                }
            }
        }
        this.planner.add(this.universe.weirollZapperExec.mintMaxRToken(this.universe.config.addresses.oldFacadeAddress.address, this.outputToken.address.address, this.signer.address), 'txGen,mint rToken via mintMaxRToken helper');
        return this.createZapTransaction(options);
    }
}
exports.MintRTokenSearcherResult = MintRTokenSearcherResult;
//# sourceMappingURL=SearcherResult.js.map