import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type PriceStruct = {
    low: PromiseOrValue<BigNumberish>;
    high: PromiseOrValue<BigNumberish>;
};
export type PriceStructOutput = [BigNumber, BigNumber] & {
    low: BigNumber;
    high: BigNumber;
};
export interface IAssetInterface extends utils.Interface {
    functions: {
        "price()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "price"): FunctionFragment;
    encodeFunctionData(functionFragment: "price", values?: undefined): string;
    decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
    events: {};
}
export interface IAsset extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAssetInterface;
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
        price(overrides?: CallOverrides): Promise<[PriceStructOutput]>;
    };
    price(overrides?: CallOverrides): Promise<PriceStructOutput>;
    callStatic: {
        price(overrides?: CallOverrides): Promise<PriceStructOutput>;
    };
    filters: {};
    estimateGas: {
        price(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        price(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IAsset.d.ts.map