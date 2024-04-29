import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { EnsoRouter__factory } from '../contracts/factories/contracts/EnsoRouter__factory';
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory';
import { SwapPlan } from '../searcher/Swap';
import { DexRouter } from './DexAggregator';
const ENSO_GAS_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const encodeToken = (universe, token) => {
    if (token === universe.nativeToken) {
        return ENSO_GAS_TOKEN;
    }
    return token.address.address.toLowerCase();
};
const specialCasesLongTimeout = new Set([
    '0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
]);
const getEnsoQuote_ = async (slippage, universe, quantityIn, tokenOut, recipient) => {
    const execAddr = universe.config.addresses.executorAddress.address.toLowerCase();
    const inputTokenStr = encodeToken(universe, quantityIn.token);
    const outputTokenStr = encodeToken(universe, tokenOut);
    const GET_QUOTE_DATA = `${API_ROOT}?chainId=${universe.chainId}&slippage=${slippage}&fromAddress=${execAddr}&routingStrategy=router&priceImpact=false&spender=${execAddr}`;
    const reqUrl = `${GET_QUOTE_DATA}&receiver=${execAddr}&amountIn=${quantityIn.amount.toString()}&tokenIn=${inputTokenStr}&tokenOut=${outputTokenStr}`;
    let timeout = 3000;
    if (specialCasesLongTimeout.has(inputTokenStr) ||
        specialCasesLongTimeout.has(outputTokenStr)) {
        timeout = 6000;
    }
    const quote = await (await fetch(reqUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(timeout),
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
const getEnsoQuote = async (slippage, universe, quantityIn, tokenOut, recipient, retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await getEnsoQuote_(slippage, universe, quantityIn, tokenOut, recipient);
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
class EnsoAction extends Action('Enso') {
    universe;
    inputQty;
    outputQty;
    request;
    slippage;
    async plan(planner, [input], _, predicted) {
        const ensoLib = this.gen.Contract.createContract(EnsoRouter__factory.connect(this.request.tx.to, this.universe.provider));
        const inputV = input ?? predicted[0].amount;
        if (this.request.tokenIn === ENSO_GAS_TOKEN &&
            this.inputToken[0] === this.universe.wrappedNativeToken) {
            const wethlib = this.gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
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
            : await this.universe.getToken(Address.from(this.request.tokenOut));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, outToken, this.universe.config.addresses.executorAddress, 'ensoswap,after swap', `bal_${outToken.symbol}_after`);
        if (this.request.tokenOut === ENSO_GAS_TOKEN &&
            this.outputToken[0] === this.universe.wrappedNativeToken) {
            console.log('Adding WETH deposit for out');
            const wethlib = this.gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
            planner.add(wethlib.deposit().withValue(out));
        }
        return [out];
    }
    outputQuantity = [];
    lastQuoteBlock = 0;
    constructor(universe, inputQty, outputQty, request, slippage) {
        super(Address.from(request.tx.to), [inputQty.token], [outputQty.token], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(inputQty.token, Address.from(request.tx.to))]);
        this.universe = universe;
        this.inputQty = inputQty;
        this.outputQty = outputQty;
        this.request = request;
        this.slippage = slippage;
        this.lastQuoteBlock = universe.currentBlock;
    }
    toString() {
        return `Enso(${this.inputQty} => ${this.outputQty})`;
    }
    async quote(input) {
        this.request =
            this.lastQuoteBlock === this.universe.currentBlock
                ? this.request
                : await getEnsoQuote(this.slippage, this.universe, this.inputQty, this.outputQty.token, this.address, 1);
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
}
const API_ROOT = 'https://worker-purple-frost-55b5.mig2151.workers.dev/api/v1/shortcuts/route';
export const createEnso = (aggregatorName, universe, slippage, retries = 2) => {
    return new DexRouter(aggregatorName, async (_, destination, input, output, __) => {
        const req = await getEnsoQuote(slippage, universe, input, output, destination, retries);
        return await new SwapPlan(universe, [
            new EnsoAction(universe, input, output.from(BigInt(req.amountOut)), req, slippage),
        ]).quote([input], destination);
    }, true);
};
//# sourceMappingURL=Enso.js.map