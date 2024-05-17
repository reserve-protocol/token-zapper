import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IPriceSourceReceiverInterface extends utils.Interface {
    functions: {
        "addRoundData(bool,uint104,uint104,uint40)": FunctionFragment;
        "getPrices()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addRoundData" | "getPrices"): FunctionFragment;
    encodeFunctionData(functionFragment: "addRoundData", values: [
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "getPrices", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addRoundData", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPrices", data: BytesLike): Result;
    events: {};
}
export interface IPriceSourceReceiver extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPriceSourceReceiverInterface;
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
        addRoundData(isBadData: PromiseOrValue<boolean>, priceLow: PromiseOrValue<BigNumberish>, priceHigh: PromiseOrValue<BigNumberish>, timestamp: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getPrices(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber,
            BigNumber
        ] & {
            isBadData: boolean;
            priceLow: BigNumber;
            priceHigh: BigNumber;
        }>;
    };
    addRoundData(isBadData: PromiseOrValue<boolean>, priceLow: PromiseOrValue<BigNumberish>, priceHigh: PromiseOrValue<BigNumberish>, timestamp: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getPrices(overrides?: CallOverrides): Promise<[
        boolean,
        BigNumber,
        BigNumber
    ] & {
        isBadData: boolean;
        priceLow: BigNumber;
        priceHigh: BigNumber;
    }>;
    callStatic: {
        addRoundData(isBadData: PromiseOrValue<boolean>, priceLow: PromiseOrValue<BigNumberish>, priceHigh: PromiseOrValue<BigNumberish>, timestamp: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        getPrices(overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber,
            BigNumber
        ] & {
            isBadData: boolean;
            priceLow: BigNumber;
            priceHigh: BigNumber;
        }>;
    };
    filters: {};
    estimateGas: {
        addRoundData(isBadData: PromiseOrValue<boolean>, priceLow: PromiseOrValue<BigNumberish>, priceHigh: PromiseOrValue<BigNumberish>, timestamp: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getPrices(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addRoundData(isBadData: PromiseOrValue<boolean>, priceLow: PromiseOrValue<BigNumberish>, priceHigh: PromiseOrValue<BigNumberish>, timestamp: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getPrices(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IPriceSourceReceiver.d.ts.map