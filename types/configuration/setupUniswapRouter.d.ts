import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from '@uniswap/v3-sdk';
import { SwapRoute } from '@uniswap/smart-order-router';
import { Universe } from '../Universe';
import { Action } from '../action/Action';
import { DexRouter } from '../aggregators/DexAggregator';
import { Address } from '../base/Address';
import { Token, TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
export declare class UniswapRouterAction extends Action {
    readonly route: SwapRoute;
    readonly inputQty: TokenQuantity;
    readonly outputQty: TokenQuantity;
    readonly universe: Universe;
    get outputSlippage(): bigint;
    planV3Trade(planner: Planner, trade: V3Trade<Currency, Currency, TradeType>, input: Value): Promise<Value>;
    plan(planner: Planner, [input]: Value[], destination: Address): Promise<Value[]>;
    constructor(route: SwapRoute, inputQty: TokenQuantity, outputQty: TokenQuantity, universe: Universe);
    toString(): string;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
}
export declare const setupUniswapRouter: (universe: Universe) => Promise<{
    dex: DexRouter;
    addTradeAction: (inputToken: Token, outputToken: Token) => void;
}>;
//# sourceMappingURL=setupUniswapRouter.d.ts.map