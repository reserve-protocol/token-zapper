import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IWStETHInterface extends utils.Interface {
    functions: {
        "getStETHByWstETH(uint256)": FunctionFragment;
        "getWstETHByStETH(uint256)": FunctionFragment;
        "stEthPerToken()": FunctionFragment;
        "unwrap(uint256)": FunctionFragment;
        "wrap(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getStETHByWstETH" | "getWstETHByStETH" | "stEthPerToken" | "unwrap" | "wrap"): FunctionFragment;
    encodeFunctionData(functionFragment: "getStETHByWstETH", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getWstETHByStETH", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "stEthPerToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "unwrap", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "wrap", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "getStETHByWstETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWstETHByStETH", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stEthPerToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unwrap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "wrap", data: BytesLike): Result;
    events: {};
}
export interface IWStETH extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IWStETHInterface;
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
        getStETHByWstETH(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getWstETHByStETH(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        stEthPerToken(overrides?: CallOverrides): Promise<[BigNumber]>;
        unwrap(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        wrap(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    getStETHByWstETH(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getWstETHByStETH(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    stEthPerToken(overrides?: CallOverrides): Promise<BigNumber>;
    unwrap(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    wrap(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        getStETHByWstETH(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getWstETHByStETH(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        stEthPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        unwrap(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        wrap(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        getStETHByWstETH(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getWstETHByStETH(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        stEthPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        unwrap(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        wrap(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getStETHByWstETH(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWstETHByStETH(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stEthPerToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        unwrap(_wstETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        wrap(_stETHAmount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IWStETH.d.ts.map