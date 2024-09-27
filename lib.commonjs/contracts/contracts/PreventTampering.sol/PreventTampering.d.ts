import type { BaseContract, BigNumber, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export interface PreventTamperingInterface extends utils.Interface {
    functions: {
        "deployCodehash()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "deployCodehash"): FunctionFragment;
    encodeFunctionData(functionFragment: "deployCodehash", values?: undefined): string;
    decodeFunctionResult(functionFragment: "deployCodehash", data: BytesLike): Result;
    events: {};
}
export interface PreventTampering extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: PreventTamperingInterface;
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
        deployCodehash(overrides?: CallOverrides): Promise<[string]>;
    };
    deployCodehash(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        deployCodehash(overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        deployCodehash(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        deployCodehash(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
