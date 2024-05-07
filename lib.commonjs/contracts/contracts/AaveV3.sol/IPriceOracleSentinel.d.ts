import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IPriceOracleSentinelInterface extends utils.Interface {
    functions: {
        "ADDRESSES_PROVIDER()": FunctionFragment;
        "getGracePeriod()": FunctionFragment;
        "getSequencerOracle()": FunctionFragment;
        "isBorrowAllowed()": FunctionFragment;
        "isLiquidationAllowed()": FunctionFragment;
        "setGracePeriod(uint256)": FunctionFragment;
        "setSequencerOracle(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "ADDRESSES_PROVIDER" | "getGracePeriod" | "getSequencerOracle" | "isBorrowAllowed" | "isLiquidationAllowed" | "setGracePeriod" | "setSequencerOracle"): FunctionFragment;
    encodeFunctionData(functionFragment: "ADDRESSES_PROVIDER", values?: undefined): string;
    encodeFunctionData(functionFragment: "getGracePeriod", values?: undefined): string;
    encodeFunctionData(functionFragment: "getSequencerOracle", values?: undefined): string;
    encodeFunctionData(functionFragment: "isBorrowAllowed", values?: undefined): string;
    encodeFunctionData(functionFragment: "isLiquidationAllowed", values?: undefined): string;
    encodeFunctionData(functionFragment: "setGracePeriod", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "setSequencerOracle", values: [PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "ADDRESSES_PROVIDER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getGracePeriod", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSequencerOracle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isBorrowAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isLiquidationAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setGracePeriod", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setSequencerOracle", data: BytesLike): Result;
    events: {
        "GracePeriodUpdated(uint256)": EventFragment;
        "SequencerOracleUpdated(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "GracePeriodUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SequencerOracleUpdated"): EventFragment;
}
export interface GracePeriodUpdatedEventObject {
    newGracePeriod: BigNumber;
}
export type GracePeriodUpdatedEvent = TypedEvent<[
    BigNumber
], GracePeriodUpdatedEventObject>;
export type GracePeriodUpdatedEventFilter = TypedEventFilter<GracePeriodUpdatedEvent>;
export interface SequencerOracleUpdatedEventObject {
    newSequencerOracle: string;
}
export type SequencerOracleUpdatedEvent = TypedEvent<[
    string
], SequencerOracleUpdatedEventObject>;
export type SequencerOracleUpdatedEventFilter = TypedEventFilter<SequencerOracleUpdatedEvent>;
export interface IPriceOracleSentinel extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPriceOracleSentinelInterface;
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
        ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<[string]>;
        getGracePeriod(overrides?: CallOverrides): Promise<[BigNumber]>;
        getSequencerOracle(overrides?: CallOverrides): Promise<[string]>;
        isBorrowAllowed(overrides?: CallOverrides): Promise<[boolean]>;
        isLiquidationAllowed(overrides?: CallOverrides): Promise<[boolean]>;
        setGracePeriod(newGracePeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setSequencerOracle(newSequencerOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<string>;
    getGracePeriod(overrides?: CallOverrides): Promise<BigNumber>;
    getSequencerOracle(overrides?: CallOverrides): Promise<string>;
    isBorrowAllowed(overrides?: CallOverrides): Promise<boolean>;
    isLiquidationAllowed(overrides?: CallOverrides): Promise<boolean>;
    setGracePeriod(newGracePeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setSequencerOracle(newSequencerOracle: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<string>;
        getGracePeriod(overrides?: CallOverrides): Promise<BigNumber>;
        getSequencerOracle(overrides?: CallOverrides): Promise<string>;
        isBorrowAllowed(overrides?: CallOverrides): Promise<boolean>;
        isLiquidationAllowed(overrides?: CallOverrides): Promise<boolean>;
        setGracePeriod(newGracePeriod: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        setSequencerOracle(newSequencerOracle: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "GracePeriodUpdated(uint256)"(newGracePeriod?: null): GracePeriodUpdatedEventFilter;
        GracePeriodUpdated(newGracePeriod?: null): GracePeriodUpdatedEventFilter;
        "SequencerOracleUpdated(address)"(newSequencerOracle?: null): SequencerOracleUpdatedEventFilter;
        SequencerOracleUpdated(newSequencerOracle?: null): SequencerOracleUpdatedEventFilter;
    };
    estimateGas: {
        ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<BigNumber>;
        getGracePeriod(overrides?: CallOverrides): Promise<BigNumber>;
        getSequencerOracle(overrides?: CallOverrides): Promise<BigNumber>;
        isBorrowAllowed(overrides?: CallOverrides): Promise<BigNumber>;
        isLiquidationAllowed(overrides?: CallOverrides): Promise<BigNumber>;
        setGracePeriod(newGracePeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setSequencerOracle(newSequencerOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        ADDRESSES_PROVIDER(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getGracePeriod(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSequencerOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isBorrowAllowed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isLiquidationAllowed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setGracePeriod(newGracePeriod: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setSequencerOracle(newSequencerOracle: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
