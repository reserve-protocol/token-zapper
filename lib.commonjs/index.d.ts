export { Address } from './base/Address';
export { Token, TokenQuantity } from './entities/Token';
export { type Config } from './configuration/ChainConfiguration';
export declare const configuration: {
    utils: {
        loadTokens: (universe: import("./Universe").Universe<import("./configuration/ChainConfiguration").Config<number, any, {
            [x: string]: string;
        }, {
            [x: string]: {
                erc20: string;
                main: string;
            };
        }>>, tokens: import("./configuration/loadTokens").JsonTokenEntry[]) => Promise<void>;
    };
    makeConfig: <const ChainId extends number, const NativeToken extends import("./configuration/ChainConfiguration").NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, {
        main: string;
        erc20: string;
    }>>(chainId: ChainId, nativeToken: NativeToken, commonTokens: CommonTokens, rTokenDeployments: RTokens, addresses: {
        executorAddress: string;
        zapperAddress: string;
    }) => {
        chainId: ChainId;
        nativeToken: NativeToken;
        addresses: {
            commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : import("./base/Address").Address; };
            rTokenDeployments: { [K_2 in keyof RTokens]: string; } extends infer T extends Record<string, unknown> ? { [K_1 in keyof T]: { [K_2 in keyof RTokens]: string; }[K_1] extends null ? null : import("./base/Address").Address; } : never;
            rTokens: { [K_4 in keyof RTokens]: string; } extends infer T_1 extends Record<string, unknown> ? { [K_3 in keyof T_1]: { [K_4 in keyof RTokens]: string; }[K_3] extends null ? null : import("./base/Address").Address; } : never;
            executorAddress: import("./base/Address").Address;
            zapperAddress: import("./base/Address").Address;
        };
    };
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
