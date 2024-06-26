/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export interface IFrxEthFraxOracleInterface extends utils.Interface {
  functions: {
    "addRoundData(bool,uint104,uint104,uint40)": FunctionFragment;
    "decimals()": FunctionFragment;
    "description()": FunctionFragment;
    "getPrices()": FunctionFragment;
    "getRoundData(uint80)": FunctionFragment;
    "latestRoundData()": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addRoundData"
      | "decimals"
      | "description"
      | "getPrices"
      | "getRoundData"
      | "latestRoundData"
      | "version"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addRoundData",
    values: [
      PromiseOrValue<boolean>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getPrices", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getRoundData",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "addRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPrices", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {};
}

export interface IFrxEthFraxOracle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IFrxEthFraxOracleInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addRoundData(
      isBadData: PromiseOrValue<boolean>,
      priceLow: PromiseOrValue<BigNumberish>,
      priceHigh: PromiseOrValue<BigNumberish>,
      timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    decimals(overrides?: CallOverrides): Promise<[number]>;

    description(overrides?: CallOverrides): Promise<[string]>;

    getPrices(
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        isBadData: boolean;
        priceLow: BigNumber;
        priceHigh: BigNumber;
      }
    >;

    getRoundData(
      _roundId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestRoundData(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  addRoundData(
    isBadData: PromiseOrValue<boolean>,
    priceLow: PromiseOrValue<BigNumberish>,
    priceHigh: PromiseOrValue<BigNumberish>,
    timestamp: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  decimals(overrides?: CallOverrides): Promise<number>;

  description(overrides?: CallOverrides): Promise<string>;

  getPrices(
    overrides?: CallOverrides
  ): Promise<
    [boolean, BigNumber, BigNumber] & {
      isBadData: boolean;
      priceLow: BigNumber;
      priceHigh: BigNumber;
    }
  >;

  getRoundData(
    _roundId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  latestRoundData(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
      roundId: BigNumber;
      answer: BigNumber;
      startedAt: BigNumber;
      updatedAt: BigNumber;
      answeredInRound: BigNumber;
    }
  >;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    addRoundData(
      isBadData: PromiseOrValue<boolean>,
      priceLow: PromiseOrValue<BigNumberish>,
      priceHigh: PromiseOrValue<BigNumberish>,
      timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    decimals(overrides?: CallOverrides): Promise<number>;

    description(overrides?: CallOverrides): Promise<string>;

    getPrices(
      overrides?: CallOverrides
    ): Promise<
      [boolean, BigNumber, BigNumber] & {
        isBadData: boolean;
        priceLow: BigNumber;
        priceHigh: BigNumber;
      }
    >;

    getRoundData(
      _roundId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    latestRoundData(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
        roundId: BigNumber;
        answer: BigNumber;
        startedAt: BigNumber;
        updatedAt: BigNumber;
        answeredInRound: BigNumber;
      }
    >;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    addRoundData(
      isBadData: PromiseOrValue<boolean>,
      priceLow: PromiseOrValue<BigNumberish>,
      priceHigh: PromiseOrValue<BigNumberish>,
      timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<BigNumber>;

    getPrices(overrides?: CallOverrides): Promise<BigNumber>;

    getRoundData(
      _roundId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    latestRoundData(overrides?: CallOverrides): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    addRoundData(
      isBadData: PromiseOrValue<boolean>,
      priceLow: PromiseOrValue<BigNumberish>,
      priceHigh: PromiseOrValue<BigNumberish>,
      timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    description(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getPrices(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getRoundData(
      _roundId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    latestRoundData(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
