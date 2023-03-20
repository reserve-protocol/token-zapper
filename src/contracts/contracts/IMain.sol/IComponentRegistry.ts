/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
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

export interface IComponentRegistryInterface extends utils.Interface {
  functions: {
    "assetRegistry()": FunctionFragment;
    "backingManager()": FunctionFragment;
    "basketHandler()": FunctionFragment;
    "broker()": FunctionFragment;
    "distributor()": FunctionFragment;
    "furnace()": FunctionFragment;
    "rToken()": FunctionFragment;
    "rTokenTrader()": FunctionFragment;
    "rsrTrader()": FunctionFragment;
    "stRSR()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "assetRegistry"
      | "backingManager"
      | "basketHandler"
      | "broker"
      | "distributor"
      | "furnace"
      | "rToken"
      | "rTokenTrader"
      | "rsrTrader"
      | "stRSR"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "assetRegistry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "backingManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "basketHandler",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "broker", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "distributor",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "furnace", values?: undefined): string;
  encodeFunctionData(functionFragment: "rToken", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "rTokenTrader",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "rsrTrader", values?: undefined): string;
  encodeFunctionData(functionFragment: "stRSR", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "assetRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "backingManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "basketHandler",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "broker", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "distributor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "furnace", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "rToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "rTokenTrader",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rsrTrader", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "stRSR", data: BytesLike): Result;

  events: {};
}

export interface IComponentRegistry extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IComponentRegistryInterface;

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
    assetRegistry(overrides?: CallOverrides): Promise<[string]>;

    backingManager(overrides?: CallOverrides): Promise<[string]>;

    basketHandler(overrides?: CallOverrides): Promise<[string]>;

    broker(overrides?: CallOverrides): Promise<[string]>;

    distributor(overrides?: CallOverrides): Promise<[string]>;

    furnace(overrides?: CallOverrides): Promise<[string]>;

    rToken(overrides?: CallOverrides): Promise<[string]>;

    rTokenTrader(overrides?: CallOverrides): Promise<[string]>;

    rsrTrader(overrides?: CallOverrides): Promise<[string]>;

    stRSR(overrides?: CallOverrides): Promise<[string]>;
  };

  assetRegistry(overrides?: CallOverrides): Promise<string>;

  backingManager(overrides?: CallOverrides): Promise<string>;

  basketHandler(overrides?: CallOverrides): Promise<string>;

  broker(overrides?: CallOverrides): Promise<string>;

  distributor(overrides?: CallOverrides): Promise<string>;

  furnace(overrides?: CallOverrides): Promise<string>;

  rToken(overrides?: CallOverrides): Promise<string>;

  rTokenTrader(overrides?: CallOverrides): Promise<string>;

  rsrTrader(overrides?: CallOverrides): Promise<string>;

  stRSR(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    assetRegistry(overrides?: CallOverrides): Promise<string>;

    backingManager(overrides?: CallOverrides): Promise<string>;

    basketHandler(overrides?: CallOverrides): Promise<string>;

    broker(overrides?: CallOverrides): Promise<string>;

    distributor(overrides?: CallOverrides): Promise<string>;

    furnace(overrides?: CallOverrides): Promise<string>;

    rToken(overrides?: CallOverrides): Promise<string>;

    rTokenTrader(overrides?: CallOverrides): Promise<string>;

    rsrTrader(overrides?: CallOverrides): Promise<string>;

    stRSR(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    assetRegistry(overrides?: CallOverrides): Promise<BigNumber>;

    backingManager(overrides?: CallOverrides): Promise<BigNumber>;

    basketHandler(overrides?: CallOverrides): Promise<BigNumber>;

    broker(overrides?: CallOverrides): Promise<BigNumber>;

    distributor(overrides?: CallOverrides): Promise<BigNumber>;

    furnace(overrides?: CallOverrides): Promise<BigNumber>;

    rToken(overrides?: CallOverrides): Promise<BigNumber>;

    rTokenTrader(overrides?: CallOverrides): Promise<BigNumber>;

    rsrTrader(overrides?: CallOverrides): Promise<BigNumber>;

    stRSR(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    assetRegistry(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    backingManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    basketHandler(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    broker(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    distributor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    furnace(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rTokenTrader(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rsrTrader(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    stRSR(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
