import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    readonly USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";
    readonly DAI: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb";
    readonly WETH: "0x4200000000000000000000000000000000000006";
    readonly ERC20GAS: "0x4200000000000000000000000000000000000006";
};
export declare const RTOKENS: {
    readonly hyUSD: {
        readonly main: "0xA582985c68ED30a052Ff0b07D74931140bd5a00F";
        readonly erc20: "0xCc7FF230365bD730eE4B352cC2492CEdAC49383e";
    };
};
export declare const baseConfig: {
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
        };
        readonly rTokenDeployments: {
            readonly hyUSD: import("..").Address;
        };
        readonly rTokens: {
            readonly hyUSD: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly zapperAddress: import("..").Address;
        readonly wrappedNative: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    usdPriceOracles: {
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": string;
        "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": string;
        "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": string;
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": string;
        "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": string;
    };
    ethPriceOracles: {
        "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": string;
    };
    aave: {
        tokenWrappers: string[];
    };
    stargate: {
        router: string;
        wrappers: string[];
        tokens: string[];
    };
    compoundV3: {
        markets: {
            baseToken: string;
            receiptToken: string;
            vaults: string[];
        }[];
    };
};
export type BaseConfigType = typeof baseConfig;
export type BaseUniverse = Universe<BaseConfigType>;
