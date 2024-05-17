import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IInitializableStaticATokenLMInterface extends utils.Interface {
    functions: {
        "initialize(address,string,string)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "initialize"): FunctionFragment;
    encodeFunctionData(functionFragment: "initialize", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    events: {
        "InitializedStaticATokenLM(address,string,string)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "InitializedStaticATokenLM"): EventFragment;
}
export interface InitializedStaticATokenLMEventObject {
    aToken: string;
    staticATokenName: string;
    staticATokenSymbol: string;
}
export type InitializedStaticATokenLMEvent = TypedEvent<[
    string,
    string,
    string
], InitializedStaticATokenLMEventObject>;
export type InitializedStaticATokenLMEventFilter = TypedEventFilter<InitializedStaticATokenLMEvent>;
export interface IInitializableStaticATokenLM extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IInitializableStaticATokenLMInterface;
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
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "InitializedStaticATokenLM(address,string,string)"(aToken?: PromiseOrValue<string> | null, staticATokenName?: null, staticATokenSymbol?: null): InitializedStaticATokenLMEventFilter;
        InitializedStaticATokenLM(aToken?: PromiseOrValue<string> | null, staticATokenName?: null, staticATokenSymbol?: null): InitializedStaticATokenLMEventFilter;
    };
    estimateGas: {
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
