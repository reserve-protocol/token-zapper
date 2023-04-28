import { Address } from '../base/Address';
import { Token, type TokenQuantity } from '../entities/Token';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { type Universe } from '../Universe';
import curve from '@curvefi/api';
import { IRoute } from '@curvefi/api/lib/interfaces';
type CurveType = typeof curve;
type PoolTemplate = InstanceType<CurveType['PoolTemplate']>;
declare class CurvePool {
    readonly address: Address;
    readonly tokens: Token[];
    readonly underlyingTokens: Token[];
    readonly meta: PoolTemplate;
    readonly templateName: string;
    [Symbol.toStringTag]: string;
    constructor(address: Address, tokens: Token[], underlyingTokens: Token[], meta: PoolTemplate, templateName: string);
    toString(): string;
}
export declare class CurveSwap extends Action {
    readonly pool: CurvePool;
    readonly tokenIn: Token;
    readonly tokenOut: Token;
    private readonly predefiendRoutes;
    private estimate?;
    gasEstimate(): bigint;
    encode([amountsIn]: TokenQuantity[]): Promise<ContractCall>;
    private _quote;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(pool: CurvePool, tokenIn: Token, tokenOut: Token, predefiendRoutes: Record<string, IRoute>);
    toString(): string;
}
export declare const loadCurve: (universe: Universe, predefinedRoutes: Record<string, IRoute>) => Promise<{
    createLpToken: (token: Token) => Promise<void>;
    createRouterEdge: (tokenA: Token, tokenB: Token) => CurveSwap;
}>;
export {};
