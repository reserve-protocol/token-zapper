import { Address } from '../base/Address';
import { type EthereumUniverse } from './ethereum';
export declare const setupEthereumZapper: (universe: EthereumUniverse) => Promise<{
    curve: {
        stables: Set<import("..").Token>;
        setupConvexEdge: (universe: import("..").Universe<import("./ChainConfiguration").Config>, stakedConvexToken: import("..").Token, convex: Address) => Promise<{
            pool: {
                readonly convexBooster: Address;
                readonly convexPoolId: bigint;
                readonly curveLPToken: import("..").Token;
                readonly convexDepositToken: import("..").Token;
                readonly stakedConvexDepositToken: import("..").Token;
                readonly rewardsAddress: Address;
                toString(): string;
            };
            depositAction: import("../action/Convex").ConvexDeposit;
            withdrawAction: import("../action/Convex").ConvexWithdraw;
            stakeAction: import("../action/Convex").ConvexStake;
            unstakeAction: import("../action/Convex").ConvexUnstake;
            depositAndStakeAction: import("../action/Convex").ConvexDepositAndStake;
            unstakeAndWithdrawAction: import("../action/Convex").ConvexUnstakeAndWithdraw;
        }>;
        makeStkConvexSourcingRule: (depositAndStake: import("../action/Action").Action) => import("../searcher/SourcingRule").SourcingRule;
        convexBoosterAddress: Address;
    };
}>;
