import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IBasketHandlerInterface extends utils.Interface {
    functions: {
        "nonce()": FunctionFragment;
        "quote(uint192,uint8)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "nonce" | "quote"): FunctionFragment;
    encodeFunctionData(functionFragment: "nonce", values?: undefined): string;
    encodeFunctionData(functionFragment: "quote", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "nonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "quote", data: BytesLike): Result;
    events: {};
}
export interface IBasketHandler extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBasketHandlerInterface;
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
        nonce(overrides?: CallOverrides): Promise<[number]>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[]
        ] & {
            erc20s: string[];
            quantities: BigNumber[];
        }>;
    };
    nonce(overrides?: CallOverrides): Promise<number>;
    quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
        string[],
        BigNumber[]
    ] & {
        erc20s: string[];
        quantities: BigNumber[];
    }>;
    callStatic: {
        nonce(overrides?: CallOverrides): Promise<number>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[]
        ] & {
            erc20s: string[];
            quantities: BigNumber[];
        }>;
    };
    filters: {};
    estimateGas: {
        nonce(overrides?: CallOverrides): Promise<BigNumber>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        nonce(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
