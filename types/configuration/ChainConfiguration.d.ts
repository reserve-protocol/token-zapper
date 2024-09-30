import { Address } from '../base/Address';
export * from './ZapSimulation';
import { SimulateZapTransactionFunction } from './ZapSimulation';
declare const defaultSearcherOptions: {
    requoteTolerance: number;
    routerDeadline: number;
    searcherMinRoutesToProduce: number;
    searcherMaxRoutesToProduce: number;
    searchConcurrency: number;
    defaultInternalTradeSlippage: bigint;
    maxSearchTimeMs: number;
    zapMaxValueLoss: number;
    zapMaxDustProduced: number;
    largeZapThreshold: number;
    largeZapSearchTime: number;
};
export type SearcherOptions = typeof defaultSearcherOptions & {
    simulateZapTransaction?: SimulateZapTransactionFunction;
};
export interface NativeTokenDefinition<Name extends string, Symbol extends string> {
    name: Name;
    symbol: Symbol;
    decimals: number;
}
export declare const makeConfig: <const ChainId extends number, const NativeToken extends NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, string>, const Blocktime extends number>(chainId: ChainId, nativeToken: NativeToken, commonTokens: CommonTokens, rTokens: RTokens, addresses: {
    facadeAddress: string;
    oldFacadeAddress: string;
    executorAddress: string;
    emitId: string;
    zapperAddress: string;
    wrappedNative: string;
    rtokenLens: string;
    balanceOf: string;
    curveRouterCall: string;
    ethBalanceOf: string;
    uniV3Router: string;
    curveStableSwapNGHelper: string;
    curveCryptoFactoryHelper: string;
}, options: {
    blocktime: Blocktime;
    blockGasLimit: bigint;
} & Partial<SearcherOptions>) => {
    readonly requoteTolerance: number;
    readonly routerDeadline: number;
    readonly searcherMinRoutesToProduce: number;
    readonly searcherMaxRoutesToProduce: number;
    readonly searchConcurrency: number;
    readonly defaultInternalTradeSlippage: bigint;
    readonly maxSearchTimeMs: number;
    readonly zapMaxValueLoss: number;
    readonly zapMaxDustProduced: number;
    readonly largeZapThreshold: number;
    readonly largeZapSearchTime: number;
    readonly blocktime: Blocktime;
    readonly blockGasLimit: bigint;
    readonly simulateZapTransaction?: SimulateZapTransactionFunction | undefined;
    readonly chainId: ChainId;
    readonly nativeToken: NativeToken;
    readonly addresses: {
        readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : Address; };
        readonly rTokens: { [K_2 in keyof { [K_1 in keyof RTokens]: string; }]: { [K_1 in keyof RTokens]: string; }[K_2] extends null ? null : Address; };
        readonly facadeAddress: Address;
        readonly oldFacadeAddress: Address;
        readonly executorAddress: Address;
        readonly emitId: Address;
        readonly zapperAddress: Address;
        readonly wrappedNative: Address;
        readonly rtokenLens: Address;
        readonly balanceOf: Address;
        readonly curveRouterCall: Address;
        readonly ethBalanceOf: Address;
        readonly uniV3Router: Address;
        readonly curveStableSwapNGHelper: Address;
        readonly curveCryptoFactoryHelper: Address;
    };
};
export type Config<ChainId extends number = number, NativeToken extends NativeTokenDefinition<string, string> = NativeTokenDefinition<string, string>, CommonTokens extends {
    ERC20GAS: string;
} & Record<string, string> = {
    ERC20GAS: string;
}, RTokens extends Record<string, string> = Record<string, string>, Blocktime extends number = number> = ReturnType<typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens, Blocktime>>;
export type ConfigWithToken<K extends {
    [KK in string]: string;
}, R extends {
    [KK in string]: string;
} = Record<string, string>> = Config<number, NativeTokenDefinition<string, string>, K & {
    ERC20GAS: string;
}, R>;
//# sourceMappingURL=ChainConfiguration.d.ts.map