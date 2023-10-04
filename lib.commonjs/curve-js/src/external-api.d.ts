import { IExtendedPoolDataFromApi, ISubgraphPoolData, IPoolType, IDict, INetworkName } from "./interfaces";
import memoize from "memoizee";
export declare const _getPoolsFromApi: ((network: INetworkName, poolType: IPoolType) => Promise<IExtendedPoolDataFromApi>) & memoize.Memoized<(network: INetworkName, poolType: IPoolType) => Promise<IExtendedPoolDataFromApi>>;
export declare const _getSubgraphData: ((network: INetworkName) => Promise<{
    poolsData: ISubgraphPoolData[];
    totalVolume: number;
    cryptoVolume: number;
    cryptoShare: number;
}>) & memoize.Memoized<(network: INetworkName) => Promise<{
    poolsData: ISubgraphPoolData[];
    totalVolume: number;
    cryptoVolume: number;
    cryptoShare: number;
}>>;
export declare const _getLegacyAPYsAndVolumes: ((network: string) => Promise<IDict<{
    apy: {
        day: number;
        week: number;
    };
    volume: number;
}>>) & memoize.Memoized<(network: string) => Promise<IDict<{
    apy: {
        day: number;
        week: number;
    };
    volume: number;
}>>>;
export declare const _getFactoryAPYsAndVolumes: ((network: string) => Promise<{
    poolAddress: string;
    apy: number;
    volume: number;
}[]>) & memoize.Memoized<(network: string) => Promise<{
    poolAddress: string;
    apy: number;
    volume: number;
}[]>>;
export declare const _getAllGauges: (() => Promise<IDict<{
    gauge: string;
    is_killed?: boolean;
}>>) & memoize.Memoized<() => Promise<IDict<{
    gauge: string;
    is_killed?: boolean;
}>>>;
export declare const _getHiddenPools: (() => Promise<IDict<string[]>>) & memoize.Memoized<() => Promise<IDict<string[]>>>;
