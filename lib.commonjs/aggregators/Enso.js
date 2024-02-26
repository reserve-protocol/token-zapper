"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnso = void 0;
const __1 = require("..");
const Action_1 = require("../action/Action");
const Approval_1 = require("../base/Approval");
const EnsoRouter__factory_1 = require("../contracts/factories/contracts/EnsoRouter__factory");
const Swap_1 = require("../searcher/Swap");
const DexAggregator_1 = require("./DexAggregator");
const IWrappedNative__factory_1 = require("../contracts/factories/contracts/IWrappedNative__factory");
const controlflow_1 = require("../base/controlflow");
const ENSO_GAS_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const encodeToken = (universe, token) => {
    if (token === universe.nativeToken) {
        return ENSO_GAS_TOKEN;
    }
    // if (token === universe.wrappedNativeToken) {
    //   return ENSO_GAS_TOKEN
    // }
    return token.address.address.toLowerCase();
};
// const ensoBlacklist = new Set() // ['0xe72b141df173b999ae7c1adcbf60cc9833ce56a8']
const getEnsoQuote_ = async (slippage, universe, quantityIn, tokenOut, recipient) => {
    // if (ensoBlacklist.has(tokenOut.address.address.toLowerCase())) {
    //   throw new Error('Enso does not support rTokens')
    // }
    const execAddr = universe.config.addresses.executorAddress.address.toLowerCase();
    const inputTokenStr = encodeToken(universe, quantityIn.token);
    const outputTokenStr = encodeToken(universe, tokenOut);
    const GET_QUOTE_DATA = `${API_ROOT}?chainId=${universe.chainId}&slippage=${slippage}&fromAddress=${execAddr}&routingStrategy=router&priceImpact=false&spender=${execAddr}`;
    const reqUrl = `${GET_QUOTE_DATA}&receiver=${execAddr}&amountIn=${quantityIn.amount.toString()}&tokenIn=${inputTokenStr}&tokenOut=${outputTokenStr}`;
    const quote = await (await fetch(reqUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })).json();
    if (quote.tx?.data == null) {
        throw new Error(quote.message);
    }
    try {
        let pos = 10;
        const read = (len = 64) => {
            let out = quote.tx.data.slice(pos, pos + len);
            pos += len;
            if (out.length < len) {
                out = out.padEnd(len, '0');
            }
            return out;
        };
        const tokenIn = '0x' + read();
        const amtIn = '0x' + read();
        // Skip over offset
        pos += 128;
        const cmdsLenNum = Number(BigInt('0x' + read()));
        const cmds = [];
        for (let i = 0; i < cmdsLenNum; i++) {
            cmds.push('0x' + read());
        }
        const stateLenNum = Number(BigInt('0x' + read()));
        const stateOffsets = [];
        const curPos = pos;
        for (let i = 0; i < stateLenNum; i++) {
            const offset = Number(BigInt('0x' + read())) * 2;
            stateOffsets.push(curPos + offset);
        }
        const state = [];
        for (let i = 0; i < stateLenNum; i++) {
            const offset = stateOffsets[i];
            pos = offset;
            const size = Number(BigInt('0x' + read()));
            state.push('0x' + read(size * 2));
        }
        const parsed = {
            ...quote,
            tx: {
                ...quote.tx,
                data: {
                    amountIn: amtIn,
                    tokenIn,
                    commands: cmds,
                    state,
                },
            },
            tokenIn: inputTokenStr,
            tokenOut: outputTokenStr,
        };
        return parsed;
    }
    catch (e) {
        throw e;
    }
};
const getEnsoQuote = async (slippage, universe, quantityIn, tokenOut, recipient) => {
    for (let i = 0; i < 2; i++) {
        try {
            return await getEnsoQuote_(slippage, universe, quantityIn, tokenOut, recipient);
        }
        catch (e) {
            console.log('Enso failed to quote ' +
                quantityIn.toString() +
                ' -> ' +
                tokenOut +
                '  retrying...');
            console.log(e.message);
            await (0, controlflow_1.wait)(500);
            continue;
        }
    }
    throw new Error('Failed to get enso quote');
};
class EnsoAction extends Action_1.Action {
    universe;
    inputQty;
    outputQty;
    request;
    slippage;
    async plan(planner, [input], _, predicted) {
        const ensoLib = this.gen.Contract.createContract(EnsoRouter__factory_1.EnsoRouter__factory.connect(this.request.tx.to, this.universe.provider));
        const inputV = input ?? predicted[0].amount;
        if (this.request.tokenIn === ENSO_GAS_TOKEN &&
            this.input[0] === this.universe.wrappedNativeToken) {
            const wethlib = this.gen.Contract.createContract(IWrappedNative__factory_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
            planner.add(wethlib.deposit().withValue(inputV));
        }
        let routeSingleCall = ensoLib.routeSingle(this.request.tokenIn, inputV, this.request.tx.data.commands, this.request.tx.data.state);
        if (this.inputQty.token === this.universe.nativeToken) {
            routeSingleCall = routeSingleCall.withValue(input);
        }
        planner.add(routeSingleCall, `Enso(${this.inputQty}, ${this.request.route
            .map((i) => i.protocol)
            .join(',')}, ${this.outputQty})`);
        const outToken = this.request.tokenOut === ENSO_GAS_TOKEN
            ? this.universe.nativeToken
            : await this.universe.getToken(__1.Address.from(this.request.tokenOut));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, outToken, this.universe.config.addresses.executorAddress, 'ensoswap,after swap', `bal_${outToken.symbol}_after`);
        if (this.request.tokenOut === ENSO_GAS_TOKEN &&
            this.output[0] === this.universe.wrappedNativeToken) {
            console.log('Adding WETH deposit for out');
            const wethlib = this.gen.Contract.createContract(IWrappedNative__factory_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
            planner.add(wethlib.deposit().withValue(out));
        }
        return [out];
    }
    outputQuantity = [];
    constructor(universe, inputQty, outputQty, request, slippage) {
        super(__1.Address.from(request.tx.to), [inputQty.token], [outputQty.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(inputQty.token, __1.Address.from(request.tx.to))]);
        this.universe = universe;
        this.inputQty = inputQty;
        this.outputQty = outputQty;
        this.request = request;
        this.slippage = slippage;
    }
    toString() {
        return `Enso(${this.inputQty} => ${this.outputQty})`;
    }
    async quote(input) {
        this.request = await getEnsoQuote(this.slippage, this.universe, this.inputQty, this.outputQty.token, this.address);
        this.inputQty = input[0];
        this.outputQty = this.outputQty.token.from(BigInt(this.request.amountOut));
        // if (this.request.createdAt !== this.universe.currentBlock) {
        //   console.log(
        //     `?Enso quote created at: ${this.request.createdAt} but current block is: ${this.universe.currentBlock}`
        //   )
        // }
        return [this.outputQty];
    }
    gasEstimate() {
        return BigInt(this.request.gas);
    }
    async encode(inputs, __) {
        // console.log('Encoding enso')
        throw new Error('Method not implemented.');
    }
}
const API_ROOT = 'https://worker-purple-frost-55b5.mig2151.workers.dev/api/v1/shortcuts/route';
const createEnso = (aggregatorName, universe, slippage) => {
    return new DexAggregator_1.DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await getEnsoQuote(slippage, universe, input, output, destination);
        return await new Swap_1.SwapPlan(universe, [
            new EnsoAction(universe, input, output.from(BigInt(req.amountOut)), req, slippage),
        ]).quote([input], destination);
    });
};
exports.createEnso = createEnso;
//# sourceMappingURL=Enso.js.map