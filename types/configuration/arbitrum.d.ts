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
    TEST_RTOKEN: string;
};
export declare const arbiConfig: {
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
            TEST_RTOKEN: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
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
        readonly USD: {
            readonly [x: string]: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6" | "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB" | "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3" | "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7" | "0xcfF9349ec6d027f20fC9360117fef4a1Ad38B488" | "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57" | "0xa668682974E3f121185a3cD94f00322beC674275" | "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612" | "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8";
            readonly "0x912ce59144191c1204e64559fe8253a0e49e6548": "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6";
            readonly "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB";
            readonly "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3";
            readonly "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9": "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7";
            readonly "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa": "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57";
            readonly "0x1debd73e752beaf79865fd6446b0c970eae7732f": "0xa668682974E3f121185a3cD94f00322beC674275";
            readonly "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
            readonly "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612";
            readonly "0x17fc002b466eec40dae837fc4be5c67993ddbd6f": "0x0809E3d38d1B4214958faf06D8b1B1a2b73f2ab8";
        };
        readonly ETH: {
            readonly "0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8": "0xD6aB2298946840262FcC278fF31516D39fF611eF";
            readonly "0x5979D7b546E38E414F7E9822514be443A4800529": "0xb523AE262D20A936BC152e6023996e46FDC2A95D";
        };
        readonly BTC: {
            readonly "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f": "0x6ce185860a4963106506C203335A2910413708e9";
        };
    };
    readonly aaveV3: {
        readonly pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
        readonly wrappers: readonly ["0x030cDeCBDcA6A34e8De3f49d1798d5f70E3a3414", "0xffef97179f58a582dEf73e6d2e4BcD2BDC8ca128"];
    };
    readonly compV3: {
        readonly comets: readonly ["0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA", "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf"];
        readonly wrappers: readonly ["0xd54804250e9c561aea9dee34e9cf2342f767acc5"];
    };
};
export type ArbitrumConfigType = typeof arbiConfig;
export type ArbitrumUniverse = Universe<ArbitrumConfigType>;
//# sourceMappingURL=arbitrum.d.ts.map