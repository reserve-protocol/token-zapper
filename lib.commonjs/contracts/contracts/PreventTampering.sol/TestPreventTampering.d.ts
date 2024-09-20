import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface TestPreventTamperingInterface extends utils.Interface {
    functions: {
        "markedRevertOnCodeHashChangeDontRevert()": FunctionFragment;
        "shouldNotRevert()": FunctionFragment;
        "shouldRevert()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "markedRevertOnCodeHashChangeDontRevert" | "shouldNotRevert" | "shouldRevert"): FunctionFragment;
    encodeFunctionData(functionFragment: "markedRevertOnCodeHashChangeDontRevert", values?: undefined): string;
    encodeFunctionData(functionFragment: "shouldNotRevert", values?: undefined): string;
    encodeFunctionData(functionFragment: "shouldRevert", values?: undefined): string;
    decodeFunctionResult(functionFragment: "markedRevertOnCodeHashChangeDontRevert", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "shouldNotRevert", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "shouldRevert", data: BytesLike): Result;
    events: {};
}
export interface TestPreventTampering extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: TestPreventTamperingInterface;
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
        markedRevertOnCodeHashChangeDontRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        shouldNotRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        shouldRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    markedRevertOnCodeHashChangeDontRevert(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    shouldNotRevert(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    shouldRevert(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        markedRevertOnCodeHashChangeDontRevert(overrides?: CallOverrides): Promise<void>;
        shouldNotRevert(overrides?: CallOverrides): Promise<void>;
        shouldRevert(overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        markedRevertOnCodeHashChangeDontRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        shouldNotRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        shouldRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        markedRevertOnCodeHashChangeDontRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        shouldNotRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        shouldRevert(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
