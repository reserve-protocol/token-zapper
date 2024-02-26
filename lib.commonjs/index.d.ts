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
        facadeAddress: string;
        executorAddress: string;
        zapperAddress: string;
        wrappedNative: string;
        rtokenLens: string;
        balanceOf: string;
        curveRouterCall: string;
        ethBalanceOf: string;
    }) => {
        readonly chainId: ChainId;
        readonly nativeToken: NativeToken;
        readonly addresses: {
            readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : import("./base/Address").Address; };
            readonly rTokenDeployments: { [K_2 in keyof { [K_1 in keyof RTokens]: string; }]: { [K_1 in keyof RTokens]: string; }[K_2] extends null ? null : import("./base/Address").Address; };
            readonly rTokens: { [K_4 in keyof { [K_3 in keyof RTokens]: string; }]: { [K_3 in keyof RTokens]: string; }[K_4] extends null ? null : import("./base/Address").Address; };
            readonly facadeAddress: import("./base/Address").Address;
            readonly executorAddress: import("./base/Address").Address;
            readonly zapperAddress: import("./base/Address").Address;
            readonly wrappedNative: import("./base/Address").Address;
            readonly rtokenLens: import("./base/Address").Address;
            readonly balanceOf: import("./base/Address").Address;
            readonly curveRouterCall: import("./base/Address").Address;
            readonly ethBalanceOf: import("./base/Address").Address;
        };
    };
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
export { ethereumConfig } from './configuration/ethereum';
export { setupEthereumZapper } from './configuration/setupEthereumZapper';
export { baseConfig } from './configuration/base';
export { setupBaseZapper } from './configuration/setupBaseZapper';
export { createKyberswap } from './aggregators/Kyberswap';
export { createEnso } from './aggregators/Enso';
export { createDefillama } from './aggregators/DefiLlama';
export { DexAggregator, createOneInchDexAggregator, } from './aggregators/oneInch/oneInchRegistry';
