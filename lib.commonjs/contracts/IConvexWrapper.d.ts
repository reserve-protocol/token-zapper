import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface IConvexWrapperInterface extends utils.Interface {
    functions: {
        "convexPool()": FunctionFragment;
        "convexPoolId()": FunctionFragment;
        "convexToken()": FunctionFragment;
        "curveToken()": FunctionFragment;
        "deposit(uint256,address)": FunctionFragment;
        "stake(uint256,address)": FunctionFragment;
        "withdraw(uint256)": FunctionFragment;
        "withdrawAndUnwrap(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "convexPool" | "convexPoolId" | "convexToken" | "curveToken" | "deposit" | "stake" | "withdraw" | "withdrawAndUnwrap"): FunctionFragment;
    encodeFunctionData(functionFragment: "convexPool", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexPoolId", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "stake", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawAndUnwrap", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "convexPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexPoolId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAndUnwrap", data: BytesLike): Result;
    events: {};
}
export interface IConvexWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IConvexWrapperInterface;
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
        convexPool(overrides?: CallOverrides): Promise<[string]>;
        convexPoolId(overrides?: CallOverrides): Promise<[BigNumber]>;
        convexToken(overrides?: CallOverrides): Promise<[string]>;
        curveToken(overrides?: CallOverrides): Promise<[string]>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    convexPool(overrides?: CallOverrides): Promise<string>;
    convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
    convexToken(overrides?: CallOverrides): Promise<string>;
    curveToken(overrides?: CallOverrides): Promise<string>;
    deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        convexPool(overrides?: CallOverrides): Promise<string>;
        convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
        convexToken(overrides?: CallOverrides): Promise<string>;
        curveToken(overrides?: CallOverrides): Promise<string>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        convexPool(overrides?: CallOverrides): Promise<BigNumber>;
        convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
        convexToken(overrides?: CallOverrides): Promise<BigNumber>;
        curveToken(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        convexPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexPoolId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
