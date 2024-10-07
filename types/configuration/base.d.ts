import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    readonly USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";
    readonly DAI: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb";
    readonly WETH: "0x4200000000000000000000000000000000000006";
    readonly ERC20GAS: "0x4200000000000000000000000000000000000006";
    readonly cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22";
    readonly wstETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
};
export declare const RTOKENS: {
    readonly hyUSD: "0xCc7FF230365bD730eE4B352cC2492CEdAC49383e";
    readonly bsd: "0xcb327b99ff831bf8223cced12b1338ff3aa322ff";
    readonly iUSD: "0xfE0D6D83033e313691E96909d2188C150b834285";
    readonly MATT: "0x641b0453487c9d14c5df96d45a481ef1dc84e31f";
};
export declare const baseConfig: {
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
    readonly blocktime: 2000;
    readonly blockGasLimit: bigint;
    readonly simulateZapTransaction?: import("./ZapSimulation").SimulateZapTransactionFunction | undefined;
    readonly chainId: 8453;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly USDC: import("..").Address;
            readonly USDbC: import("..").Address;
            readonly DAI: import("..").Address;
            readonly WETH: import("..").Address;
            readonly ERC20GAS: import("..").Address;
            readonly cbETH: import("..").Address;
            readonly wstETH: import("..").Address;
        };
        readonly rTokens: {
            readonly hyUSD: import("..").Address;
            readonly bsd: import("..").Address;
            readonly iUSD: import("..").Address;
            readonly MATT: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly oldFacadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly emitId: import("..").Address;
        readonly zapperAddress: import("..").Address;
        readonly wrappedNative: import("..").Address;
        readonly rtokenLens: import("..").Address;
        readonly balanceOf: import("..").Address;
        readonly curveRouterCall: import("..").Address;
        readonly ethBalanceOf: import("..").Address;
        readonly uniV3Router: import("..").Address;
        readonly curveStableSwapNGHelper: import("..").Address;
        readonly curveCryptoFactoryHelper: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    usdPriceOracles: {
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': string;
        '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA': string;
        '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': string;
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": string;
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': string;
    };
    ethPriceOracles: {
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': string;
        '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452': string;
    };
    aaveV3: {
        pool: string;
        wrappers: string[];
    };
    compV3: {
        comets: {
            CUSDCV3: string;
            CUSDbCV3: string;
            CWETHV3: string;
        };
        wrappers: string[];
    };
    stargate: {
        router: string;
        wrappers: string[];
        tokens: string[];
    };
};
export type BaseConfigType = typeof baseConfig;
export type BaseUniverse = Universe<BaseConfigType>;
//# sourceMappingURL=base.d.ts.map