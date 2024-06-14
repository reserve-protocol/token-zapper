import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { BaseAction } from './Action';
import { BigNumber, BigNumberish, Contract } from 'ethers';
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
    readonly poolInstance: Contract & {
        remove_liquidity_one_coin: (_amount: BigNumberish, i: BigNumberish, use_eth: boolean, receiver: string) => Promise<BigNumber>;
        add_liquidity: (amounts: [BigNumberish, BigNumberish], min_amount: BigNumberish, use_eth: boolean) => Promise<BigNumber[]>;
        calc_withdraw_one_coin: (token_amount: BigNumberish, i: BigNumberish) => Promise<BigNumber>;
        calc_token_amount: (amounts: [BigNumberish, BigNumberish]) => Promise<BigNumber>;
        balances: (tokenIndex: BigNumberish) => Promise<BigNumber>;
    };
    get allPoolTokens(): Token[];
    constructor(universe: Universe, pool: Address, lpToken: Token, underlying: Token[]);
    toString(): string;
}
export declare const setupCurveFactoryCryptoPool: (universe: Universe, pool: Address) => Promise<CurveFactoryCryptoPool>;
