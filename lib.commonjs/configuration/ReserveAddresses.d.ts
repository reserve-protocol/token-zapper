import { Address } from '../base/Address';
export declare const ChainIds: {
    readonly Mainnet: 1;
    readonly Base: 8453;
    readonly Arbitrum: 42161;
    readonly Hardhat: 31337;
};
type ChainName = keyof typeof ChainIds;
type ChainId = (typeof ChainIds)[ChainName];
export declare const isChainIdSupported: (chainId: number) => chainId is ChainId;
export type AddressMap = Record<ChainId, Address | null>;
/**
 * Protocol related contracts
 */
export declare const DEPLOYER_ADDRESS: Record<ChainId, Address | null>;
export declare const FACADE_ADDRESS: Record<ChainId, Address | null>;
export declare const FACADE_ACT_ADDRESS: AddressMap;
export declare const FACADE_WRITE_ADDRESS: AddressMap;
/**
 * ERC20 token addresses
 */
export declare const RSR_ADDRESS: AddressMap;
export declare const EUSD_ADDRESS: AddressMap;
export declare const RGUSD_ADDRESS: AddressMap;
export declare const ETHPLUS_ADDRESS: AddressMap;
/**
 * Other contract addresses
 */
export declare const ENS_ADDRESS: AddressMap;
/**
 * Rewards addresses
 */
export declare const STAKE_AAVE_ADDRESS: AddressMap;
export declare const COMP_ADDRESS: AddressMap;
export declare const CRV_ADDRESS: AddressMap;
export declare const CVX_ADDRESS: AddressMap;
export declare const STG_ADDRESS: AddressMap;
export declare const getAddressesForChain: (chainId: ChainId) => {
    config: {
        DEPLOYER_ADDRESS: Address | null;
        FACADE_ADDRESS: Address | null;
        FACADE_ACT_ADDRESS: Address | null;
        FACADE_WRITE_ADDRESS: Address | null;
        RSR_ADDRESS: Address | null;
        EUSD_ADDRESS: Address | null;
        RGUSD_ADDRESS: Address | null;
        ETHPLUS_ADDRESS: Address | null;
        ENS_ADDRESS: Address | null;
        STAKE_AAVE_ADDRESS: Address | null;
        COMP_ADDRESS: Address | null;
        CRV_ADDRESS: Address | null;
        CVX_ADDRESS: Address | null;
        STG_ADDRESS: Address | null;
    };
} & {
    DEPLOYER_ADDRESS: string;
    FACADE_ADDRESS: string;
    FACADE_ACT_ADDRESS: string;
    FACADE_WRITE_ADDRESS: string;
    RSR_ADDRESS: string;
    EUSD_ADDRESS: string;
    RGUSD_ADDRESS: string;
    ETHPLUS_ADDRESS: string;
    ENS_ADDRESS: string;
    STAKE_AAVE_ADDRESS: string;
    COMP_ADDRESS: string;
    CRV_ADDRESS: string;
    CVX_ADDRESS: string;
    STG_ADDRESS: string;
};
export {};
