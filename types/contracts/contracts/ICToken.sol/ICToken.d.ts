import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ICTokenInterface extends utils.Interface {
    functions: {
        "comptroller()": FunctionFragment;
        "exchangeRateCurrent()": FunctionFragment;
        "exchangeRateStored()": FunctionFragment;
        "mint(uint256)": FunctionFragment;
        "redeem(uint256)": FunctionFragment;
        "underlying()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "comptroller" | "exchangeRateCurrent" | "exchangeRateStored" | "mint" | "redeem" | "underlying"): FunctionFragment;
    encodeFunctionData(functionFragment: "comptroller", values?: undefined): string;
    encodeFunctionData(functionFragment: "exchangeRateCurrent", values?: undefined): string;
    encodeFunctionData(functionFragment: "exchangeRateStored", values?: undefined): string;
    encodeFunctionData(functionFragment: "mint", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "redeem", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "underlying", values?: undefined): string;
    decodeFunctionResult(functionFragment: "comptroller", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchangeRateCurrent", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchangeRateStored", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlying", data: BytesLike): Result;
    events: {};
}
export interface ICToken extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICTokenInterface;
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
        comptroller(overrides?: CallOverrides): Promise<[string]>;
        exchangeRateCurrent(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        exchangeRateStored(overrides?: CallOverrides): Promise<[BigNumber]>;
        mint(mintAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        redeem(cTokenAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        underlying(overrides?: CallOverrides): Promise<[string]>;
    };
    comptroller(overrides?: CallOverrides): Promise<string>;
    exchangeRateCurrent(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;
    mint(mintAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    redeem(cTokenAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    underlying(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        comptroller(overrides?: CallOverrides): Promise<string>;
        exchangeRateCurrent(overrides?: CallOverrides): Promise<BigNumber>;
        exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;
        mint(mintAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        redeem(cTokenAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        underlying(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        comptroller(overrides?: CallOverrides): Promise<BigNumber>;
        exchangeRateCurrent(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;
        mint(mintAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        redeem(cTokenAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        underlying(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        comptroller(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        exchangeRateCurrent(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        exchangeRateStored(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mint(mintAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        redeem(cTokenAmount: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        underlying(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=ICToken.d.ts.map