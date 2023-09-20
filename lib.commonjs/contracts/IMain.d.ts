import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";
export interface IMainInterface extends utils.Interface {
    functions: {
        "backingManager()": FunctionFragment;
        "basketHandler()": FunctionFragment;
        "rToken()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "backingManager" | "basketHandler" | "rToken"): FunctionFragment;
    encodeFunctionData(functionFragment: "backingManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "basketHandler", values?: undefined): string;
    encodeFunctionData(functionFragment: "rToken", values?: undefined): string;
    decodeFunctionResult(functionFragment: "backingManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "basketHandler", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rToken", data: BytesLike): Result;
    events: {};
}
export interface IMain extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IMainInterface;
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
        backingManager(overrides?: CallOverrides): Promise<[string]>;
        basketHandler(overrides?: CallOverrides): Promise<[string]>;
        rToken(overrides?: CallOverrides): Promise<[string]>;
    };
    backingManager(overrides?: CallOverrides): Promise<string>;
    basketHandler(overrides?: CallOverrides): Promise<string>;
    rToken(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        backingManager(overrides?: CallOverrides): Promise<string>;
        basketHandler(overrides?: CallOverrides): Promise<string>;
        rToken(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        backingManager(overrides?: CallOverrides): Promise<BigNumber>;
        basketHandler(overrides?: CallOverrides): Promise<BigNumber>;
        rToken(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        backingManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        basketHandler(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
