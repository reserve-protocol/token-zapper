import { IPoolData, IDict, INetworkName, IChainId } from './interfaces';
import { Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { Provider as MulticallProvider, Contract as MulticallContract } from '../../ethcall/src';
import { JsonFragment } from '@ethersproject/abi';
import * as router from './router';
export declare const NATIVE_TOKENS: {
    [index: number]: {
        symbol: string;
        wrappedSymbol: string;
        address: string;
        wrappedAddress: string;
    };
};
export declare const NETWORK_CONSTANTS: {
    [index: number]: any;
};
declare class Curve {
    router: typeof router;
    getPool(i: string): import("./pools").PoolTemplate;
    provider: Provider;
    multicallProvider: MulticallProvider;
    signerAddress: string;
    chainId: IChainId;
    whitelist: Set<string>;
    get options(): {
        gasPrice?: bigint | undefined;
        maxFeePerGas?: bigint | undefined;
        maxPriorityFeePerGas?: bigint | undefined;
    };
    contracts: {
        [index: string]: {
            contract: Contract;
            multicallContract: MulticallContract;
        };
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
    constructor();
    init(provider: Provider, feeData: () => {
        gasPrice?: bigint;
        maxFeePerGas?: bigint;
        maxPriorityFeePerGas?: bigint;
    }, extraOptions: {
        whitelist: Set<string>;
    }): Promise<void>;
    setContract(address: string, abi: Promise<JsonFragment[]> | JsonFragment[]): Promise<void>;
    _filterHiddenPools(pools: IDict<IPoolData>): Promise<IDict<IPoolData>>;
    _updateDecimalsAndGauges(pools: IDict<IPoolData>): void;
    fetchFactoryPools: (useApi?: boolean) => Promise<void>;
    fetchCryptoFactoryPools: (useApi?: boolean) => Promise<void>;
    fetchNewFactoryPools: () => Promise<string[]>;
    fetchNewCryptoFactoryPools: () => Promise<string[]>;
    fetchRecentlyDeployedFactoryPool: (poolAddress: string) => Promise<string>;
    fetchRecentlyDeployedCryptoFactoryPool: (poolAddress: string) => Promise<string>;
    getPoolList: () => string[];
    getFactoryPoolList: () => string[];
    getCryptoFactoryPoolList: () => string[];
}
export declare const curve: Curve;
export {};
//# sourceMappingURL=curve.d.ts.map