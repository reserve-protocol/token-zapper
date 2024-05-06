import { BaseAction } from '../action/Action';
import { Address } from '../base/Address';
import { TradingVenue } from '../aggregators/DexAggregator';
import { type SourcingRule } from '../searcher/SourcingRule';
import { type EthereumUniverse } from './ethereum';
export { BasketTokenSourcingRuleApplication, PostTradeAction } from '../searcher/BasketTokenSourcingRules';
export interface IRouteStep {
    poolId: string;
    poolAddress: string;
    inputCoinAddress: string;
    outputCoinAddress: string;
    i: number;
    j: number;
    swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
    swapAddress: string;
}
export type IRoute = IRouteStep[];
export declare const initCurveOnEthereum: (universe: EthereumUniverse, convexBooster: string, lpActionSlippage: bigint) => Promise<{
    stables: Set<import("../entities/Token").Token>;
    setupConvexEdge: (universe: import("..").Universe<import("./ChainConfiguration").Config>, stakedConvexToken: import("../entities/Token").Token, convex: Address) => Promise<{
        pool: {
            readonly convexBooster: Address;
            readonly convexPoolId: bigint;
            readonly curveLPToken: import("../entities/Token").Token;
            readonly convexDepositToken: import("../entities/Token").Token;
            readonly stakedConvexDepositToken: import("../entities/Token").Token;
            readonly rewardsAddress: Address;
            toString(): string;
        };
        depositAndStakeAction: import("../action/Convex").ConvexDepositAndStake;
        unstakeAndWithdrawAction: import("../action/Convex").ConvexUnstakeAndWithdraw;
    }>;
    makeStkConvexSourcingRule: (depositAndStake: BaseAction) => SourcingRule;
    convexBoosterAddress: Address;
    venue: TradingVenue;
}>;
//# sourceMappingURL=setupCurveOnEthereum.d.ts.map