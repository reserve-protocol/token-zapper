import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IAssetRegistryInterface extends utils.Interface {
    functions: {
        "refresh()": FunctionFragment;
        "toAsset(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "refresh" | "toAsset"): FunctionFragment;
    encodeFunctionData(functionFragment: "refresh", values?: undefined): string;
    encodeFunctionData(functionFragment: "toAsset", values: [PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "refresh", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "toAsset", data: BytesLike): Result;
    events: {};
}
export interface IAssetRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAssetRegistryInterface;
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
        refresh(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        toAsset(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[string]>;
    };
    refresh(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    toAsset(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string>;
    callStatic: {
        refresh(overrides?: CallOverrides): Promise<void>;
        toAsset(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string>;
    };
    filters: {};
    estimateGas: {
        refresh(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        toAsset(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        refresh(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        toAsset(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
