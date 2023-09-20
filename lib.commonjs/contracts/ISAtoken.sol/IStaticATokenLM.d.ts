import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IStaticATokenLMInterface extends utils.Interface {
    functions: {
        "ASSET()": FunctionFragment;
        "ATOKEN()": FunctionFragment;
        "LENDING_POOL()": FunctionFragment;
        "UNDERLYING_ASSET_ADDRESS()": FunctionFragment;
        "deposit(address,uint256,uint16,bool)": FunctionFragment;
        "dynamicBalanceOf(address)": FunctionFragment;
        "dynamicToStaticAmount(uint256)": FunctionFragment;
        "rate()": FunctionFragment;
        "staticToDynamicAmount(uint256)": FunctionFragment;
        "withdraw(address,uint256,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "ASSET" | "ATOKEN" | "LENDING_POOL" | "UNDERLYING_ASSET_ADDRESS" | "deposit" | "dynamicBalanceOf" | "dynamicToStaticAmount" | "rate" | "staticToDynamicAmount" | "withdraw"): FunctionFragment;
    encodeFunctionData(functionFragment: "ASSET", values?: undefined): string;
    encodeFunctionData(functionFragment: "ATOKEN", values?: undefined): string;
    encodeFunctionData(functionFragment: "LENDING_POOL", values?: undefined): string;
    encodeFunctionData(functionFragment: "UNDERLYING_ASSET_ADDRESS", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "dynamicBalanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "dynamicToStaticAmount", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "rate", values?: undefined): string;
    encodeFunctionData(functionFragment: "staticToDynamicAmount", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    decodeFunctionResult(functionFragment: "ASSET", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ATOKEN", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "LENDING_POOL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "UNDERLYING_ASSET_ADDRESS", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "dynamicBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "dynamicToStaticAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "staticToDynamicAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    events: {};
}
export interface IStaticATokenLM extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IStaticATokenLMInterface;
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
        ASSET(overrides?: CallOverrides): Promise<[string]>;
        ATOKEN(overrides?: CallOverrides): Promise<[string]>;
        LENDING_POOL(overrides?: CallOverrides): Promise<[string]>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<[string]>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        rate(overrides?: CallOverrides): Promise<[BigNumber]>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    ASSET(overrides?: CallOverrides): Promise<string>;
    ATOKEN(overrides?: CallOverrides): Promise<string>;
    LENDING_POOL(overrides?: CallOverrides): Promise<string>;
    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;
    deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    rate(overrides?: CallOverrides): Promise<BigNumber>;
    staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        ASSET(overrides?: CallOverrides): Promise<string>;
        ATOKEN(overrides?: CallOverrides): Promise<string>;
        LENDING_POOL(overrides?: CallOverrides): Promise<string>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
    };
    filters: {};
    estimateGas: {
        ASSET(overrides?: CallOverrides): Promise<BigNumber>;
        ATOKEN(overrides?: CallOverrides): Promise<BigNumber>;
        LENDING_POOL(overrides?: CallOverrides): Promise<BigNumber>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        ASSET(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        ATOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        LENDING_POOL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
