import { Address } from '..';
import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Approval } from '../base/Approval';
import { EnsoRouter__factory } from '../contracts/factories/contracts/EnsoRouter__factory';
import { SwapPlan } from '../searcher/Swap';
import { DexAggregator } from './DexAggregator';
import { IWrappedNative__factory } from '../contracts/factories/contracts/IWrappedNative__factory';
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
const getEnsoQuote = async (slippage, universe, quantityIn, tokenOut, recipient) => {
    const execAddr = universe.config.addresses.executorAddress.address.toLowerCase();
    const inputTokenStr = encodeToken(universe, quantityIn.token);
    const outputTokenStr = encodeToken(universe, tokenOut);
    const GET_QUOTE_DATA = `${API_ROOT}?chainId=${universe.chainId}&fromAddress=${execAddr}&routingStrategy=router&priceImpact=false&spender=${execAddr}`;
    const reqUrl = `${GET_QUOTE_DATA}&receiver=${recipient.address}&amountIn=${quantityIn.amount.toString()}&slippage=${slippage}&tokenIn=${inputTokenStr}&tokenOut=${outputTokenStr}`;
    const quote = await (await fetch(reqUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })).json();
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
            tokenOut: outputTokenStr,
        };
        return parsed;
    }
    catch (e) {
        console.log(e);
        throw e;
    }
};
// function safeRouteSingle(
//   address tokenIn,
//   address tokenOut,
//   uint256 amountIn,
//   uint256 minAmountOut,
//   address receiver,
//   bytes32[] calldata commands,
//   bytes[] calldata state
// ) external payable returns (bytes[] memory returnData);
// IERC20 tokenIn,
// uint256 amountIn,
// bytes32[] calldata commands,
// bytes[] calldata state
class EnsoAction extends Action {
    universe;
    inputQty;
    outputQty;
    request;
    slippage;
    async plan(planner, [input]) {
        const ensoLib = this.gen.Contract.createContract(EnsoRouter__factory.connect(this.request.tx.to, this.universe.provider));
        let routeSingleCall = ensoLib.routeSingle(encodeToken(this.universe, this.inputQty.token), input, this.request.tx.data.commands, this.request.tx.data.state);
        if (this.inputQty.token === this.universe.nativeToken) {
            routeSingleCall = routeSingleCall.withValue(input);
        }
        planner.add(routeSingleCall);
        const outToken = this.request.tokenOut === ENSO_GAS_TOKEN
            ? this.universe.nativeToken
            : await this.universe.getToken(Address.from(this.request.tokenOut));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, outToken, this.universe.config.addresses.executorAddress, 'ensoswap,after swap', `bal_${outToken.symbol}_after`);
        if (this.request.tokenOut === ENSO_GAS_TOKEN &&
            this.output[0] === this.universe.wrappedNativeToken) {
            console.log('Adding WETH deposit');
            const wethlib = this.gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
            planner.add(wethlib.deposit().withValue(out));
        }
        return [out];
    }
    outputQuantity = [];
    constructor(universe, inputQty, outputQty, request, slippage) {
        super(Address.from(request.tx.to), [inputQty.token], [outputQty.token], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(inputQty.token, Address.from(request.tx.to))]);
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
export const createEnso = (aggregatorName, universe, slippage) => {
    return new DexAggregator(aggregatorName, async (_, destination, input, output, __) => {
        const req = await getEnsoQuote(slippage, universe, input, output, destination);
        return await new SwapPlan(universe, [
            new EnsoAction(universe, input, output.from(BigInt(req.amountOut)), req, slippage),
        ]).quote([input], destination);
    });
};
//# sourceMappingURL=Enso.js.map