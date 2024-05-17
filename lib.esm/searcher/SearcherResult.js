import { BigNumber } from '@ethersproject/bignumber';
import { constants, ethers } from 'ethers';
import { ParamType, defaultAbiCoder, parseEther } from 'ethers/lib/utils';
import { DestinationOptions, InteractionConvention, plannerUtils, } from '../action/Action';
import { DefaultMap } from '../base/DefaultMap';
import { simulationUrls } from '../base/constants';
import { parseHexStringIntoBuffer } from '../base/utils';
import { IERC20__factory, ZapperExecutor__factory, Zapper__factory, } from '../contracts';
import { TokenAmounts } from '../entities/TokenAmounts';
import { SwapPaths } from '../searcher/Swap';
import { Contract, LiteralValue, Planner, encodeArg, } from '../tx-gen/Planner';
import { ZapTransaction, ZapTxStats } from './ZapTransaction';
const zapperInterface = Zapper__factory.createInterface();
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
const whales = new Map();
whales.set(1, {
    // weth
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
    // dai
    '0x6b175474e89094c44da98b954eedeac495271d0f': '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
    // wbtc
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
    // usdt
    '0xdac17f958d2ee523a2206206994597c13d831ec7': '0xf977814e90da44bfa03b6295a0616a897441acec',
    // usdc
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '0xd6153f5af5679a75cc85d8974463545181f48772',
    // mim
    '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3': '0x25431341a5800759268a6ac1d3cd91c029d7d9ca',
    // frax
    '0x853d955acef822db058eb8505911ed77f175b99e': '0x267fc49a3170950ee5d49ef84878695c29cca1e0',
    // eusd
    '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f': '0x3154cf16ccdb4c6d922629664174b904d80f2c35',
    // eth+
    '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8': '0x7cc1bfab73be4e02bb53814d1059a98cf7e49644',
    // hyusd+
    '0xacdf0dba4b9839b96221a8487e9ca660a48212be': '0x8a8434a5952ac2cf4927bbea3ace255c6dd165cd',
    // usdc+
    '0xfc0b1eef20e4c68b3dcf36c4537cfa7ce46ca70b': '0xf2b25362a03f6eacca8de8d5350a9f37944c1e59',
    // usd3
    '0x0d86883faf4ffd7aeb116390af37746f45b6f378': '0x7cc1bfab73be4e02bb53814d1059a98cf7e49644',
    // pyusd
    '0x6c3ea9036406852006290770bedfcaba0e23a0e8': '0xa5588f7cdf560811710a2d82d3c9c99769db1dcb',
});
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
    universe;
    userInput;
    swaps;
    signer;
    outputToken;
    startTime;
    abortSignal;
    planner = new Planner();
    blockNumber;
    commands;
    potentialResidualTokens;
    allApprovals;
    inputToken;
    inputIsNative;
    toId() {
        return this.describe().join('\n');
    }
    async checkIfSearchIsAborted() {
        // if (this.abortSignal.aborted) {
        //   throw new Error('Aborted')
        // }
    }
    constructor(universe, userInput, swaps, signer, outputToken, startTime, abortSignal) {
        this.universe = universe;
        this.userInput = userInput;
        this.swaps = swaps;
        this.signer = signer;
        this.outputToken = outputToken;
        this.startTime = startTime;
        this.abortSignal = abortSignal;
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
                        balance: '0x' + ethers.utils.parseEther('10000').toBigInt().toString(16),
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
        // if (this.universe.chainId === 1) {
        //   return await this.customSimulator({
        //     data,
        //     value,
        //     quantity,
        //     inputToken,
        //     gasLimit,
        //   })
        // }
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
            // console.log(
            //   'Failing program:',
            //   this.inputToken.toString(),
            //   this.outputToken.toString(),
            //   printPlan(this.planner, this.universe).join('\n')
            // )
            return this.simulateNoNode({
                data,
                value,
                quantity,
                inputToken,
                gasLimit,
            });
        }
    }
    //   #[derive(Debug, Clone, Serialize, Deserialize)]
    // #[serde(rename_all = "camelCase")]
    // pub struct ApprovalSetup {
    //     pub owner: EthrsAddress,
    //     pub token: EthrsAddress,
    //     pub spender: EthrsAddress,
    //     pub value: PermissiveUint,
    // }
    // #[derive(Debug, Clone, Serialize, Deserialize)]
    // #[serde(rename_all = "camelCase")]
    // pub struct MoveFunds {
    //     pub owner: EthrsAddress,
    //     pub spender: EthrsAddress,
    //     pub token: EthrsAddress,
    //     pub quantity: PermissiveUint,
    // }
    async customSimulator(opts) {
        const inputTok = opts.inputToken.address.address.toLowerCase();
        const whale = whales.get(1)[inputTok];
        const body = {
            setupApprovals: [
                {
                    owner: this.signer.address,
                    token: opts.inputToken.address.address,
                    spender: this.universe.config.addresses.zapperAddress.address,
                    value: '0x' + constants.MaxUint256.toBigInt().toString(16),
                },
            ],
            moveFunds: whale != null
                ? [
                    {
                        owner: whale,
                        token: opts.inputToken.address.address,
                        spender: this.signer.address,
                        quantity: '0x' + opts.quantity.toString(16),
                    },
                ]
                : [],
            transactions: [
                {
                    from: this.signer.address,
                    to: this.universe.config.addresses.zapperAddress.address,
                    data: opts.data,
                    gas: '0x' + opts.gasLimit.toString(16),
                    gasPrice: '0x1',
                    value: '0x0',
                },
            ],
            stateOverride: {
                [this.signer.address]: {
                    balance: '0x56bc75e2d6310000000',
                },
                [whale]: {
                    balance: '0x56bc75e2d6310000000',
                },
            },
        };
        const encodedBody = JSON.stringify(body);
        const resp = await fetch('http://127.0.0.1:3000/api/v1/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encodedBody,
        });
        const results = await resp.json();
        const resultOfZap = results[results.length - 1];
        if (resultOfZap.error) {
            throw new Error(resultOfZap.error.error);
        }
        try {
            const [[dust, amountOut, gasUsed]] = defaultAbiCoder.decode(['(uint256[],uint256,uint256)'], resultOfZap.success.value);
            const out = {
                0: dust,
                dust,
                1: amountOut,
                amountOut: amountOut,
                2: gasUsed,
                gasUsed: gasUsed,
            };
            return out;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }
    async simulateAndParse(options, data) {
        // console.log(
        //   `STARTIG_INITIAL_SIMULATION: ${this.userInput} -> ${this.outputToken}`
        // )
        // console.log(printPlan(this.planner, this.universe).join('\n') + '\n\n\n')
        const zapperResult = await this.universe.perf.measurePromise('Zap Simulation', this.simulate({
            data,
            value: this.value,
            quantity: this.userInput.amount,
            inputToken: this.inputToken,
        }));
        const dustQuantities = zapperResult.dust
            .map((qty, index) => this.potentialResidualTokens[index].from(qty))
            .filter((i) => i.token !== this.outputToken && i.amount !== 0n);
        const amount = zapperResult.amountOut.toBigInt();
        const outputTokenOutput = this.outputToken.from(amount);
        // console.log(
        //   `INITIAL_SIMULATION_OK: ${this.userInput} -> ${outputTokenOutput}`
        // )
        const [valueOfOut, ...dustValues] = await this.universe.perf.measurePromise('value dust', Promise.all([
            this.universe.fairPrice(outputTokenOutput),
            ...dustQuantities.map(async (i) => [await this.universe.fairPrice(i), i]),
        ]));
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
    async createZapTransaction(options) {
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
            const stats = await this.universe.perf.measurePromise('ZapTxStats.create', ZapTxStats.create(this.universe, {
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
            // console.log(`${this.userInput} -> ${this.outputToken}`)
            if (e instanceof ThirdPartyIssue) {
                throw e;
            }
            throw e;
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
    universe;
    userInput;
    parts;
    signer;
    outputToken;
    startTime;
    abortSignal;
    constructor(universe, userInput, parts, signer, outputToken, startTime, abortSignal) {
        super(universe, userInput, parts.full, signer, outputToken, startTime, abortSignal);
        this.universe = universe;
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
            .planWithOutput(this.universe, this.planner, [encodeArg(this.userInput.amount, ParamType.fromString('uint256'))], this.universe.config.addresses.executorAddress, [this.userInput])
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
                    ? step.inputs.map((t) => plannerUtils.erc20.balanceOf(this.universe, this.planner, t.token, executorAddress))
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
                    encodeArg(t.amount, ParamType.from('uint256')));
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
            const out = plannerUtils.erc20.balanceOf(this.universe, this.planner, token, executorAddress);
            plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        for (const [token] of tradeOutputs) {
            if (outs.has(token)) {
                continue;
            }
            outs.add(token);
            const out = plannerUtils.erc20.balanceOf(this.universe, this.planner, token, executorAddress);
            plannerUtils.planForwardERC20(this.universe, this.planner, token, out, this.signer);
        }
        if (!outs.has(this.outputToken)) {
            const out = plannerUtils.erc20.balanceOf(this.universe, this.planner, this.outputToken, executorAddress);
            plannerUtils.planForwardERC20(this.universe, this.planner, this.outputToken, out, this.signer);
        }
        return this.createZapTransaction(options);
    }
}
const ONE = 10n ** 18n;
const ONE_Val = new LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [ONE]));
export class MintZap extends BaseSearcherResult {
    universe;
    userInput;
    parts;
    signer;
    outputToken;
    startTime;
    abortSignal;
    constructor(universe, userInput, parts, signer, outputToken, startTime, abortSignal) {
        super(universe, userInput, parts.full, signer, outputToken, startTime, abortSignal);
        this.universe = universe;
        this.userInput = userInput;
        this.parts = parts;
        this.signer = signer;
        this.outputToken = outputToken;
        this.startTime = startTime;
        this.abortSignal = abortSignal;
    }
    async toTransaction(options = {}) {
        try {
            const totalUsedInMinting = new TokenAmounts();
            const numberOfUsers = new DefaultMap(() => 0);
            const totalUsers = new DefaultMap(() => 0);
            for (const mintPath of this.parts.minting.swapPaths) {
                for (const step of mintPath.steps) {
                    totalUsedInMinting.addQtys(step.inputs);
                    for (const { token } of step.inputs) {
                        numberOfUsers.set(token, numberOfUsers.get(token) + 1);
                        totalUsers.set(token, totalUsers.get(token) + 1);
                    }
                }
            }
            const mintingBalances = new TokenAmounts();
            if (totalUsedInMinting.tokenBalances.has(this.userInput.token)) {
                mintingBalances.tokenBalances.set(this.userInput.token, this.userInput);
            }
            const tradingBalances = new TokenAmounts();
            tradingBalances.add(this.userInput);
            const trades = new Map();
            await this.setupApprovals();
            const zapperLib = Contract.createLibrary(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
            const allBalanceValues = new Map();
            allBalanceValues.set(this.userInput.token, encodeArg(this.userInput.amount, ParamType.from('uint256')));
            const tradeBalanceValues = new Map();
            tradeBalanceValues.set(this.userInput.token, encodeArg(this.userInput.amount, ParamType.from('uint256')));
            const splitTrades = new DefaultMap(() => 0);
            const splitTradesUsed = new DefaultMap(() => 0);
            const splitTradesTotal = new DefaultMap((t) => t.zero);
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
                    let inputsVal = new LiteralValue(ParamType.fromString('uint256'), defaultAbiCoder.encode(['uint256'], [tradeInput.amount]));
                    const users = splitTrades.get(inputToken);
                    const previousTradeGeneratingThisInput = trades.get(inputToken);
                    if (previousTradeGeneratingThisInput != null && users >= 2) {
                        inputsVal = previousTradeGeneratingThisInput;
                        splitTradesUsed.set(inputToken, splitTradesUsed.get(inputToken) + 1);
                        // If we're still sharing with others, split the input
                        if (splitTradesUsed.get(inputToken) !== users) {
                            const total = parseFloat(splitTradesTotal.get(inputToken).format());
                            const fraction = parseFloat(step.inputs[0].format()) / total;
                            inputsVal = this.planner.add(zapperLib.fpMul(inputsVal, parseEther(fraction.toFixed(18)), ONE_Val), `split ${fraction}%`, `frac_${step.outputs[0].token.symbol}`);
                        }
                        else {
                            // Last user gets to use the rest
                            inputsVal = plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress, 'LAST?');
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
                trades.set(input, plannerUtils.erc20.balanceOf(this.universe, this.planner, input, this.universe.config.addresses.executorAddress));
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
                            actionInput = plannerUtils.erc20.balanceOf(this.universe, this.planner, inputToken, this.universe.config.addresses.executorAddress);
                        }
                        else {
                            const fraction = parseFloat(inputQty.format()) / parseFloat(total.format());
                            actionInput = this.planner.add(zapperLib.fpMul(actionInput, parseEther(fraction.toFixed(18)), ONE_Val), `${fraction * 100}% ${inputToken}`, `frac_${step.outputs[0].token.symbol}`);
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
            return await this.createZapTransaction(options);
        }
        catch (e) {
            // console.log('ToTransaction failed:')
            // console.log(e.stack)
            throw e;
        }
    }
}
//# sourceMappingURL=SearcherResult.js.map