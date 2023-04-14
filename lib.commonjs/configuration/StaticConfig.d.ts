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
    ETHPlus: Address | null;
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
        readonly rtokens: Readonly<RTokens>;
        readonly aavev2: Address | null;
        readonly aavev3: Address | null;
        readonly curve: boolean;
        readonly balancer: Address | null;
        readonly commonTokens: Readonly<CommonTokens>;
    };
    constructor(nativeToken: {
        name: string;
        symbol: string;
        decimals: 18;
    }, addresses: {
        readonly executorAddress: Address;
        readonly zapperAddress: Address;
        readonly rtokens: Readonly<RTokens>;
        readonly aavev2: Address | null;
        readonly aavev3: Address | null;
        readonly curve: boolean;
        readonly balancer: Address | null;
        readonly commonTokens: Readonly<CommonTokens>;
    });
}
