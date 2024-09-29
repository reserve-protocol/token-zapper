import { BigNumber } from '@ethersproject/bignumber';
import { constants } from 'ethers';
import { ParamType, defaultAbiCoder, hexlify, parseEther, randomBytes, } from 'ethers/lib/utils';
import { DestinationOptions, InteractionConvention, plannerUtils, } from '../action/Action';
import { Address } from '../base/Address';
import { DefaultMap } from '../base/DefaultMap';
import { parseHexStringIntoBuffer } from '../base/utils';
import { EmitId__factory, IERC20__factory, ZapperExecutor__factory, Zapper__factory, } from '../contracts';
import { PricedTokenQuantity, } from '../entities/Token';
import { TokenAmounts } from '../entities/TokenAmounts';
import { SwapPaths } from '../searcher/Swap';
import { Contract, LiteralValue, Planner, encodeArg, printPlan, } from '../tx-gen/Planner';
import { ZapTransaction, ZapTxStats } from './ZapTransaction';
import { MintRTokenAction } from '../action/RTokens';
const zapperInterface = Zapper__factory.createInterface();
const needsZeroedOutFirst = new Set([
    Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7'),
]);
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
export class ThirdPartyIssue extends Error {
    msg;
    constructor(msg) {
        super(msg);
        this.msg = msg;
    }
}
export class BaseSearcherResult {
    searcher;
    userInput;
    swaps;
    signer;
    outputToken;
    startTime;
    abortSignal;
    zapId = BigInt(hexlify(randomBytes(32)));
    planner = new Planner();
    blockNumber;
    commands;
    potentialResidualTokens;
    allApprovals;
    inputToken;
    inputIsNative;
    tokenPrices = new Map();
    async priceQty(qty) {
        const price = await this.fairPrice(qty);
        return new PricedTokenQuantity(qty, price);
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
            for (const token of step.action.approvals.map((i) => i.token).flat()) {
                potentialResidualTokens.add(token);
            }
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
        if (this.abortSignal.aborted) {
            throw new Error('Aborted');
        }
        const resp = await this.universe.simulateZapFn(opts);
        if (process.env.DEBUG_SIMULATION) {
            this.searcher.debugLog(printPlan(this.planner, this.universe).join('\n') + '\n\n\n');
        }
        // If the response starts with a pointer to the first location of the output tuple
        // when we know if can be decoded by the zapper interface
        if (resp.startsWith('0x0000000000000000000000000000000000000000000000000000000000000020')) {
            return zapperInterface.decodeFunctionResult('zapERC20', resp)
                .out;
        }
        let errorMsg = '';
        // console.log(printPlan(this.planner, this.universe).join('\n') + '\n\n\n')
        // Try and decode the error message
        if (resp.startsWith('0xef3dcb2f')) {
            // uint, address, _, uint, bytes...
            const cmdIdx = Number(BigInt('0x' + resp.slice(10, 10 + 64)));
            const addr = '0x' + resp.slice(10 + 64, 10 + 64 * 2);
            const errorMsgLen = Number(BigInt('0x' + resp.slice(10 + 64 * 3, 10 + 64 * 4)));
            const errorMsgCharsInHex = resp.slice(10 + 64 * 4, 10 + 64 * 4 + errorMsgLen * 2);
            const errorMsg2 = Buffer.from(errorMsgCharsInHex, 'hex').toString();
            const msg = `${cmdIdx}: failed calling '${addr}'. Error: '${errorMsg2}'`;
            errorMsg = msg;
        }
        else if (resp.startsWith('0x08c379a0')) {
            const errorMsgLen = Number(BigInt('0x' + resp.slice(10 + 64)));
            const errorMsgCharsInHex = resp.slice(10 + 64 + 64, 10 + 64 + 64 + errorMsgLen * 2);
            const msg = Buffer.from(errorMsgCharsInHex, 'hex').toString();
            if (msg.includes('LPStakingTime')) {
                errorMsg = 'Stargate out of funds';
            }
            else {
                errorMsg = msg;
            }
        }
        else {
            errorMsg = `Unknown error: ${resp}`;
            if (resp.length / 128 > 100) {
            }
            else {
                // Try and randomly see if we can find something that looks like a string 🙃
                for (let i = 10; i < resp.length; i += 128) {
                    const len = BigInt('0x' + resp.slice(i, i + 64));
                    if (len != 0n && len < 256n) {
                        const data = resp.slice(i + 64, i + 64 + Number(len) * 2);
                        const msg = Buffer.from(data, 'hex').toString();
                        errorMsg = msg;
                    }
                }
            }
        }
        this.searcher.debugLog('Simulation failed with:');
        this.searcher.debugLog(errorMsg);
        throw new Error(errorMsg);
    }
    async simulateAndParse(options, data) {
        const zapperResult = await this.simulate({
            to: this.universe.config.addresses.zapperAddress.address,
            from: this.signer.address,
            data,
            value: this.value,
            setup: {
                inputTokenAddress: this.inputToken.address.address,
                userBalanceAndApprovalRequirements: this.userInput.amount,
            },
        });
        const currentBalances = TokenAmounts.fromQuantities(await Promise.all(this.potentialResidualTokens.map((token) => this.searcher.universe.approvalsStore.queryBalance(token, this.universe.config.addresses.executorAddress, this.searcher.universe))));
        const dustQuantities = zapperResult.dust
            .map((qty, index) => this.potentialResidualTokens[index]
            .from(qty)
            .sub(currentBalances.get(this.potentialResidualTokens[index])))
            .filter((i) => i.token !== this.outputToken && i.amount > 1000n);
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
            swaps: new SwapPaths(this.universe, this.swaps.inputs, this.swaps.swapPaths, simulatedOutputs.map((i) => {
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
            if (await this.universe.approvalsStore.needsApproval(i.token, executorAddress, i.spender, constants.MaxUint256.div(2).toBigInt())) {
                approvalNeeded.push(i);
            }
        }));
        for (const approval of approvalNeeded) {
            const token = Contract.createContract(IERC20__factory.connect(approval.token.address.address, this.universe.provider));
            if (needsZeroedOutFirst.has(approval.token.address)) {
                this.planner.add(token.approve(approval.spender.address, 0));
            }
            this.planner.add(token.approve(approval.spender.address, constants.MaxUint256));
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
        tx = {
            ...tx,
            type: 2,
            maxFeePerGas: BigNumber.from(this.universe.gasPrice + this.universe.gasPrice / 12n),
        };
        return tx;
    }
    async createZapTransaction(options, fullyConsumed = new Set()) {
        const emitIdContract = Contract.createLibrary(EmitId__factory.connect(this.universe.config.addresses.emitId.address, this.universe.provider));
        this.planner.add(emitIdContract.emitId(this.zapId));
        try {
            const params = this.encodePayload(this.outputToken.from(1n), {
                ...options,
                returnDust: false,
            });
            const data = this.encodeCall(options, params);
            const tx = this.encodeTx(data, 1000000n);
            await this.checkIfSearchIsAborted();
            const result = await this.simulateAndParse(options, tx.data.toString());
            let dust = this.potentialResidualTokens.map((qty) => qty);
            if (options.returnDust === true) {
                for (const tok of dust) {
                    if (fullyConsumed.has(tok)) {
                        continue;
                    }
                    const balanceOfDust = plannerUtils.erc20.balanceOf(this.universe, this.planner, tok, this.universe.config.addresses.executorAddress);
                    plannerUtils.erc20.transfer(this.universe, this.planner, balanceOfDust, tok, this.signer);
                }
            }
            const finalParams = this.encodePayload(result.output, options);
            const outputTokenQty = this.outputToken.from(BigNumber.from(finalParams.amountOut));
            const dustOutputQtys = result.simulatedOutputs.filter((i) => i.token !== this.outputToken);
            const gasEstimate = result.gasUsed + result.gasUsed / 12n;
            if (gasEstimate === 0n) {
                throw new Error('Failed to estimate gas');
            }
            const stats = await this.universe.perf.measurePromise('ZapTxStats.create', ZapTxStats.create(this, {
                gasUnits: gasEstimate,
                input: this.userInput,
                output: outputTokenQty,
                dust: dustOutputQtys,
            }));
            this.swaps = new SwapPaths(this.swaps.universe, this.swaps.inputs, this.swaps.swapPaths, stats.outputs.map((i) => i.quantity), stats.valueUSD, this.swaps.destination);
            const finalTx = this.encodeTx(this.encodeCall(options, finalParams), gasEstimate);
            return await ZapTransaction.create(this, this.planner, {
                params: finalParams,
                tx: finalTx,
            }, stats);
        }
        catch (e) {
            if (this.abortSignal.aborted) {
                return null;
            }
            if (e instanceof ThirdPartyIssue) {
                throw e;
            }
            return null;
        }
    }
}
export class ZapViaATrade extends BaseSearcherResult {
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
            const out = plannerUtils.erc20.balanceOf(this.universe, this.planner, token, this.universe.config.addresses.executorAddress);
            plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        return this.createZapTransaction(options);
    }
}
export class RedeemZap extends BaseSearcherResult {
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
        const fullyConsumed = new Set();
        const redeemStep = this.parts.rtokenRedemption.steps[0];
        fullyConsumed.add(redeemStep.inputs[0].token);
        const outputs = await redeemStep.action.planWithOutput(this.universe, this.planner, [encodeArg(this.userInput.amount, ParamType.fromString('uint256'))], this.universe.config.addresses.executorAddress, [this.userInput]);
        const unwrapBalances = new Map();
        for (let i = 0; i < outputs.length; i++) {
            unwrapBalances.set(redeemStep.outputs[i].token, outputs[i]);
        }
        const executorAddress = this.universe.execAddress;
        const outToken = this.outputToken;
        for (const unwrapBasketTokenPath of this.parts.tokenBasketUnwrap) {
            for (const step of unwrapBasketTokenPath.steps) {
                const dest = outToken === step.action.outputToken[0]
                    ? this.signer
                    : executorAddress;
                let input = unwrapBalances.get(step.inputs[0].token);
                if (input == null) {
                    input = step.action.supportsDynamicInput
                        ? plannerUtils.erc20.balanceOf(this.universe, this.planner, step.inputs[0].token, executorAddress)
                        : encodeArg(step.inputs[0].amount, ParamType.from('uint256'));
                }
                if (step.action.supportsDynamicInput) {
                    fullyConsumed.add(step.inputs[0].token);
                }
                const result = await step.action.plan(this.planner, [input], dest, step.inputs);
                if (step.action.outputToken[0] === outToken) {
                    continue;
                }
                if (result != null) {
                    unwrapBalances.set(step.action.outputToken[0], result[0]);
                }
            }
        }
        const tradesToGenerate = this.parts.tradesToOutput;
        for (const path of tradesToGenerate) {
            for (const step of path.steps) {
                const dynInput = step.action.supportsDynamicInput;
                const stepInputQty = step.inputs[0];
                const stepInput = stepInputQty.token;
                let input = unwrapBalances.get(stepInput);
                if (input == null) {
                    input = dynInput
                        ? plannerUtils.erc20.balanceOf(this.universe, this.planner, stepInput, executorAddress)
                        : encodeArg(stepInputQty.amount - stepInputQty.amount / 1000000n, ParamType.from('uint256'));
                }
                await step.action.plan(this.planner, [input], this.signer, step.inputs);
            }
        }
        const bal = plannerUtils.erc20.balanceOf(this.universe, this.planner, outToken, executorAddress);
        plannerUtils.planForwardERC20(this.universe, this.planner, outToken, bal, this.signer);
        fullyConsumed.add(outToken);
        return this.createZapTransaction(options, fullyConsumed);
    }
}
const ONE = 10n ** 18n;
const ONE_Val = new LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [ONE]));
export class MintZap extends BaseSearcherResult {
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
        const fullyConsumed = new Set();
        try {
            const totalUsedInMinting = new TokenAmounts();
            const totalUsedInTrading = new TokenAmounts();
            const actionsUsingThisInputExcludingRTokenMint = new DefaultMap(() => new Set());
            const totalUsers = new DefaultMap(() => 0);
            const rTokenInputs = new Set();
            for (const paths of [
                ...this.parts.minting.swapPaths,
                this.parts.outputMint,
            ]) {
                for (const step of paths.steps) {
                    totalUsedInMinting.addQtys(step.inputs);
                }
            }
            for (const paths of this.parts.trading.swapPaths) {
                for (const step of paths.steps) {
                    totalUsedInTrading.addQtys(step.inputs);
                }
            }
            for (const paths of this.parts.full.swapPaths) {
                for (const step of paths.steps) {
                    for (const qty of step.inputs) {
                        const token = qty.token;
                        totalUsers.set(token, totalUsers.get(token) + 1);
                        if (step.action instanceof MintRTokenAction) {
                            rTokenInputs.add(token);
                        }
                        else {
                            actionsUsingThisInputExcludingRTokenMint.get(token).add(step);
                        }
                    }
                }
            }
            const mintingBalances = new TokenAmounts();
            if (this.parts.setup != null) {
                if (totalUsedInMinting.tokenBalances.has(this.parts.setup.inputs[0].token)) {
                    mintingBalances.tokenBalances.set(this.userInput.token, this.parts.setup.inputs[0]);
                }
            }
            else {
                if (totalUsedInMinting.tokenBalances.has(this.userInput.token)) {
                    mintingBalances.tokenBalances.set(this.userInput.token, this.userInput);
                }
            }
            const trades = new Map();
            await this.setupApprovals();
            const zapperLib = Contract.createLibrary(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const allTrades = this.parts.trading.swapPaths;
            const allSupportDynamicInput = allTrades.every((i) => i.supportsDynamicInput);
            const tradesToGenerate = allSupportDynamicInput
                ? allTrades
                : [
                    ...allTrades.filter((i) => !i.supportsDynamicInput),
                    ...allTrades.filter((i) => i.supportsDynamicInput),
                ];
            const dynamicTradeInputSplits = new Map();
            if (this.parts.setup != null) {
                this.planner.addComment('Setup section: change the input to make searcher results better');
                let input = [
                    new LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [this.parts.setup.inputs[0].amount])),
                ];
                for (let i = 0; i < this.parts.setup.inputs.length; i++) {
                    const step = this.parts.setup.steps[i];
                    let output = await step.action.planWithOutput(this.universe, this.planner, input, this.universe.config.addresses.executorAddress, this.parts.setup.inputs);
                    for (let j = 0; j < step.outputs.length; j++) {
                        const outputValue = output[j];
                        dynamicTradeInputSplits.set(step.action.outputToken[j], outputValue);
                        trades.set(step.action.outputToken[j], outputValue);
                    }
                }
            }
            this.planner.addComment('Trading section: input to precursor set');
            this.planner.addComment(`Expected input balances ${this.parts.trading.inputs.join(', ')}`);
            for (const trade of tradesToGenerate) {
                for (const step of trade.steps) {
                    await this.checkIfSearchIsAborted();
                    const tradeInput = step.inputs[0];
                    const inputToken = tradeInput.token;
                    // console.log('Subtracting ' + tradeInput + ' from input')
                    let inputsVal = new LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [tradeInput.amount]));
                    const qtyKnownAtCompileTime = inputToken === this.inputToken;
                    const supportsDynamicInput = step.action.supportsDynamicInput;
                    const usersLeft = actionsUsingThisInputExcludingRTokenMint.get(inputToken).size;
                    actionsUsingThisInputExcludingRTokenMint.get(inputToken).delete(step);
                    const needsToSplit = usersLeft > 1;
                    // If we're still sharing with others, split the input
                    if (!qtyKnownAtCompileTime) {
                        if (needsToSplit) {
                            const dynValue = dynamicTradeInputSplits.get(inputToken) ??
                                plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                            dynamicTradeInputSplits.set(inputToken, dynValue);
                            if (supportsDynamicInput) {
                                const total = totalUsedInTrading
                                    .get(inputToken)
                                    .add(totalUsedInMinting.get(inputToken));
                                const fractionTokenQty = step.inputs[0].div(total);
                                const fraction = fractionTokenQty.toScaled(ONE);
                                inputsVal = this.planner.add(zapperLib.fpMul(dynValue, fraction, ONE_Val), `${(fractionTokenQty.asNumber() * 100).toFixed(2)}% of ${inputToken} into ${step.action.toString()}`, `split_${step.outputs[0].token.symbol}`);
                            }
                        }
                        else {
                            if (supportsDynamicInput) {
                                // Last user gets to use the rest
                                inputsVal = plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress, `Rest of ${inputToken} into ${step.action.toString()}`);
                            }
                        }
                    }
                    if (!needsToSplit && !rTokenInputs.has(inputToken)) {
                        fullyConsumed.add(inputToken);
                    }
                    const outputs = await step.action
                        .plan(this.planner, [inputsVal], this.universe.config.addresses.executorAddress, step.inputs)
                        .catch((a) => {
                        console.log(`${step.action.toString()}.plan failed`);
                        console.log(a.stack);
                        throw a;
                    });
                    step.outputs.forEach((output, i) => {
                        const actionOut = outputs != null ? outputs[i] : null;
                        const usersLeft = actionsUsingThisInputExcludingRTokenMint.get(output.token).size;
                        if (usersLeft === 1 && actionOut) {
                            trades.set(output.token, actionOut);
                        }
                    });
                }
            }
            dynamicTradeInputSplits.clear();
            this.planner.addComment('Minting section: precusor set to basket');
            this.planner.addComment(`Expected input balances ${this.parts.trading.outputs.join(', ')}`);
            for (const mintPath of this.parts.minting.swapPaths) {
                for (const step of mintPath.steps) {
                    if (step.action instanceof MintRTokenAction) {
                        await step.action.plan(this.planner, step.inputs.map((i) => encodeArg(i.amount, ParamType.from('uint256'))), this.universe.config.addresses.executorAddress, step.inputs);
                        for (const outputToken of step.action.outputToken) {
                            trades.set(outputToken, plannerUtils.erc20.balanceOf(this.universe, this.planner, outputToken, this.universe.config.addresses.executorAddress));
                        }
                        continue;
                    }
                    const inputToken = step.action.inputToken[0];
                    let actionInput = encodeArg(step.inputs[0].amount, ParamType.from('uint256'));
                    const total = totalUsedInMinting.get(inputToken);
                    const inputQty = step.inputs[0];
                    const usersLeft = actionsUsingThisInputExcludingRTokenMint.get(inputToken).size;
                    actionsUsingThisInputExcludingRTokenMint.get(inputToken).delete(step);
                    const generateSplit = usersLeft > 1;
                    const amountIsKnowStatically = inputToken === this.inputToken && this.parts.setup == null;
                    if (!amountIsKnowStatically) {
                        if (!generateSplit) {
                            actionInput = plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                        }
                        else {
                            const dynValue = dynamicTradeInputSplits.get(inputToken) ??
                                plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                            dynamicTradeInputSplits.set(inputToken, dynValue);
                            const fraction = inputQty.div(total).asNumber();
                            const bnFact = parseEther(fraction.toFixed(18)).toBigInt();
                            actionInput = this.planner.add(zapperLib.fpMul(dynValue, bnFact, ONE_Val), `${(fraction * 100).toFixed(2)}% of ${inputToken} into ${step.action.toString()}`, `frac_${step.outputs[0].token.symbol}`);
                        }
                    }
                    if (!generateSplit &&
                        !rTokenInputs.has(inputToken) &&
                        step.action.approvals.length === 1) {
                        fullyConsumed.add(inputToken);
                    }
                    const result = await step.action
                        .plan(this.planner, [actionInput], this.universe.config.addresses.executorAddress, step.inputs)
                        .catch((a) => {
                        console.log(`${step.action.toString()}.plan failed`);
                        throw a;
                    });
                    if (result) {
                        for (let i = 0; i < step.outputs.length; i++) {
                            const outTok = step.outputs[i].token;
                            trades.set(outTok, result[i]);
                        }
                    }
                }
            }
            const thisAddr = this.universe.config.addresses.executorAddress;
            for (const step of this.parts.outputMint.steps) {
                const destAddr = step.action.outputToken.includes(this.outputToken)
                    ? this.signer
                    : thisAddr;
                await step.action.plan(this.planner, step.inputs.map((i) => {
                    let out = trades.get(i.token);
                    if (out == null) {
                        if (step.action.supportsDynamicInput) {
                            out = plannerUtils.erc20.balanceOf(this.universe, this.planner, i.token, thisAddr);
                        }
                        else {
                            out = encodeArg(i.amount, ParamType.from('uint256'));
                        }
                    }
                    return out;
                }), destAddr, step.inputs);
                if (!(step.action instanceof MintRTokenAction)) {
                    for (const inputToken of step.action.inputToken) {
                        fullyConsumed.add(inputToken);
                    }
                }
            }
            for (const input of rTokenInputs) {
                fullyConsumed.delete(input);
            }
            if (this.parts.outputMint.proceedsOptions === DestinationOptions.Recipient) {
                fullyConsumed.add(this.outputToken);
            }
            return await this.createZapTransaction(options, fullyConsumed);
        }
        catch (e) {
            return null;
        }
    }
}
//# sourceMappingURL=SearcherResult.js.map