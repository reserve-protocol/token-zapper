import { PoolTemplate } from "./pools";
import { type Provider } from "@ethersproject/providers";
declare function init(provider: Provider, feeData: () => ({
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
})): Promise<void>;
declare const curve: {
    init: typeof init;
    chainId: number;
    signerAddress: string;
    getPoolList: () => string[];
    PoolTemplate: typeof PoolTemplate;
    getPool: (poolId: string) => PoolTemplate;
    getUsdRate: (coin: string) => Promise<number>;
    getTVL: (network?: 1 | "ethereum") => Promise<number>;
    getBalances: (coins: string[], ...addresses: string[] | string[][]) => Promise<string[] | import("./interfaces").IDict<string[]>>;
    getCoinsData: (...coins: string[] | string[][]) => Promise<{
        name: string;
        symbol: string;
        decimals: number;
    }[]>;
    getVolume: (network?: 1 | "ethereum") => Promise<{
        totalVolume: number;
        cryptoVolume: number;
        cryptoShare: number;
    }>;
    factory: {
        fetchPools: (useApi?: boolean) => Promise<void>;
        fetchNewPools: () => Promise<string[]>;
        getPoolList: () => string[];
    };
    cryptoFactory: {
        fetchPools: (useApi?: boolean) => Promise<void>;
        fetchNewPools: () => Promise<string[]>;
        getPoolList: () => string[];
    };
    router: {
        getBestRouteAndOutput: (inputCoin: string, outputCoin: string, amount: string | number) => Promise<{
            route: import("./interfaces").IRoute;
            output: string;
        }>;
    };
};
export default curve;
//# sourceMappingURL=index.d.ts.map