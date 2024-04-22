import { SwapRoute } from '@uniswap/smart-order-router';
import { TokenQuantity } from '../entities/Token';
import { Action } from '../action/Action';
import { Planner, Value } from '../tx-gen/Planner';
import { Address } from '../base/Address';
import { Universe } from '../Universe';
export declare class UniswapRouterAction extends Action {
    readonly route: SwapRoute;
    readonly inputQty: TokenQuantity;
    readonly outputQty: TokenQuantity;
    readonly universe: Universe;
    plan(planner: Planner, _: Value[], destination: Address): Promise<Value[]>;
    constructor(route: SwapRoute, inputQty: TokenQuantity, outputQty: TokenQuantity, universe: Universe);
    toString(): string;
    quote(_: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
}
export declare const setupUniswapRouter: (universe: Universe) => Promise<void>;
//# sourceMappingURL=setupUniswapRouter.d.ts.map