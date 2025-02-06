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
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace IFolio {
  export type BasketRangeStruct = {
    spot: PromiseOrValue<BigNumberish>;
    low: PromiseOrValue<BigNumberish>;
    high: PromiseOrValue<BigNumberish>;
  };

  export type BasketRangeStructOutput = [BigNumber, BigNumber, BigNumber] & {
    spot: BigNumber;
    low: BigNumber;
    high: BigNumber;
  };

  export type PricesStruct = {
    start: PromiseOrValue<BigNumberish>;
    end: PromiseOrValue<BigNumberish>;
  };

  export type PricesStructOutput = [BigNumber, BigNumber] & {
    start: BigNumber;
    end: BigNumber;
  };

  export type AuctionStruct = {
    id: PromiseOrValue<BigNumberish>;
    sell: PromiseOrValue<string>;
    buy: PromiseOrValue<string>;
    sellLimit: IFolio.BasketRangeStruct;
    buyLimit: IFolio.BasketRangeStruct;
    prices: IFolio.PricesStruct;
    availableAt: PromiseOrValue<BigNumberish>;
    launchTimeout: PromiseOrValue<BigNumberish>;
    start: PromiseOrValue<BigNumberish>;
    end: PromiseOrValue<BigNumberish>;
    k: PromiseOrValue<BigNumberish>;
  };

  export type AuctionStructOutput = [
    BigNumber,
    string,
    string,
    IFolio.BasketRangeStructOutput,
    IFolio.BasketRangeStructOutput,
    IFolio.PricesStructOutput,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    id: BigNumber;
    sell: string;
    buy: string;
    sellLimit: IFolio.BasketRangeStructOutput;
    buyLimit: IFolio.BasketRangeStructOutput;
    prices: IFolio.PricesStructOutput;
    availableAt: BigNumber;
    launchTimeout: BigNumber;
    start: BigNumber;
    end: BigNumber;
    k: BigNumber;
  };
}

