import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface IERC20Interface extends utils.Interface {
    functions: {
        "allowance(address,address)": FunctionFragment;
        "approve(address,uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "decimals()": FunctionFragment;
        "symbol()": FunctionFragment;
        "transfer(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "allowance" | "approve" | "balanceOf" | "decimals" | "symbol" | "transfer"): FunctionFragment;
    encodeFunctionData(functionFragment: "allowance", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "approve", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    events: {};
}
export interface IERC20 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IERC20Interface;
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
        allowance(_owner: PromiseOrValue<string>, _spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber] & {
            remaining: BigNumber;
        }>;
        approve(_spender: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        balanceOf(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber] & {
            balance: BigNumber;
        }>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        symbol(overrides?: CallOverrides): Promise<[string]>;
        transfer(_to: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    allowance(_owner: PromiseOrValue<string>, _spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    approve(_spender: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    balanceOf(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    decimals(overrides?: CallOverrides): Promise<number>;
    symbol(overrides?: CallOverrides): Promise<string>;
    transfer(_to: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        allowance(_owner: PromiseOrValue<string>, _spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(_spender: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        balanceOf(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<number>;
        symbol(overrides?: CallOverrides): Promise<string>;
        transfer(_to: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        allowance(_owner: PromiseOrValue<string>, _spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(_spender: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        balanceOf(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(_to: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        allowance(_owner: PromiseOrValue<string>, _spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        approve(_spender: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transfer(_to: PromiseOrValue<string>, _value: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
