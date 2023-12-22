import { Address } from '../base/Address';
export interface NativeTokenDefinition<Name extends string, Symbol extends string> {
    name: Name;
    symbol: Symbol;
    decimals: number;
}
export declare const makeConfig: <const ChainId extends number, const NativeToken extends NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, {
    main: string;
    erc20: string;
}>>(chainId: ChainId, nativeToken: NativeToken, commonTokens: CommonTokens, rTokenDeployments: RTokens, addresses: {
    facadeAddress: string;
    executorAddress: string;
    zapperAddress: string;
    wrappedNative: string;
    rtokenLens: string;
}) => {
    readonly chainId: ChainId;
    readonly nativeToken: NativeToken;
    readonly addresses: {
        readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : Address; };
        readonly rTokenDeployments: { [K_2 in keyof RTokens]: string; } extends infer T extends Record<string, unknown> ? { [K_1 in keyof T]: { [K_2 in keyof RTokens]: string; }[K_1] extends null ? null : Address; } : never;
        readonly rTokens: { [K_4 in keyof RTokens]: string; } extends infer T_1 extends Record<string, unknown> ? { [K_3 in keyof T_1]: { [K_4 in keyof RTokens]: string; }[K_3] extends null ? null : Address; } : never;
        readonly facadeAddress: Address;
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly wrappedNative: Address;
        readonly rtokenLens: Address;
    };
};
export type Config<ChainId extends number = number, NativeToken extends NativeTokenDefinition<string, string> = NativeTokenDefinition<string, string>, CommonTokens extends Record<string, string> = {}, RTokens extends Record<string, {
    main: string;
    erc20: string;
}> = Record<string, {
    main: string;
    erc20: string;
}>> = ReturnType<(typeof makeConfig<ChainId, NativeToken, CommonTokens, RTokens>)>;
export type ConfigWithToken<K extends {
    [KK in string]: string;
}> = Config<number, NativeTokenDefinition<string, string>, K, {}>;
