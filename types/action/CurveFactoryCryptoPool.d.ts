import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { BigNumber, BigNumberish, Contract } from 'ethers';
import { IERC20 } from '../contracts';
import { TokenQuantity, type Token } from '../entities/Token';
import { BaseAction } from './Action';
export declare class CurveFactoryCryptoPool {
    readonly universe: Universe;
    readonly pool: Address;
    readonly lpToken: Token;
    readonly underlying: Token[];
    readonly actions: {
        add: BaseAction;
        remove: BaseAction;
    }[];
    get outputSlippage(): bigint;
    get address(): Address;
    calcTokenAmountsPrLp(): Promise<{
        token0: Token;
        token1: Token;
        tok0PrLpToken: TokenQuantity;
        tok1PrLpToken: TokenQuantity;
    }>;
    readonly poolInstance: Contract & {
        remove_liquidity: (amount: BigNumberish, amounts: [BigNumberish, BigNumberish], use_eth: boolean) => Promise<[BigNumber, BigNumber]>;
        add_liquidity: (amounts: [BigNumberish, BigNumberish], min_amount: BigNumberish, use_eth: boolean) => Promise<BigNumber[]>;
        calc_token_amount: (amounts: [BigNumberish, BigNumberish]) => Promise<BigNumber>;
        balances: (tokenIndex: BigNumberish) => Promise<BigNumber>;
    };
    readonly lpTokenInstance: IERC20;
    get allPoolTokens(): Token[];
    readonly addressesInUse: Set<Address>;
    constructor(universe: Universe, pool: Address, lpToken: Token, underlying: Token[]);
    toString(): string;
}
export declare const setupCurveFactoryCryptoPool: (universe: Universe, pool: Address) => Promise<CurveFactoryCryptoPool>;
//# sourceMappingURL=CurveFactoryCryptoPool.d.ts.map