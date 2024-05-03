"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnso = void 0;
const Action_1 = require("../action/Action");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const EnsoRouter__factory_1 = require("../contracts/factories/contracts/EnsoRouter__factory");
const Swap_1 = require("../searcher/Swap");
const DexAggregator_1 = require("./DexAggregator");
const ENSO_GAS_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const encodeToken = (universe, token) => {
    if (token === universe.nativeToken) {
        return ENSO_GAS_TOKEN;
    }
    return token.address.address.toLowerCase();
};
const getEnsoQuote_ = async (abort, universe, quantityIn, tokenOut, recipient, slippage, uni) => {
    const execAddr = recipient.address.toLowerCase();
    const inputTokenStr = encodeToken(universe, quantityIn.token);
    const outputTokenStr = encodeToken(universe, tokenOut);
    const GET_QUOTE_DATA = `${API_ROOT}?chainId=${universe.chainId}&slippage=${(slippage / 10n).toString()}&fromAddress=${execAddr}&routingStrategy=router&priceImpact=false&spender=${execAddr}`;
    const reqUrl = `${GET_QUOTE_DATA}&receiver=${execAddr}&amountIn=${quantityIn.amount.toString()}&tokenIn=${inputTokenStr}&tokenOut=${outputTokenStr}`;
    // console.log(reqUrl)
    const quote = await (await fetch(reqUrl, {
        method: 'GET',
        signal: abort,
        headers: {
            'Content-Type': 'application/json',
        },
    })).json();
    if (quote.tx?.data == null) {
        // console.log(reqUrl)
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
        const addresesInUse = new Set(cmds
            .map((i) => Address_1.Address.from('0x' + i.slice(24)))
            .filter((i) => {
            uni.tokens.has(i) === false;
        }));
        const parsed = {
            ...quote,
            addresesInUse,
            tx: {
                ...quote.tx,
                data: {
                    amountIn: amtIn,
                    tokenIn,
                    commands: cmds,
                    state,
                },
            },
            quantityIn,
            quantityOut: tokenOut.from(BigInt(quote.amountOut)),
            tokenIn: inputTokenStr,
            tokenOut: outputTokenStr,
        };
        return parsed;
    }
    catch (e) {
        throw e;
    }
};
const getEnsoQuote = async (abort, universe, quantityIn, tokenOut, recipient, slippage, retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await getEnsoQuote_(abort, universe, quantityIn, tokenOut, recipient, slippage, universe);
        }
        catch (e) {
            // console.log(
            //   'Enso failed to quote ' +
            //     quantityIn.toString() +
            //     ' -> ' +
            //     tokenOut +
            //     '  retrying...'
            // )
            // console.log(e.message)
            continue;
        }
    }
    throw new Error('Failed to get enso quote');
};
class EnsoAction extends (0, Action_1.Action)('Enso') {
    universe;
    request;
    slippage;
    get oneUsePrZap() {
        return true;
    }
    get addressesInUse() {
        return this.request.addresesInUse;
    }
    get outputSlippage() {
        return 100n;
    }
    async plan(planner, [input], _, [predicted]) {
        const ensoLib = this.gen.Contract.createContract(EnsoRouter__factory_1.EnsoRouter__factory.connect(this.request.tx.to, this.universe.provider));
        let routeSingleCall = ensoLib.routeSingle(this.request.tokenIn, input ?? predicted.amount, this.request.tx.data.commands, this.request.tx.data.state);
        planner.add(routeSingleCall, `Enso(${this.inputQty}, ${this.request.route
            .map((i) => i.protocol)
            .join(',')}, ${this.outputQty})`);
        return this.outputBalanceOf(this.universe, planner);
    }
    outputQuantity = [];
    lastQuoteBlock = 0;
    constructor(universe, inputQty, outputQty, request, slippage) {
        super(Address_1.Address.from(request.tx.to), [inputQty.token], [outputQty.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(inputQty.token, Address_1.Address.from(request.tx.to))]);
        this.universe = universe;
        this.request = request;
        this.slippage = slippage;
        this.lastQuoteBlock = universe.currentBlock;
    }
    get inputQty() {
        return this.request.quantityIn;
    }
    get outputQty() {
        return this.request.quantityOut;
    }
    toString() {
        return `Enso(${this.inputQty} => ${this.outputQty})`;
    }
    async quote([_]) {
        // if (
        //   Math.abs(this.lastQuoteBlock - this.universe.currentBlock) >
        //   this.universe.config.requoteTolerance
        // ) {
        //   try {
        //     this.request = await getEnsoQuote(
        //       AbortSignal.timeout(2000),
        //       this.universe,
        //       input,
        //       this.outputQty.token,
        //       this.address,
        //       this.slippage,
        //       1
        //     )
        //   } catch (e) {}
        // }
        return [this.outputQty];
    }
    gasEstimate() {
        return BigInt(this.request.gas);
    }
}
const API_ROOT = 'https://worker-purple-frost-55b5.mig2151.workers.dev/api/v1/shortcuts/route';
const createEnso = (aggregatorName, universe, retries = 2) => {
    return new DexAggregator_1.DexRouter(aggregatorName, async (abort, _, destination, input, output, slippage) => {
        if (input.token === universe.nativeToken ||
            output === universe.nativeToken) {
            throw new Error('Unsupported');
        }
        const req = await getEnsoQuote(abort, universe, input, output, destination, slippage, retries);
        return await new Swap_1.SwapPlan(universe, [
            new EnsoAction(universe, input, output.from(BigInt(req.amountOut)), req, slippage),
        ]).quote([input], destination);
    }, true);
};
exports.createEnso = createEnso;
//# sourceMappingURL=Enso.js.map