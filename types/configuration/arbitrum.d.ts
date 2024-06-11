import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly RSR: string;
    readonly eUSD: string;
    readonly 'ETH+': string;
    readonly RGUSD: string;
    readonly ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548";
    readonly USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
    readonly DAI: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
    readonly WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
    readonly ERC20GAS: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
    readonly cbETH: "0x1debd73e752beaf79865fd6446b0c970eae7732f";
    readonly wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529";
    readonly reth: "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8";
    readonly USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
    readonly WBTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
    readonly FRAX: "0x17fc002b466eec40dae837fc4be5c67993ddbd6f";
};
export declare const RTOKENS: {
    KNOX: string;
};
export declare const arbiConfig: {
    readonly requoteTolerance: number;
    readonly routerDeadline: number;
    readonly searcherMinRoutesToProduce: number;
    readonly searcherMaxRoutesToProduce: number;
    readonly searchConcurrency: number;
    readonly defaultInternalTradeSlippage: bigint;
    readonly maxSearchTimeMs: number;
    readonly zapMaxValueLoss: number;
    readonly zapMaxDustProduced: number;
    readonly blocktime: 250;
    readonly blockGasLimit: bigint;
    readonly simulateZapTransaction?: import("./ZapSimulation").SimulateZapTransactionFunction | undefined;
    readonly chainId: 42161;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly RSR: import("..").Address;
            readonly eUSD: import("..").Address;
            readonly 'ETH+': import("..").Address;
            readonly RGUSD: import("..").Address;
            readonly ARB: import("..").Address;
            readonly USDC: import("..").Address;
            readonly DAI: import("..").Address;
            readonly WETH: import("..").Address;
            readonly ERC20GAS: import("..").Address;
            readonly cbETH: import("..").Address;
            readonly wstETH: import("..").Address;
            readonly reth: import("..").Address;
            readonly USDT: import("..").Address;
            readonly WBTC: import("..").Address;
            readonly FRAX: import("..").Address;
        };
        readonly rTokens: {
            KNOX: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly oldFacadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly zapperAddress: import("..").Address;
        readonly wrappedNative: import("..").Address;
        readonly rtokenLens: import("..").Address;
        readonly balanceOf: import("..").Address;
        readonly curveRouterCall: import("..").Address;
        readonly ethBalanceOf: import("..").Address;
        readonly uniV3Router: import("..").Address;
        readonly curveStableSwapNGHelper: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    readonly oracles: {
        USD: {
            [x: string]: string;
            "0x912ce59144191c1204e64559fe8253a0e49e6548": string;
            "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": string;
            "0xaf88d065e77c8cc2239327c5edb3a432268e5831": string;
            "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9": string;
            "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa": string;
            "0x1debd73e752beaf79865fd6446b0c970eae7732f": string;
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": string;
            "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": string;
            "0x17fc002b466eec40dae837fc4be5c67993ddbd6f": string;
        };
        ETH: {
            "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8": string;
            "0x5979D7b546E38E414F7E9822514be443A4800529": string;
        };
        BTC: {
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": string;
        };
    };
    readonly aaveV3: {
        pool: string;
        wrappers: string[];
    };
    readonly compV3: {
        comets: string[];
        wrappers: string[];
    };
};
export type ArbitrumConfigType = typeof arbiConfig;
export type ArbitrumUniverse = Universe<ArbitrumConfigType>;
//# sourceMappingURL=arbitrum.d.ts.map