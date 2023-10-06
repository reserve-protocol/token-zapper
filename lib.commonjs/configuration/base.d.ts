import { type Universe } from '../Universe';
export declare const COMMON_TOKENS: {
    readonly USDC: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
    readonly DAI: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb";
    readonly WETH: "0x4200000000000000000000000000000000000006";
    readonly ERC20GAS: "0x4200000000000000000000000000000000000006";
};
export declare const RTOKENS: {
    readonly eUSD: {
        readonly main: "0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a";
        readonly erc20: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F";
    };
};
export declare const ethereumConfig: {
    readonly chainId: 8453;
    readonly nativeToken: {
        readonly symbol: "ETH";
        readonly decimals: 18;
        readonly name: "Ether";
    };
    readonly addresses: {
        readonly commonTokens: {
            readonly USDC: import("..").Address;
            readonly DAI: import("..").Address;
            readonly WETH: import("..").Address;
            readonly ERC20GAS: import("..").Address;
        };
        readonly rTokenDeployments: {
            readonly eUSD: import("..").Address;
        };
        readonly rTokens: {
            readonly eUSD: import("..").Address;
        };
        readonly facadeAddress: import("..").Address;
        readonly executorAddress: import("..").Address;
        readonly zapperAddress: import("..").Address;
    };
};
export declare const PROTOCOL_CONFIGS: {
    aave: {
        tokenWrappers: string[];
    };
    erc4626: never[];
    compoundV3: {
        markets: {
            baseToken: string;
            receiptToken: string;
            vaults: string[];
        }[];
    };
};
export type EthereumConfigType = typeof ethereumConfig;
export type EthereumUniverse = Universe<EthereumConfigType>;
