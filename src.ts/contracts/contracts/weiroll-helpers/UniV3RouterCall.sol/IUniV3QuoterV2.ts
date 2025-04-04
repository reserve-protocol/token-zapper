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
} from "../../../common";

export declare namespace IUniV3QuoterV2 {
  export type QuoteExactInputSingleParamsStruct = {
    tokenIn: PromiseOrValue<string>;
    tokenOut: PromiseOrValue<string>;
    amountIn: PromiseOrValue<BigNumberish>;
    fee: PromiseOrValue<BigNumberish>;
    sqrtPriceLimitX96: PromiseOrValue<BigNumberish>;
  };

  export type QuoteExactInputSingleParamsStructOutput = [
    string,
    string,
    BigNumber,
    number,
    BigNumber
  ] & {
    tokenIn: string;
    tokenOut: string;
    amountIn: BigNumber;
    fee: number;
    sqrtPriceLimitX96: BigNumber;
  };

  export type QuoteExactOutputSingleParamsStruct = {
    tokenIn: PromiseOrValue<string>;
    tokenOut: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
    fee: PromiseOrValue<BigNumberish>;
    sqrtPriceLimitX96: PromiseOrValue<BigNumberish>;
  };

  export type QuoteExactOutputSingleParamsStructOutput = [
    string,
    string,
    BigNumber,
    number,
    BigNumber
  ] & {
    tokenIn: string;
    tokenOut: string;
    amount: BigNumber;
    fee: number;
    sqrtPriceLimitX96: BigNumber;
  };
}

export interface IUniV3QuoterV2Interface extends utils.Interface {
  functions: {
    "quoteExactInput(bytes,uint256)": FunctionFragment;
    "quoteExactInputSingle((address,address,uint256,uint24,uint160))": FunctionFragment;
    "quoteExactOutput(bytes,uint256)": FunctionFragment;
    "quoteExactOutputSingle((address,address,uint256,uint24,uint160))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "quoteExactInput"
      | "quoteExactInputSingle"
      | "quoteExactOutput"
      | "quoteExactOutputSingle"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "quoteExactInput",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactInputSingle",
    values: [IUniV3QuoterV2.QuoteExactInputSingleParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactOutput",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactOutputSingle",
    values: [IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "quoteExactInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactInputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactOutput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactOutputSingle",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IUniV3QuoterV2 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IUniV3QuoterV2Interface;

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
    quoteExactInput(
      path: PromiseOrValue<BytesLike>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    quoteExactInputSingle(
      params: IUniV3QuoterV2.QuoteExactInputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    quoteExactOutput(
      path: PromiseOrValue<BytesLike>,
      amountOut: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    quoteExactOutputSingle(
      params: IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  quoteExactInput(
    path: PromiseOrValue<BytesLike>,
    amountIn: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  quoteExactInputSingle(
    params: IUniV3QuoterV2.QuoteExactInputSingleParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  quoteExactOutput(
    path: PromiseOrValue<BytesLike>,
    amountOut: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  quoteExactOutputSingle(
    params: IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    quoteExactInput(
      path: PromiseOrValue<BytesLike>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber[], number[], BigNumber] & {
        amountOut: BigNumber;
        sqrtPriceX96AfterList: BigNumber[];
        initializedTicksCrossedList: number[];
        gasEstimate: BigNumber;
      }
    >;

    quoteExactInputSingle(
      params: IUniV3QuoterV2.QuoteExactInputSingleParamsStruct,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, number, BigNumber] & {
        amountOut: BigNumber;
        sqrtPriceX96After: BigNumber;
        initializedTicksCrossed: number;
        gasEstimate: BigNumber;
      }
    >;

    quoteExactOutput(
      path: PromiseOrValue<BytesLike>,
      amountOut: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber[], number[], BigNumber] & {
        amountIn: BigNumber;
        sqrtPriceX96AfterList: BigNumber[];
        initializedTicksCrossedList: number[];
        gasEstimate: BigNumber;
      }
    >;

    quoteExactOutputSingle(
      params: IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, number, BigNumber] & {
        amountIn: BigNumber;
        sqrtPriceX96After: BigNumber;
        initializedTicksCrossed: number;
        gasEstimate: BigNumber;
      }
    >;
  };

  filters: {};

  estimateGas: {
    quoteExactInput(
      path: PromiseOrValue<BytesLike>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    quoteExactInputSingle(
      params: IUniV3QuoterV2.QuoteExactInputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    quoteExactOutput(
      path: PromiseOrValue<BytesLike>,
      amountOut: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    quoteExactOutputSingle(
      params: IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    quoteExactInput(
      path: PromiseOrValue<BytesLike>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactInputSingle(
      params: IUniV3QuoterV2.QuoteExactInputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactOutput(
      path: PromiseOrValue<BytesLike>,
      amountOut: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    quoteExactOutputSingle(
      params: IUniV3QuoterV2.QuoteExactOutputSingleParamsStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
