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
  PayableOverrides,
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

export declare namespace IBalancerVault {
  export type PoolTokenInfoStruct = {
    cash: PromiseOrValue<BigNumberish>;
    managed: PromiseOrValue<BigNumberish>;
    lastChangeBlock: PromiseOrValue<BigNumberish>;
    assetManager: PromiseOrValue<string>;
  };

  export type PoolTokenInfoStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    string
  ] & {
    cash: BigNumber;
    managed: BigNumber;
    lastChangeBlock: BigNumber;
    assetManager: string;
  };

  export type SingleSwapStruct = {
    poolId: PromiseOrValue<BytesLike>;
    kind: PromiseOrValue<BigNumberish>;
    assetIn: PromiseOrValue<string>;
    assetOut: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
    userData: PromiseOrValue<BytesLike>;
  };

  export type SingleSwapStructOutput = [
    string,
    number,
    string,
    string,
    BigNumber,
    string
  ] & {
    poolId: string;
    kind: number;
    assetIn: string;
    assetOut: string;
    amount: BigNumber;
    userData: string;
  };

  export type FundManagementStruct = {
    sender: PromiseOrValue<string>;
    fromInternalBalance: PromiseOrValue<boolean>;
    recipient: PromiseOrValue<string>;
    toInternalBalance: PromiseOrValue<boolean>;
  };

  export type FundManagementStructOutput = [
    string,
    boolean,
    string,
    boolean
  ] & {
    sender: string;
    fromInternalBalance: boolean;
    recipient: string;
    toInternalBalance: boolean;
  };
}

export interface IBalancerVaultInterface extends utils.Interface {
  functions: {
    "getPoolTokenInfo(bytes32,address)": FunctionFragment;
    "swap((bytes32,uint8,address,address,uint256,bytes),(address,bool,address,bool),uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "getPoolTokenInfo" | "swap"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getPoolTokenInfo",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      IBalancerVault.SingleSwapStruct,
      IBalancerVault.FundManagementStruct,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "getPoolTokenInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;

  events: {};
}

export interface IBalancerVault extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IBalancerVaultInterface;

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
    getPoolTokenInfo(
      poolId: PromiseOrValue<BytesLike>,
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[IBalancerVault.PoolTokenInfoStructOutput]>;

    swap(
      singleSwap: IBalancerVault.SingleSwapStruct,
      funds: IBalancerVault.FundManagementStruct,
      limit: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getPoolTokenInfo(
    poolId: PromiseOrValue<BytesLike>,
    token: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<IBalancerVault.PoolTokenInfoStructOutput>;

  swap(
    singleSwap: IBalancerVault.SingleSwapStruct,
    funds: IBalancerVault.FundManagementStruct,
    limit: PromiseOrValue<BigNumberish>,
    deadline: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getPoolTokenInfo(
      poolId: PromiseOrValue<BytesLike>,
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<IBalancerVault.PoolTokenInfoStructOutput>;

    swap(
      singleSwap: IBalancerVault.SingleSwapStruct,
      funds: IBalancerVault.FundManagementStruct,
      limit: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getPoolTokenInfo(
      poolId: PromiseOrValue<BytesLike>,
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    swap(
      singleSwap: IBalancerVault.SingleSwapStruct,
      funds: IBalancerVault.FundManagementStruct,
      limit: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getPoolTokenInfo(
      poolId: PromiseOrValue<BytesLike>,
      token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swap(
      singleSwap: IBalancerVault.SingleSwapStruct,
      funds: IBalancerVault.FundManagementStruct,
      limit: PromiseOrValue<BigNumberish>,
      deadline: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
