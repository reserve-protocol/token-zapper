import { Address } from '../base/Address';
import { Token, type TokenQuantity } from '../entities/Token';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { type Universe } from '../Universe';
import { PoolTemplate } from '@curvefi/api/lib/pools';
declare class CurvePool {
    readonly address: Address;
    readonly tokens: Token[];
    readonly underlyingTokens: Token[];
    readonly meta: PoolTemplate;
    [Symbol.toStringTag]: string;
    constructor(address: Address, tokens: Token[], underlyingTokens: Token[], meta: PoolTemplate);
    toString(): string;
}
export declare const loadCurvePools: (universe: Universe) => Promise<CurvePool[]>;
export declare const addCurvePoolEdges: (universe: Universe, pools: CurvePool[]) => Promise<void>;
export declare class CurveSwap extends Action {
    readonly pool: CurvePool;
    readonly tokenInIdx: number;
    readonly tokenOutIdx: number;
    readonly exchangeUnderlying: boolean;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall>;
    /**
     * @node V2Actions can quote in both directions!
     * @returns
     */
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(pool: CurvePool, tokenInIdx: number, tokenIn: Token, tokenOutIdx: number, tokenOut: Token, exchangeUnderlying: boolean);
    toString(): string;
}
export {};
//# sourceMappingURL=Curve.d.ts.map