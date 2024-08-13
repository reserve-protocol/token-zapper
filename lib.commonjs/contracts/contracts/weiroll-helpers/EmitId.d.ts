import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface EmitIdInterface extends utils.Interface {
    functions: {
        "emitId(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "emitId"): FunctionFragment;
    encodeFunctionData(functionFragment: "emitId", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "emitId", data: BytesLike): Result;
    events: {
        "ReserveZapId(uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "ReserveZapId"): EventFragment;
}
export interface ReserveZapIdEventObject {
    id: BigNumber;
}
export type ReserveZapIdEvent = TypedEvent<[
    BigNumber
], ReserveZapIdEventObject>;
export type ReserveZapIdEventFilter = TypedEventFilter<ReserveZapIdEvent>;
export interface EmitId extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: EmitIdInterface;
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
        emitId(id: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    emitId(id: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        emitId(id: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "ReserveZapId(uint256)"(id?: null): ReserveZapIdEventFilter;
        ReserveZapId(id?: null): ReserveZapIdEventFilter;
    };
    estimateGas: {
        emitId(id: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        emitId(id: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}