export interface IFolioInterface extends utils.Interface {
  functions: {
    "AUCTION_APPROVER()": FunctionFragment;
    "AUCTION_LAUNCHER()": FunctionFragment;
    "BRAND_MANAGER()": FunctionFragment;
    "allowance(address,address)": FunctionFragment;
    "approve(address,uint256)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "distributeFees()": FunctionFragment;
    "folio()": FunctionFragment;
    "mint(uint256,address)": FunctionFragment;
    "redeem(uint256,address,address[],uint256[])": FunctionFragment;
    "toAssets(uint256,uint8)": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "transfer(address,uint256)": FunctionFragment;
    "transferFrom(address,address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "AUCTION_APPROVER"
      | "AUCTION_LAUNCHER"
      | "BRAND_MANAGER"
      | "allowance"
      | "approve"
      | "balanceOf"
      | "distributeFees"
      | "folio"
      | "mint"
      | "redeem"
      | "toAssets"
      | "totalSupply"
      | "transfer"
      | "transferFrom"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "AUCTION_APPROVER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "AUCTION_LAUNCHER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "BRAND_MANAGER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "allowance",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "approve",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "distributeFees",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "folio", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>[],
      PromiseOrValue<BigNumberish>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "toAssets",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transfer",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "AUCTION_APPROVER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "AUCTION_LAUNCHER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "BRAND_MANAGER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "distributeFees",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "folio", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "toAssets", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;

  events: {
    "Approval(address,address,uint256)": EventFragment;
    "AuctionApproved(uint256,address,address,tuple)": EventFragment;
    "AuctionBid(uint256,uint256,uint256)": EventFragment;
    "AuctionClosed(uint256)": EventFragment;
    "AuctionDelaySet(uint256)": EventFragment;
    "AuctionLengthSet(uint256)": EventFragment;
    "AuctionOpened(uint256,tuple)": EventFragment;
    "BasketTokenAdded(address)": EventFragment;
    "BasketTokenRemoved(address)": EventFragment;
    "FeeRecipientSet(address,uint96)": EventFragment;
    "FolioFeePaid(address,uint256)": EventFragment;
    "FolioKilled()": EventFragment;
    "MandateSet(string)": EventFragment;
    "MintFeeSet(uint256)": EventFragment;
    "ProtocolFeePaid(address,uint256)": EventFragment;
    "TVLFeeSet(uint256,uint256)": EventFragment;
    "Transfer(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionApproved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionBid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionClosed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionDelaySet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionLengthSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "AuctionOpened"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BasketTokenAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BasketTokenRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FeeRecipientSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FolioFeePaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FolioKilled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MandateSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MintFeeSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProtocolFeePaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TVLFeeSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}

export interface ApprovalEventObject {
  owner: string;
  spender: string;
  value: BigNumber;
}
export type ApprovalEvent = TypedEvent<
  [string, string, BigNumber],
  ApprovalEventObject
>;

export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

export interface AuctionApprovedEventObject {
  auctionId: BigNumber;
  from: string;
  to: string;
  auction: IFolio.AuctionStructOutput;
}
export type AuctionApprovedEvent = TypedEvent<
  [BigNumber, string, string, IFolio.AuctionStructOutput],
  AuctionApprovedEventObject
>;

export type AuctionApprovedEventFilter = TypedEventFilter<AuctionApprovedEvent>;

export interface AuctionBidEventObject {
  auctionId: BigNumber;
  sellAmount: BigNumber;
  buyAmount: BigNumber;
}
export type AuctionBidEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber],
  AuctionBidEventObject
>;

export type AuctionBidEventFilter = TypedEventFilter<AuctionBidEvent>;

export interface AuctionClosedEventObject {
  auctionId: BigNumber;
}
export type AuctionClosedEvent = TypedEvent<
  [BigNumber],
  AuctionClosedEventObject
>;

export type AuctionClosedEventFilter = TypedEventFilter<AuctionClosedEvent>;

export interface AuctionDelaySetEventObject {
  newAuctionDelay: BigNumber;
}
export type AuctionDelaySetEvent = TypedEvent<
  [BigNumber],
  AuctionDelaySetEventObject
>;

export type AuctionDelaySetEventFilter = TypedEventFilter<AuctionDelaySetEvent>;

export interface AuctionLengthSetEventObject {
  newAuctionLength: BigNumber;
}
export type AuctionLengthSetEvent = TypedEvent<
  [BigNumber],
  AuctionLengthSetEventObject
>;

export type AuctionLengthSetEventFilter =
  TypedEventFilter<AuctionLengthSetEvent>;

export interface AuctionOpenedEventObject {
  auctionId: BigNumber;
  auction: IFolio.AuctionStructOutput;
}
export type AuctionOpenedEvent = TypedEvent<
  [BigNumber, IFolio.AuctionStructOutput],
  AuctionOpenedEventObject
>;

export type AuctionOpenedEventFilter = TypedEventFilter<AuctionOpenedEvent>;

export interface BasketTokenAddedEventObject {
  token: string;
}
export type BasketTokenAddedEvent = TypedEvent<
  [string],
  BasketTokenAddedEventObject
>;

export type BasketTokenAddedEventFilter =
  TypedEventFilter<BasketTokenAddedEvent>;

export interface BasketTokenRemovedEventObject {
  token: string;
}
export type BasketTokenRemovedEvent = TypedEvent<
  [string],
  BasketTokenRemovedEventObject
>;

export type BasketTokenRemovedEventFilter =
  TypedEventFilter<BasketTokenRemovedEvent>;

export interface FeeRecipientSetEventObject {
  recipient: string;
  portion: BigNumber;
}
export type FeeRecipientSetEvent = TypedEvent<
  [string, BigNumber],
  FeeRecipientSetEventObject
>;

export type FeeRecipientSetEventFilter = TypedEventFilter<FeeRecipientSetEvent>;

export interface FolioFeePaidEventObject {
  recipient: string;
  amount: BigNumber;
}
export type FolioFeePaidEvent = TypedEvent<
  [string, BigNumber],
  FolioFeePaidEventObject
>;

export type FolioFeePaidEventFilter = TypedEventFilter<FolioFeePaidEvent>;

export interface FolioKilledEventObject {}
export type FolioKilledEvent = TypedEvent<[], FolioKilledEventObject>;

export type FolioKilledEventFilter = TypedEventFilter<FolioKilledEvent>;

export interface MandateSetEventObject {
  newMandate: string;
}
export type MandateSetEvent = TypedEvent<[string], MandateSetEventObject>;

export type MandateSetEventFilter = TypedEventFilter<MandateSetEvent>;

export interface MintFeeSetEventObject {
  newFee: BigNumber;
}
export type MintFeeSetEvent = TypedEvent<[BigNumber], MintFeeSetEventObject>;

export type MintFeeSetEventFilter = TypedEventFilter<MintFeeSetEvent>;

export interface ProtocolFeePaidEventObject {
  recipient: string;
  amount: BigNumber;
}
export type ProtocolFeePaidEvent = TypedEvent<
  [string, BigNumber],
  ProtocolFeePaidEventObject
>;

export type ProtocolFeePaidEventFilter = TypedEventFilter<ProtocolFeePaidEvent>;

export interface TVLFeeSetEventObject {
  newFee: BigNumber;
  feeAnnually: BigNumber;
}
export type TVLFeeSetEvent = TypedEvent<
  [BigNumber, BigNumber],
  TVLFeeSetEventObject
>;

export type TVLFeeSetEventFilter = TypedEventFilter<TVLFeeSetEvent>;

export interface TransferEventObject {
  from: string;
  to: string;
  value: BigNumber;
}
export type TransferEvent = TypedEvent<
  [string, string, BigNumber],
  TransferEventObject
>;

export type TransferEventFilter = TypedEventFilter<TransferEvent>;

export interface IFolio extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IFolioInterface;

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
    AUCTION_APPROVER(overrides?: CallOverrides): Promise<[string]>;

    AUCTION_LAUNCHER(overrides?: CallOverrides): Promise<[string]>;

    BRAND_MANAGER(overrides?: CallOverrides): Promise<[string]>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    distributeFees(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    folio(
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
    >;

    mint(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      assets: PromiseOrValue<string>[],
      minAmountsOut: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    toAssets(
      shares: PromiseOrValue<BigNumberish>,
      rounding: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
    >;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  AUCTION_APPROVER(overrides?: CallOverrides): Promise<string>;

  AUCTION_LAUNCHER(overrides?: CallOverrides): Promise<string>;

  BRAND_MANAGER(overrides?: CallOverrides): Promise<string>;

  allowance(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  approve(
    spender: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  balanceOf(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  distributeFees(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  folio(
    overrides?: CallOverrides
  ): Promise<
    [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
  >;

  mint(
    shares: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  redeem(
    shares: PromiseOrValue<BigNumberish>,
    receiver: PromiseOrValue<string>,
    assets: PromiseOrValue<string>[],
    minAmountsOut: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  toAssets(
    shares: PromiseOrValue<BigNumberish>,
    rounding: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
  >;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferFrom(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    AUCTION_APPROVER(overrides?: CallOverrides): Promise<string>;

    AUCTION_LAUNCHER(overrides?: CallOverrides): Promise<string>;

    BRAND_MANAGER(overrides?: CallOverrides): Promise<string>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    distributeFees(overrides?: CallOverrides): Promise<void>;

    folio(
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
    >;

    mint(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
    >;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      assets: PromiseOrValue<string>[],
      minAmountsOut: PromiseOrValue<BigNumberish>[],
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    toAssets(
      shares: PromiseOrValue<BigNumberish>,
      rounding: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & { _assets: string[]; _amounts: BigNumber[] }
    >;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "Approval(address,address,uint256)"(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): ApprovalEventFilter;
    Approval(
      owner?: PromiseOrValue<string> | null,
      spender?: PromiseOrValue<string> | null,
      value?: null
    ): ApprovalEventFilter;

    "AuctionApproved(uint256,address,address,tuple)"(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      auction?: null
    ): AuctionApprovedEventFilter;
    AuctionApproved(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      auction?: null
    ): AuctionApprovedEventFilter;

    "AuctionBid(uint256,uint256,uint256)"(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      sellAmount?: null,
      buyAmount?: null
    ): AuctionBidEventFilter;
    AuctionBid(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      sellAmount?: null,
      buyAmount?: null
    ): AuctionBidEventFilter;

    "AuctionClosed(uint256)"(
      auctionId?: PromiseOrValue<BigNumberish> | null
    ): AuctionClosedEventFilter;
    AuctionClosed(
      auctionId?: PromiseOrValue<BigNumberish> | null
    ): AuctionClosedEventFilter;

    "AuctionDelaySet(uint256)"(
      newAuctionDelay?: null
    ): AuctionDelaySetEventFilter;
    AuctionDelaySet(newAuctionDelay?: null): AuctionDelaySetEventFilter;

    "AuctionLengthSet(uint256)"(
      newAuctionLength?: null
    ): AuctionLengthSetEventFilter;
    AuctionLengthSet(newAuctionLength?: null): AuctionLengthSetEventFilter;

    "AuctionOpened(uint256,tuple)"(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      auction?: null
    ): AuctionOpenedEventFilter;
    AuctionOpened(
      auctionId?: PromiseOrValue<BigNumberish> | null,
      auction?: null
    ): AuctionOpenedEventFilter;

    "BasketTokenAdded(address)"(
      token?: PromiseOrValue<string> | null
    ): BasketTokenAddedEventFilter;
    BasketTokenAdded(
      token?: PromiseOrValue<string> | null
    ): BasketTokenAddedEventFilter;

    "BasketTokenRemoved(address)"(
      token?: PromiseOrValue<string> | null
    ): BasketTokenRemovedEventFilter;
    BasketTokenRemoved(
      token?: PromiseOrValue<string> | null
    ): BasketTokenRemovedEventFilter;

    "FeeRecipientSet(address,uint96)"(
      recipient?: PromiseOrValue<string> | null,
      portion?: null
    ): FeeRecipientSetEventFilter;
    FeeRecipientSet(
      recipient?: PromiseOrValue<string> | null,
      portion?: null
    ): FeeRecipientSetEventFilter;

    "FolioFeePaid(address,uint256)"(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): FolioFeePaidEventFilter;
    FolioFeePaid(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): FolioFeePaidEventFilter;

    "FolioKilled()"(): FolioKilledEventFilter;
    FolioKilled(): FolioKilledEventFilter;

    "MandateSet(string)"(newMandate?: null): MandateSetEventFilter;
    MandateSet(newMandate?: null): MandateSetEventFilter;

    "MintFeeSet(uint256)"(newFee?: null): MintFeeSetEventFilter;
    MintFeeSet(newFee?: null): MintFeeSetEventFilter;

    "ProtocolFeePaid(address,uint256)"(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): ProtocolFeePaidEventFilter;
    ProtocolFeePaid(
      recipient?: PromiseOrValue<string> | null,
      amount?: null
    ): ProtocolFeePaidEventFilter;

    "TVLFeeSet(uint256,uint256)"(
      newFee?: null,
      feeAnnually?: null
    ): TVLFeeSetEventFilter;
    TVLFeeSet(newFee?: null, feeAnnually?: null): TVLFeeSetEventFilter;

    "Transfer(address,address,uint256)"(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): TransferEventFilter;
    Transfer(
      from?: PromiseOrValue<string> | null,
      to?: PromiseOrValue<string> | null,
      value?: null
    ): TransferEventFilter;
  };

  estimateGas: {
    AUCTION_APPROVER(overrides?: CallOverrides): Promise<BigNumber>;

    AUCTION_LAUNCHER(overrides?: CallOverrides): Promise<BigNumber>;

    BRAND_MANAGER(overrides?: CallOverrides): Promise<BigNumber>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    distributeFees(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    folio(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      assets: PromiseOrValue<string>[],
      minAmountsOut: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    toAssets(
      shares: PromiseOrValue<BigNumberish>,
      rounding: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    AUCTION_APPROVER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    AUCTION_LAUNCHER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    BRAND_MANAGER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    allowance(
      owner: PromiseOrValue<string>,
      spender: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    approve(
      spender: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    balanceOf(
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    distributeFees(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    folio(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    mint(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    redeem(
      shares: PromiseOrValue<BigNumberish>,
      receiver: PromiseOrValue<string>,
      assets: PromiseOrValue<string>[],
      minAmountsOut: PromiseOrValue<BigNumberish>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    toAssets(
      shares: PromiseOrValue<BigNumberish>,
      rounding: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferFrom(
      from: PromiseOrValue<string>,
      to: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
