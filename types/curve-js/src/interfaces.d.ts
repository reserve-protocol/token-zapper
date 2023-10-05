import { type BigNumber as ethersBigNumber } from "@ethersproject/bignumber";
import { type Provider } from "@ethersproject/providers";
import { type Contract } from '@ethersproject/contracts';
import { type Provider as MulticallProvider, type Contract as MulticallContract } from '../../ethcall/src';
import { JsonFragment } from "@ethersproject/abi";
export interface IDict<T> {
    [index: string]: T;
}
export type ICurve = {
    whitelist: Set<string>;
    provider: Provider;
    multicallProvider: MulticallProvider;
    signerAddress: string;
    chainId: IChainId;
    contracts: {
        [index: string]: {
            contract: Contract;
            multicallContract: MulticallContract;
        };
    };
    options: {
        gasPrice?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
    };
    feeData: () => {
        gasPrice?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
    };
    constantOptions: {
        gasLimit: number;
    };
    constants: {
        NATIVE_TOKEN: {
            symbol: string;
            wrappedSymbol: string;
            address: string;
            wrappedAddress: string;
        };
        NETWORK_NAME: INetworkName;
        ALIASES: IDict<string>;
        POOLS_DATA: IDict<IPoolData>;
        FACTORY_POOLS_DATA: IDict<IPoolData>;
        CRYPTO_FACTORY_POOLS_DATA: IDict<IPoolData>;
        COINS: IDict<string>;
        DECIMALS: IDict<number>;
        GAUGES: string[];
    };
    setContract(address: string, abi: Promise<JsonFragment[]> | JsonFragment[]): Promise<void>;
};
export type IPoolType = "main" | "crypto" | "factory" | "factory-crypto";
export type INetworkName = "ethereum";
export type IChainId = 1;
export type REFERENCE_ASSET = 'USD' | 'EUR' | 'BTC' | 'ETH' | 'LINK' | 'CRYPTO' | 'OTHER';
export interface IPoolData {
    name: string;
    full_name: string;
    symbol: string;
    reference_asset: REFERENCE_ASSET;
    swap_address: string;
    token_address: string;
    gauge_address: string;
    deposit_address?: string;
    sCurveRewards_address?: string;
    reward_contract?: string;
    implementation_address?: string;
    is_plain?: boolean;
    is_lending?: boolean;
    is_meta?: boolean;
    is_crypto?: boolean;
    is_fake?: boolean;
    is_factory?: boolean;
    base_pool?: string;
    meta_coin_idx?: number;
    underlying_coins: string[];
    wrapped_coins: string[];
    underlying_coin_addresses: string[];
    wrapped_coin_addresses: string[];
    underlying_decimals: number[];
    wrapped_decimals: number[];
    use_lending?: boolean[];
    swap_abi: () => Promise<JsonFragment[]>;
    gauge_abi: () => Promise<JsonFragment[]>;
    deposit_abi?: () => Promise<JsonFragment[]>;
    sCurveRewards_abi?: () => Promise<JsonFragment[]>;
    in_api?: boolean;
}
export interface ICoinFromPoolDataApi {
    address: string;
    symbol: string;
    decimals: string;
    usdPrice: number | string;
}
export interface IReward {
    gaugeAddress: string;
    tokenAddress: string;
    symbol: string;
    apy: number;
}
export interface IRewardFromApi {
    gaugeAddress: string;
    tokenAddress: string;
    tokenPrice: number;
    name: string;
    symbol: string;
    decimals: number;
    apy: number;
}
export interface IPoolDataFromApi {
    id: string;
    name: string;
    symbol: string;
    assetTypeName: string;
    address: string;
    lpTokenAddress?: string;
    gaugeAddress?: string;
    implementation: string;
    implementationAddress: string;
    coins: ICoinFromPoolDataApi[];
    gaugeRewards: IRewardFromApi[];
    usdTotal: number;
    totalSupply: number;
    amplificationCoefficient: string;
    gaugeCrvApy: [number | null, number | null];
}
export interface ISubgraphPoolData {
    address: string;
    volumeUSD: number;
    latestDailyApy: number;
    latestWeeklyApy: number;
}
export interface IExtendedPoolDataFromApi {
    poolData: IPoolDataFromApi[];
    tvl?: number;
    tvlAll: number;
}
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
export interface IRouteTvl {
    route: IRoute;
    minTvl: number;
    totalTvl: number;
}
export interface IRouteOutputAndCost {
    route: IRoute;
    _output: ethersBigNumber;
    outputUsd: number;
    txCostUsd: number;
}
export interface IProfit {
    day: string;
    week: string;
    month: string;
    year: string;
    token: string;
    symbol: string;
    price: number;
}
//# sourceMappingURL=interfaces.d.ts.map