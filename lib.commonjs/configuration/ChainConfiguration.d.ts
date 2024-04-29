import { Address } from '../base/Address';
export interface NativeTokenDefinition<Name extends string, Symbol extends string> {
    name: Name;
    symbol: Symbol;
    decimals: number;
}
export declare const makeConfig: <const ChainId extends number, const NativeToken extends NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, string>, const Blocktime extends number>(chainId: ChainId, nativeToken: NativeToken, commonTokens: CommonTokens, rTokenDeployments: RTokens, addresses: {
    facadeAddress: string;
    executorAddress: string;
    zapperAddress: string;
    wrappedNative: string;
    rtokenLens: string;
    balanceOf: string;
    curveRouterCall: string;
    ethBalanceOf: string;
    uniV3Router: string;
    curveStableSwapNGHelper: string;
}, blocktime: Blocktime) => {
    readonly chainId: ChainId;
    readonly nativeToken: NativeToken;
    readonly addresses: {
        readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : Address; };
        readonly rTokens: { [K_2 in keyof { [K_1 in keyof RTokens]: string; }]: { [K_1 in keyof RTokens]: string; }[K_2] extends null ? null : Address; };
        readonly facadeAddress: Address;
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly wrappedNative: Address;
        readonly rtokenLens: Address;
        readonly balanceOf: Address;
        readonly curveRouterCall: Address;
        readonly ethBalanceOf: Address;
        readonly uniV3Router: Address;
        readonly curveStableSwapNGHelper: Address;
    };
};
export type Config<ChainId extends number = number, NativeToken extends NativeTokenDefinition<string, string> = NativeTokenDefinition<string, string>, CommonTokens extends Record<string, string> = {}, RTokens extends Record<string, string> = Record<string, string>, Blocktime extends number = number> = ReturnType<typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens, Blocktime>>;
export type ConfigWithToken<K extends {
    [KK in string]: string;
}> = Config<number, NativeTokenDefinition<string, string>, K, {}>;
