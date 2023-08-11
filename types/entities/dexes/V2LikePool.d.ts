/// <reference types="node" />
import { Address } from '../../base/Address';
import { type Token, type TokenQuantity } from '../Token';
import { type SwapDirection } from './TwoTokenPoolTypes';
import { Buffer } from 'buffer';
type Env = {
    pool: V2Pool;
    inputToken: Token;
    outputToken: Token;
    direction: SwapDirection;
};
type QuoteFn = (quantity: TokenQuantity, env: Env) => Promise<TokenQuantity>;
type EncodeFn = (quantity: TokenQuantity, destination: Address, env: Env) => Promise<Buffer>;
export declare const standardSwap: QuoteFn;
export declare const standardEncoding: EncodeFn;
export declare class V2Pool {
    readonly address: Address;
    readonly token0: Token;
    readonly token1: Token;
    private reserve0_;
    private reserve1_;
    private readonly _fee;
    readonly swapFn: QuoteFn;
    readonly encodeSwap: EncodeFn;
    private _feeInv;
    get fee(): bigint;
    get feeInv(): bigint;
    get name(): string;
    toString(): string;
    constructor(address: Address, token0: Token, token1: Token, reserve0_: bigint, reserve1_: bigint, _fee: bigint, swapFn: QuoteFn, encodeSwap: EncodeFn);
    get reserve0(): bigint;
    get reserve1(): bigint;
    updateReserves(reserve0: bigint, reserve1: bigint): void;
    static createStandardV2Pool(factory: Address, tokenA: Token, tokenB: Token, fee: bigint, poolAddress?: Address): V2Pool;
}
export {};
//# sourceMappingURL=V2LikePool.d.ts.map