import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IEACAggregatorProxyInterface extends utils.Interface {
    functions: {
        "decimals()": FunctionFragment;
        "getAnswer(uint256)": FunctionFragment;
        "getTimestamp(uint256)": FunctionFragment;
        "latestAnswer()": FunctionFragment;
        "latestRound()": FunctionFragment;
        "latestTimestamp()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "decimals" | "getAnswer" | "getTimestamp" | "latestAnswer" | "latestRound" | "latestTimestamp"): FunctionFragment;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAnswer", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getTimestamp", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "latestAnswer", values?: undefined): string;
    encodeFunctionData(functionFragment: "latestRound", values?: undefined): string;
    encodeFunctionData(functionFragment: "latestTimestamp", values?: undefined): string;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAnswer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTimestamp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "latestAnswer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "latestRound", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "latestTimestamp", data: BytesLike): Result;
    events: {
        "AnswerUpdated(int256,uint256,uint256)": EventFragment;
        "NewRound(uint256,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AnswerUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "NewRound"): EventFragment;
}
export interface AnswerUpdatedEventObject {
    current: BigNumber;
    roundId: BigNumber;
    timestamp: BigNumber;
}
export type AnswerUpdatedEvent = TypedEvent<[
    BigNumber,
    BigNumber,
    BigNumber
], AnswerUpdatedEventObject>;
export type AnswerUpdatedEventFilter = TypedEventFilter<AnswerUpdatedEvent>;
export interface NewRoundEventObject {
    roundId: BigNumber;
    startedBy: string;
}
export type NewRoundEvent = TypedEvent<[
    BigNumber,
    string
], NewRoundEventObject>;
export type NewRoundEventFilter = TypedEventFilter<NewRoundEvent>;
export interface IEACAggregatorProxy extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IEACAggregatorProxyInterface;
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
        decimals(overrides?: CallOverrides): Promise<[number]>;
        getAnswer(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTimestamp(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        latestAnswer(overrides?: CallOverrides): Promise<[BigNumber]>;
        latestRound(overrides?: CallOverrides): Promise<[BigNumber]>;
        latestTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    decimals(overrides?: CallOverrides): Promise<number>;
    getAnswer(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getTimestamp(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;
    latestRound(overrides?: CallOverrides): Promise<BigNumber>;
    latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        decimals(overrides?: CallOverrides): Promise<number>;
        getAnswer(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getTimestamp(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;
        latestRound(overrides?: CallOverrides): Promise<BigNumber>;
        latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {
        "AnswerUpdated(int256,uint256,uint256)"(current?: PromiseOrValue<BigNumberish> | null, roundId?: PromiseOrValue<BigNumberish> | null, timestamp?: null): AnswerUpdatedEventFilter;
        AnswerUpdated(current?: PromiseOrValue<BigNumberish> | null, roundId?: PromiseOrValue<BigNumberish> | null, timestamp?: null): AnswerUpdatedEventFilter;
        "NewRound(uint256,address)"(roundId?: PromiseOrValue<BigNumberish> | null, startedBy?: PromiseOrValue<string> | null): NewRoundEventFilter;
        NewRound(roundId?: PromiseOrValue<BigNumberish> | null, startedBy?: PromiseOrValue<string> | null): NewRoundEventFilter;
    };
    estimateGas: {
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        getAnswer(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getTimestamp(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        latestAnswer(overrides?: CallOverrides): Promise<BigNumber>;
        latestRound(overrides?: CallOverrides): Promise<BigNumber>;
        latestTimestamp(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAnswer(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTimestamp(roundId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        latestAnswer(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        latestRound(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        latestTimestamp(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IEACAggregatorProxy.d.ts.map