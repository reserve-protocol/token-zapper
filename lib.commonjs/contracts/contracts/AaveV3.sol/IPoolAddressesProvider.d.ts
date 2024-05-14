import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IPoolAddressesProviderInterface extends utils.Interface {
    functions: {
        "getACLAdmin()": FunctionFragment;
        "getACLManager()": FunctionFragment;
        "getAddress(bytes32)": FunctionFragment;
        "getMarketId()": FunctionFragment;
        "getPool()": FunctionFragment;
        "getPoolConfigurator()": FunctionFragment;
        "getPoolDataProvider()": FunctionFragment;
        "getPriceOracle()": FunctionFragment;
        "getPriceOracleSentinel()": FunctionFragment;
        "setACLAdmin(address)": FunctionFragment;
        "setACLManager(address)": FunctionFragment;
        "setAddress(bytes32,address)": FunctionFragment;
        "setAddressAsProxy(bytes32,address)": FunctionFragment;
        "setMarketId(string)": FunctionFragment;
        "setPoolConfiguratorImpl(address)": FunctionFragment;
        "setPoolDataProvider(address)": FunctionFragment;
        "setPoolImpl(address)": FunctionFragment;
        "setPriceOracle(address)": FunctionFragment;
        "setPriceOracleSentinel(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getACLAdmin" | "getACLManager" | "getAddress" | "getMarketId" | "getPool" | "getPoolConfigurator" | "getPoolDataProvider" | "getPriceOracle" | "getPriceOracleSentinel" | "setACLAdmin" | "setACLManager" | "setAddress" | "setAddressAsProxy" | "setMarketId" | "setPoolConfiguratorImpl" | "setPoolDataProvider" | "setPoolImpl" | "setPriceOracle" | "setPriceOracleSentinel"): FunctionFragment;
    encodeFunctionData(functionFragment: "getACLAdmin", values?: undefined): string;
    encodeFunctionData(functionFragment: "getACLManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAddress", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "getMarketId", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPool", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPoolConfigurator", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPoolDataProvider", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPriceOracle", values?: undefined): string;
    encodeFunctionData(functionFragment: "getPriceOracleSentinel", values?: undefined): string;
    encodeFunctionData(functionFragment: "setACLAdmin", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setACLManager", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setAddress", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setAddressAsProxy", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setMarketId", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPoolConfiguratorImpl", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPoolDataProvider", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPoolImpl", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPriceOracle", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPriceOracleSentinel", values: [PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "getACLAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getACLManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getMarketId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPoolConfigurator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPoolDataProvider", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPriceOracle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPriceOracleSentinel", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setACLAdmin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setACLManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setAddressAsProxy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setMarketId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPoolConfiguratorImpl", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPoolDataProvider", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPoolImpl", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPriceOracle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPriceOracleSentinel", data: BytesLike): Result;
    events: {
        "ACLAdminUpdated(address,address)": EventFragment;
        "ACLManagerUpdated(address,address)": EventFragment;
        "AddressSet(bytes32,address,address)": EventFragment;
        "AddressSetAsProxy(bytes32,address,address,address)": EventFragment;
        "MarketIdSet(string,string)": EventFragment;
        "PoolConfiguratorUpdated(address,address)": EventFragment;
        "PoolDataProviderUpdated(address,address)": EventFragment;
        "PoolUpdated(address,address)": EventFragment;
        "PriceOracleSentinelUpdated(address,address)": EventFragment;
        "PriceOracleUpdated(address,address)": EventFragment;
        "ProxyCreated(bytes32,address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ACLAdminUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ACLManagerUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AddressSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AddressSetAsProxy"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MarketIdSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PoolConfiguratorUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PoolDataProviderUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PoolUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PriceOracleSentinelUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PriceOracleUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ProxyCreated"): EventFragment;
}
export interface ACLAdminUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type ACLAdminUpdatedEvent = TypedEvent<[
    string,
    string
], ACLAdminUpdatedEventObject>;
export type ACLAdminUpdatedEventFilter = TypedEventFilter<ACLAdminUpdatedEvent>;
export interface ACLManagerUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type ACLManagerUpdatedEvent = TypedEvent<[
    string,
    string
], ACLManagerUpdatedEventObject>;
export type ACLManagerUpdatedEventFilter = TypedEventFilter<ACLManagerUpdatedEvent>;
export interface AddressSetEventObject {
    id: string;
    oldAddress: string;
    newAddress: string;
}
export type AddressSetEvent = TypedEvent<[
    string,
    string,
    string
], AddressSetEventObject>;
export type AddressSetEventFilter = TypedEventFilter<AddressSetEvent>;
export interface AddressSetAsProxyEventObject {
    id: string;
    proxyAddress: string;
    oldImplementationAddress: string;
    newImplementationAddress: string;
}
export type AddressSetAsProxyEvent = TypedEvent<[
    string,
    string,
    string,
    string
], AddressSetAsProxyEventObject>;
export type AddressSetAsProxyEventFilter = TypedEventFilter<AddressSetAsProxyEvent>;
export interface MarketIdSetEventObject {
    oldMarketId: string;
    newMarketId: string;
}
export type MarketIdSetEvent = TypedEvent<[
    string,
    string
], MarketIdSetEventObject>;
export type MarketIdSetEventFilter = TypedEventFilter<MarketIdSetEvent>;
export interface PoolConfiguratorUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type PoolConfiguratorUpdatedEvent = TypedEvent<[
    string,
    string
], PoolConfiguratorUpdatedEventObject>;
export type PoolConfiguratorUpdatedEventFilter = TypedEventFilter<PoolConfiguratorUpdatedEvent>;
export interface PoolDataProviderUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type PoolDataProviderUpdatedEvent = TypedEvent<[
    string,
    string
], PoolDataProviderUpdatedEventObject>;
export type PoolDataProviderUpdatedEventFilter = TypedEventFilter<PoolDataProviderUpdatedEvent>;
export interface PoolUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type PoolUpdatedEvent = TypedEvent<[
    string,
    string
], PoolUpdatedEventObject>;
export type PoolUpdatedEventFilter = TypedEventFilter<PoolUpdatedEvent>;
export interface PriceOracleSentinelUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type PriceOracleSentinelUpdatedEvent = TypedEvent<[
    string,
    string
], PriceOracleSentinelUpdatedEventObject>;
export type PriceOracleSentinelUpdatedEventFilter = TypedEventFilter<PriceOracleSentinelUpdatedEvent>;
export interface PriceOracleUpdatedEventObject {
    oldAddress: string;
    newAddress: string;
}
export type PriceOracleUpdatedEvent = TypedEvent<[
    string,
    string
], PriceOracleUpdatedEventObject>;
export type PriceOracleUpdatedEventFilter = TypedEventFilter<PriceOracleUpdatedEvent>;
export interface ProxyCreatedEventObject {
    id: string;
    proxyAddress: string;
    implementationAddress: string;
}
export type ProxyCreatedEvent = TypedEvent<[
    string,
    string,
    string
], ProxyCreatedEventObject>;
export type ProxyCreatedEventFilter = TypedEventFilter<ProxyCreatedEvent>;
export interface IPoolAddressesProvider extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPoolAddressesProviderInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        getACLAdmin(overrides?: CallOverrides): Promise<[string]>;
        getACLManager(overrides?: CallOverrides): Promise<[string]>;
        getAddress(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[string]>;
        getMarketId(overrides?: CallOverrides): Promise<[string]>;
        getPool(overrides?: CallOverrides): Promise<[string]>;
        getPoolConfigurator(overrides?: CallOverrides): Promise<[string]>;
        getPoolDataProvider(overrides?: CallOverrides): Promise<[string]>;
        getPriceOracle(overrides?: CallOverrides): Promise<[string]>;
        getPriceOracleSentinel(overrides?: CallOverrides): Promise<[string]>;
        setACLAdmin(newAclAdmin: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setACLManager(newAclManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setAddress(id: PromiseOrValue<BytesLike>, newAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setAddressAsProxy(id: PromiseOrValue<BytesLike>, newImplementationAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setMarketId(newMarketId: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPoolConfiguratorImpl(newPoolConfiguratorImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPoolDataProvider(newDataProvider: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPoolImpl(newPoolImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPriceOracle(newPriceOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPriceOracleSentinel(newPriceOracleSentinel: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    getACLAdmin(overrides?: CallOverrides): Promise<string>;
    getACLManager(overrides?: CallOverrides): Promise<string>;
    getAddress(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
    getMarketId(overrides?: CallOverrides): Promise<string>;
    getPool(overrides?: CallOverrides): Promise<string>;
    getPoolConfigurator(overrides?: CallOverrides): Promise<string>;
    getPoolDataProvider(overrides?: CallOverrides): Promise<string>;
    getPriceOracle(overrides?: CallOverrides): Promise<string>;
    getPriceOracleSentinel(overrides?: CallOverrides): Promise<string>;
    setACLAdmin(newAclAdmin: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setACLManager(newAclManager: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setAddress(id: PromiseOrValue<BytesLike>, newAddress: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setAddressAsProxy(id: PromiseOrValue<BytesLike>, newImplementationAddress: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setMarketId(newMarketId: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPoolConfiguratorImpl(newPoolConfiguratorImpl: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPoolDataProvider(newDataProvider: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPoolImpl(newPoolImpl: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPriceOracle(newPriceOracle: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPriceOracleSentinel(newPriceOracleSentinel: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        getACLAdmin(overrides?: CallOverrides): Promise<string>;
        getACLManager(overrides?: CallOverrides): Promise<string>;
        getAddress(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<string>;
        getMarketId(overrides?: CallOverrides): Promise<string>;
        getPool(overrides?: CallOverrides): Promise<string>;
        getPoolConfigurator(overrides?: CallOverrides): Promise<string>;
        getPoolDataProvider(overrides?: CallOverrides): Promise<string>;
        getPriceOracle(overrides?: CallOverrides): Promise<string>;
        getPriceOracleSentinel(overrides?: CallOverrides): Promise<string>;
        setACLAdmin(newAclAdmin: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setACLManager(newAclManager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setAddress(id: PromiseOrValue<BytesLike>, newAddress: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setAddressAsProxy(id: PromiseOrValue<BytesLike>, newImplementationAddress: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setMarketId(newMarketId: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPoolConfiguratorImpl(newPoolConfiguratorImpl: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPoolDataProvider(newDataProvider: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPoolImpl(newPoolImpl: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPriceOracle(newPriceOracle: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPriceOracleSentinel(newPriceOracleSentinel: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ACLAdminUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): ACLAdminUpdatedEventFilter;
        ACLAdminUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): ACLAdminUpdatedEventFilter;
        "ACLManagerUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): ACLManagerUpdatedEventFilter;
        ACLManagerUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): ACLManagerUpdatedEventFilter;
        "AddressSet(bytes32,address,address)"(id?: PromiseOrValue<BytesLike> | null, oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): AddressSetEventFilter;
        AddressSet(id?: PromiseOrValue<BytesLike> | null, oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): AddressSetEventFilter;
        "AddressSetAsProxy(bytes32,address,address,address)"(id?: PromiseOrValue<BytesLike> | null, proxyAddress?: PromiseOrValue<string> | null, oldImplementationAddress?: null, newImplementationAddress?: PromiseOrValue<string> | null): AddressSetAsProxyEventFilter;
        AddressSetAsProxy(id?: PromiseOrValue<BytesLike> | null, proxyAddress?: PromiseOrValue<string> | null, oldImplementationAddress?: null, newImplementationAddress?: PromiseOrValue<string> | null): AddressSetAsProxyEventFilter;
        "MarketIdSet(string,string)"(oldMarketId?: PromiseOrValue<string> | null, newMarketId?: PromiseOrValue<string> | null): MarketIdSetEventFilter;
        MarketIdSet(oldMarketId?: PromiseOrValue<string> | null, newMarketId?: PromiseOrValue<string> | null): MarketIdSetEventFilter;
        "PoolConfiguratorUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolConfiguratorUpdatedEventFilter;
        PoolConfiguratorUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolConfiguratorUpdatedEventFilter;
        "PoolDataProviderUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolDataProviderUpdatedEventFilter;
        PoolDataProviderUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolDataProviderUpdatedEventFilter;
        "PoolUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolUpdatedEventFilter;
        PoolUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PoolUpdatedEventFilter;
        "PriceOracleSentinelUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PriceOracleSentinelUpdatedEventFilter;
        PriceOracleSentinelUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PriceOracleSentinelUpdatedEventFilter;
        "PriceOracleUpdated(address,address)"(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PriceOracleUpdatedEventFilter;
        PriceOracleUpdated(oldAddress?: PromiseOrValue<string> | null, newAddress?: PromiseOrValue<string> | null): PriceOracleUpdatedEventFilter;
        "ProxyCreated(bytes32,address,address)"(id?: PromiseOrValue<BytesLike> | null, proxyAddress?: PromiseOrValue<string> | null, implementationAddress?: PromiseOrValue<string> | null): ProxyCreatedEventFilter;
        ProxyCreated(id?: PromiseOrValue<BytesLike> | null, proxyAddress?: PromiseOrValue<string> | null, implementationAddress?: PromiseOrValue<string> | null): ProxyCreatedEventFilter;
    };
    estimateGas: {
        getACLAdmin(overrides?: CallOverrides): Promise<BigNumber>;
        getACLManager(overrides?: CallOverrides): Promise<BigNumber>;
        getAddress(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        getMarketId(overrides?: CallOverrides): Promise<BigNumber>;
        getPool(overrides?: CallOverrides): Promise<BigNumber>;
        getPoolConfigurator(overrides?: CallOverrides): Promise<BigNumber>;
        getPoolDataProvider(overrides?: CallOverrides): Promise<BigNumber>;
        getPriceOracle(overrides?: CallOverrides): Promise<BigNumber>;
        getPriceOracleSentinel(overrides?: CallOverrides): Promise<BigNumber>;
        setACLAdmin(newAclAdmin: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setACLManager(newAclManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setAddress(id: PromiseOrValue<BytesLike>, newAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setAddressAsProxy(id: PromiseOrValue<BytesLike>, newImplementationAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setMarketId(newMarketId: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPoolConfiguratorImpl(newPoolConfiguratorImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPoolDataProvider(newDataProvider: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPoolImpl(newPoolImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPriceOracle(newPriceOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPriceOracleSentinel(newPriceOracleSentinel: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getACLAdmin(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getACLManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAddress(id: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getMarketId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPoolConfigurator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPoolDataProvider(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPriceOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPriceOracleSentinel(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setACLAdmin(newAclAdmin: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setACLManager(newAclManager: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setAddress(id: PromiseOrValue<BytesLike>, newAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setAddressAsProxy(id: PromiseOrValue<BytesLike>, newImplementationAddress: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setMarketId(newMarketId: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPoolConfiguratorImpl(newPoolConfiguratorImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPoolDataProvider(newDataProvider: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPoolImpl(newPoolImpl: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPriceOracle(newPriceOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPriceOracleSentinel(newPriceOracleSentinel: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
