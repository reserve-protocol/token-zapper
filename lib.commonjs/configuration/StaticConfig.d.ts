import { type Address } from '../base/Address';
export interface CommonTokens {
    USDC: Address | null;
    USDT: Address | null;
    DAI: Address | null;
    WBTC: Address | null;
    ERC20ETH: Address | null;
    ERC20GAS: Address | null;
}
export interface RTokens {
    eUSD: Address | null;
    "ETH+": Address | null;
}
export declare class StaticConfig {
    readonly nativeToken: {
        name: string;
        symbol: string;
        decimals: 18;
    };
    readonly addresses: {
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly rTokenDeployments: Readonly<RTokens>;
        readonly aavev2: Address | null;
        readonly aavev3: Address | null;
        readonly balancer: Address | null;
        readonly commonTokens: Readonly<CommonTokens>;
    };
    readonly curveConfig: {
        enable: boolean;
    };
    constructor(nativeToken: {
        name: string;
        symbol: string;
        decimals: 18;
    }, addresses: {
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly rTokenDeployments: Readonly<RTokens>;
        readonly aavev2: Address | null;
        readonly aavev3: Address | null;
        readonly balancer: Address | null;
        readonly commonTokens: Readonly<CommonTokens>;
    }, curveConfig: {
        enable: boolean;
    });
}
