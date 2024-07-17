export { Address } from './base/Address';
export { Token, TokenQuantity } from './entities/Token';
export { ArbitrumUniverse, arbiConfig } from './configuration/arbitrum';
export { setupArbitrumZapper } from './configuration/setupArbitrumZapper';
export { BaseUniverse, baseConfig } from './configuration/base';
export { setupBaseZapper } from './configuration/setupBaseZapper';
export { ethereumConfig } from './configuration/ethereum';
export { setupEthereumZapper } from './configuration/setupEthereumZapper';
import { ArbitrumUniverse } from './configuration/arbitrum';
import { BaseUniverse } from './configuration/base';
import { EthereumUniverse } from './configuration/ethereum';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ChainId, ChainIds } from './configuration/ReserveAddresses';
import { Universe } from './Universe';
export { createParaswap } from './aggregators/Paraswap';
export { type Config } from './configuration/ChainConfiguration';
export { makeCustomRouterSimulator, createSimulateZapTransactionUsingProvider, SimulateParams, } from './configuration/ZapSimulation';
export declare const configuration: {
    utils: {
        loadTokens: (universe: Universe<import("./configuration/ChainConfiguration").Config<number, any, {
            [x: string]: string;
        }, {
            [x: string]: string;
        }>>, tokens: import("./configuration/loadTokens").JsonTokenEntry[]) => Promise<void>;
    };
    makeConfig: <const ChainId_1 extends number, const NativeToken extends import("./configuration/ChainConfiguration").NativeTokenDefinition<string, string>, const CommonTokens extends Record<string, string>, const RTokens extends Record<string, string>, const Blocktime extends number>(chainId: ChainId_1, nativeToken: NativeToken, commonTokens: CommonTokens, rTokens: RTokens, addresses: {
        facadeAddress: string;
        oldFacadeAddress: string;
        executorAddress: string;
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
    } & Partial<import("./configuration/ChainConfiguration").SearcherOptions>) => {
        readonly requoteTolerance: number;
        readonly routerDeadline: number;
        readonly searcherMinRoutesToProduce: number;
        readonly searcherMaxRoutesToProduce: number;
        readonly searchConcurrency: number;
        readonly defaultInternalTradeSlippage: bigint;
        readonly maxSearchTimeMs: number;
        readonly zapMaxValueLoss: number;
        readonly zapMaxDustProduced: number;
        readonly blocktime: Blocktime;
        readonly blockGasLimit: bigint;
        readonly simulateZapTransaction?: import("./configuration/ZapSimulation").SimulateZapTransactionFunction | undefined;
        readonly chainId: ChainId_1;
        readonly nativeToken: NativeToken;
        readonly addresses: {
            readonly commonTokens: { [K in keyof CommonTokens]: CommonTokens[K] extends null ? null : import("./base/Address").Address; };
            readonly rTokens: { [K_2 in keyof { [K_1 in keyof RTokens]: string; }]: { [K_1 in keyof RTokens]: string; }[K_2] extends null ? null : import("./base/Address").Address; };
            readonly facadeAddress: import("./base/Address").Address;
            readonly oldFacadeAddress: import("./base/Address").Address;
            readonly executorAddress: import("./base/Address").Address;
            readonly zapperAddress: import("./base/Address").Address;
            readonly wrappedNative: import("./base/Address").Address;
            readonly rtokenLens: import("./base/Address").Address;
            readonly balanceOf: import("./base/Address").Address;
            readonly curveRouterCall: import("./base/Address").Address;
            readonly ethBalanceOf: import("./base/Address").Address;
            readonly uniV3Router: import("./base/Address").Address;
            readonly curveStableSwapNGHelper: import("./base/Address").Address;
            readonly curveCryptoFactoryHelper: import("./base/Address").Address;
        };
    };
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
export { createKyberswap } from './aggregators/Kyberswap';
export { createEnso } from './aggregators/Enso';
type ChainIdToUni = {
    [ChainIds.Arbitrum]: ArbitrumUniverse;
    [ChainIds.Base]: BaseUniverse;
    [ChainIds.Mainnet]: EthereumUniverse;
};
export declare const fromProvider: <const ID extends ChainId>(provider: JsonRpcProvider, withDexes?: boolean) => Promise<ChainIdToUni[ID]>;
//# sourceMappingURL=index.d.ts.map