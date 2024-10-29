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

export interface SlipstreamRouterCallInterface extends utils.Interface {
  functions: {
    "addLiquidityV2(uint256,uint256,uint256,uint256,bytes)": FunctionFragment;
    "exactInput(uint256,uint256,address,address,bytes)": FunctionFragment;
    "exactInputSingle(uint256,uint256,address,bytes)": FunctionFragment;
    "exactInputSingleV2(uint256,uint256,address,address,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addLiquidityV2"
      | "exactInput"
      | "exactInputSingle"
      | "exactInputSingleV2"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addLiquidityV2",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exactInput",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exactInputSingle",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exactInputSingleV2",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "addLiquidityV2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "exactInput", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exactInputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exactInputSingleV2",
    data: BytesLike
  ): Result;

  events: {};
}

export interface SlipstreamRouterCall extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SlipstreamRouterCallInterface;

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
    addLiquidityV2(
      amountA: PromiseOrValue<BigNumberish>,
      amountB: PromiseOrValue<BigNumberish>,
      expectedA: PromiseOrValue<BigNumberish>,
      expectedB: PromiseOrValue<BigNumberish>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exactInput(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      path: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exactInputSingle(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      encodedRouterCall: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exactInputSingleV2(
      amountIn: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addLiquidityV2(
    amountA: PromiseOrValue<BigNumberish>,
    amountB: PromiseOrValue<BigNumberish>,
    expectedA: PromiseOrValue<BigNumberish>,
    expectedB: PromiseOrValue<BigNumberish>,
    encoding: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exactInput(
    amountIn: PromiseOrValue<BigNumberish>,
    _expected: PromiseOrValue<BigNumberish>,
    router: PromiseOrValue<string>,
    recipient: PromiseOrValue<string>,
    path: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exactInputSingle(
    amountIn: PromiseOrValue<BigNumberish>,
    _expected: PromiseOrValue<BigNumberish>,
    router: PromiseOrValue<string>,
    encodedRouterCall: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exactInputSingleV2(
    amountIn: PromiseOrValue<BigNumberish>,
    expected: PromiseOrValue<BigNumberish>,
    router: PromiseOrValue<string>,
    recipient: PromiseOrValue<string>,
    encoding: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addLiquidityV2(
      amountA: PromiseOrValue<BigNumberish>,
      amountB: PromiseOrValue<BigNumberish>,
      expectedA: PromiseOrValue<BigNumberish>,
      expectedB: PromiseOrValue<BigNumberish>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exactInput(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      path: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exactInputSingle(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      encodedRouterCall: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exactInputSingleV2(
      amountIn: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    addLiquidityV2(
      amountA: PromiseOrValue<BigNumberish>,
      amountB: PromiseOrValue<BigNumberish>,
      expectedA: PromiseOrValue<BigNumberish>,
      expectedB: PromiseOrValue<BigNumberish>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exactInput(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      path: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exactInputSingle(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      encodedRouterCall: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exactInputSingleV2(
      amountIn: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addLiquidityV2(
      amountA: PromiseOrValue<BigNumberish>,
      amountB: PromiseOrValue<BigNumberish>,
      expectedA: PromiseOrValue<BigNumberish>,
      expectedB: PromiseOrValue<BigNumberish>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exactInput(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      path: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exactInputSingle(
      amountIn: PromiseOrValue<BigNumberish>,
      _expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      encodedRouterCall: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exactInputSingleV2(
      amountIn: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      router: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      encoding: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
