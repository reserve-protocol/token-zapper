import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly USDC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA";
    readonly USDbC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    readonly DAI: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb";
    readonly WETH: "0x4200000000000000000000000000000000000006";
    readonly ERC20GAS: "0x4200000000000000000000000000000000000006";
};
export declare const RTOKENS: {
    readonly testUSD: {
        readonly main: "0x4A8A34eEFc4892BF2d663FFd85668E80d54c3fE6";
        readonly erc20: "0x50249C768A6D3Cb4B6565c0a2bfBDb62BE94915C";
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
            readonly testUSD: import("..").Address;
        };
        readonly rTokens: {
            readonly testUSD: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly zapperAddress: import("..").Address;
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
