export { Address } from './base/Address';
export { Token, TokenQuantity } from './entities/Token';
export { arbiConfig } from './configuration/arbitrum';
export { setupArbitrumZapper } from './configuration/setupArbitrumZapper';
export { baseConfig } from './configuration/base';
export { setupBaseZapper } from './configuration/setupBaseZapper';
export { ethereumConfig } from './configuration/ethereum';
export { setupEthereumZapper } from './configuration/setupEthereumZapper';
import { ArbitrumUniverse } from './configuration/arbitrum';
import { BaseUniverse } from './configuration/base';
import { EthereumUniverse } from './configuration/ethereum';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainIds } from './configuration/ReserveAddresses';
import { Universe } from './Universe';
export { type Config } from './configuration/ChainConfiguration';
export declare const configuration: {
    utils: {
        loadTokens: (universe: Universe<import("./configuration/ChainConfiguration").Config<number, any, {
            [x: string]: string;
        }, {
            [x: string]: string;
        }>>, tokens: import("./configuration/loadTokens").JsonTokenEntry[]) => Promise<void>;
    };
    makeConfig: <const ChainId extends number, const NativeToken extends import("./configuration/ChainConfiguration").NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, string>, const Blocktime extends number>(chainId: ChainId, nativeToken: NativeToken, commonTokens: CommonTokens, rTokenDeployments: RTokens, addresses: {
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
            readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : import("./base/Address").Address; };
            readonly rTokens: { [K_2 in keyof { [K_1 in keyof RTokens]: string; }]: { [K_1 in keyof RTokens]: string; }[K_2] extends null ? null : import("./base/Address").Address; };
            readonly facadeAddress: import("./base/Address").Address;
            readonly executorAddress: import("./base/Address").Address;
            readonly zapperAddress: import("./base/Address").Address;
            readonly wrappedNative: import("./base/Address").Address;
            readonly rtokenLens: import("./base/Address").Address;
            readonly balanceOf: import("./base/Address").Address;
            readonly curveRouterCall: import("./base/Address").Address;
            readonly ethBalanceOf: import("./base/Address").Address;
            readonly uniV3Router: import("./base/Address").Address;
            readonly curveStableSwapNGHelper: import("./base/Address").Address;
        };
    };
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
export { loadRToken } from './configuration/setupRTokens';
export { createKyberswap } from './aggregators/Kyberswap';
export { createEnso } from './aggregators/Enso';
export { createDefillama } from './aggregators/DefiLlama';
export { DexAggregator, createOneInchDexAggregator, } from './aggregators/oneInch/oneInchRegistry';
type ChainIdToUni = {
    [ChainIds.Arbitrum]: ArbitrumUniverse;
    [ChainIds.Base]: BaseUniverse;
    [ChainIds.Mainnet]: EthereumUniverse;
};
export declare const fromProvider: <const ID extends 1 | 8453 | 42161>(provider: JsonRpcProvider, chainId: ID) => Promise<ChainIdToUni[ID]>;
//# sourceMappingURL=index.d.ts.map