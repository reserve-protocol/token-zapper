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
} from "../common";

export type ExecuteOutputStruct = { dust: PromiseOrValue<BigNumberish>[] };

export type ExecuteOutputStructOutput = [BigNumber[]] & { dust: BigNumber[] };

export type GovRolesStruct = {
  existingTradeProposers: PromiseOrValue<string>[];
  tradeLaunchers: PromiseOrValue<string>[];
  vibesOfficers: PromiseOrValue<string>[];
};

export type GovRolesStructOutput = [string[], string[], string[]] & {
  existingTradeProposers: string[];
  tradeLaunchers: string[];
  vibesOfficers: string[];
};

export type DeployFolioConfigStruct = {
  deployer: PromiseOrValue<string>;
  basicDetails: IFolio.FolioBasicDetailsStruct;
  additionalDetails: IFolio.FolioAdditionalDetailsStruct;
  govRoles: GovRolesStruct;
  isGoverned: PromiseOrValue<boolean>;
  stToken: PromiseOrValue<string>;
  owner: PromiseOrValue<string>;
  ownerGovParams: IGovernanceDeployer.GovParamsStruct;
  tradingGovParams: IGovernanceDeployer.GovParamsStruct;
};

export type DeployFolioConfigStructOutput = [
  string,
  IFolio.FolioBasicDetailsStructOutput,
  IFolio.FolioAdditionalDetailsStructOutput,
  GovRolesStructOutput,
  boolean,
  string,
  string,
  IGovernanceDeployer.GovParamsStructOutput,
  IGovernanceDeployer.GovParamsStructOutput
] & {
  deployer: string;
  basicDetails: IFolio.FolioBasicDetailsStructOutput;
  additionalDetails: IFolio.FolioAdditionalDetailsStructOutput;
  govRoles: GovRolesStructOutput;
  isGoverned: boolean;
  stToken: string;
  owner: string;
  ownerGovParams: IGovernanceDeployer.GovParamsStructOutput;
  tradingGovParams: IGovernanceDeployer.GovParamsStructOutput;
};

export type ExecuteDeployOutputStruct = {
  dust: PromiseOrValue<BigNumberish>[];
  amountOut: PromiseOrValue<BigNumberish>;
};

export type ExecuteDeployOutputStructOutput = [BigNumber[], BigNumber] & {
  dust: BigNumber[];
  amountOut: BigNumber;
};

export declare namespace IFolio {
  export type FolioBasicDetailsStruct = {
    name: PromiseOrValue<string>;
    symbol: PromiseOrValue<string>;
    assets: PromiseOrValue<string>[];
    amounts: PromiseOrValue<BigNumberish>[];
    initialShares: PromiseOrValue<BigNumberish>;
  };

  export type FolioBasicDetailsStructOutput = [
    string,
    string,
    string[],
    BigNumber[],
    BigNumber
  ] & {
    name: string;
    symbol: string;
    assets: string[];
    amounts: BigNumber[];
    initialShares: BigNumber;
  };

  export type FeeRecipientStruct = {
    recipient: PromiseOrValue<string>;
    portion: PromiseOrValue<BigNumberish>;
  };

  export type FeeRecipientStructOutput = [string, BigNumber] & {
    recipient: string;
    portion: BigNumber;
  };

  export type FolioAdditionalDetailsStruct = {
    auctionDelay: PromiseOrValue<BigNumberish>;
    auctionLength: PromiseOrValue<BigNumberish>;
    feeRecipients: IFolio.FeeRecipientStruct[];
    tvlFee: PromiseOrValue<BigNumberish>;
    mintFee: PromiseOrValue<BigNumberish>;
    mandate: PromiseOrValue<string>;
  };

  export type FolioAdditionalDetailsStructOutput = [
    BigNumber,
    BigNumber,
    IFolio.FeeRecipientStructOutput[],
    BigNumber,
    BigNumber,
    string
  ] & {
    auctionDelay: BigNumber;
    auctionLength: BigNumber;
    feeRecipients: IFolio.FeeRecipientStructOutput[];
    tvlFee: BigNumber;
    mintFee: BigNumber;
    mandate: string;
  };
}

export declare namespace IGovernanceDeployer {
  export type GovParamsStruct = {
    votingDelay: PromiseOrValue<BigNumberish>;
    votingPeriod: PromiseOrValue<BigNumberish>;
    proposalThreshold: PromiseOrValue<BigNumberish>;
    quorumPercent: PromiseOrValue<BigNumberish>;
    timelockDelay: PromiseOrValue<BigNumberish>;
    guardians: PromiseOrValue<string>[];
  };

  export type GovParamsStructOutput = [
    number,
    number,
    BigNumber,
    BigNumber,
    BigNumber,
    string[]
  ] & {
    votingDelay: number;
    votingPeriod: number;
    proposalThreshold: BigNumber;
    quorumPercent: BigNumber;
    timelockDelay: BigNumber;
    guardians: string[];
  };
}

export interface ZapperExecutorInterface extends utils.Interface {
  functions: {
    "add(uint256,uint256)": FunctionFragment;
    "assertEqual(uint256,uint256)": FunctionFragment;
    "assertLarger(uint256,uint256)": FunctionFragment;
    "execute(bytes32[],bytes[],address[])": FunctionFragment;
    "executeDeploy(bytes32[],bytes[],address[],(address,(string,string,address[],uint256[],uint256),(uint256,uint256,(address,uint96)[],uint256,uint256,string),(address[],address[],address[]),bool,address,address,(uint48,uint32,uint256,uint256,uint256,address[]),(uint48,uint32,uint256,uint256,uint256,address[])),address,bytes32)": FunctionFragment;
    "fpMul(uint256,uint256,uint256)": FunctionFragment;
    "mintMaxRToken(address,address,address)": FunctionFragment;
    "rawCall(address,uint256,bytes)": FunctionFragment;
    "sub(uint256,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "add"
      | "assertEqual"
      | "assertLarger"
      | "execute"
      | "executeDeploy"
      | "fpMul"
      | "mintMaxRToken"
      | "rawCall"
      | "sub"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "add",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "assertEqual",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "assertLarger",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "execute",
    values: [
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<string>[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "executeDeploy",
    values: [
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<string>[],
      DeployFolioConfigStruct,
      PromiseOrValue<string>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "fpMul",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "mintMaxRToken",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "rawCall",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "sub",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "add", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "assertEqual",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "assertLarger",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeDeploy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fpMul", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "mintMaxRToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rawCall", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "sub", data: BytesLike): Result;

  events: {};
}

export interface ZapperExecutor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ZapperExecutorInterface;

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
    add(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    assertEqual(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    assertLarger(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    execute(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    executeDeploy(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      config: DeployFolioConfigStruct,
      recipient: PromiseOrValue<string>,
      nonce: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    fpMul(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      scale: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    mintMaxRToken(
      facade: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    rawCall(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    sub(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  add(
    a: PromiseOrValue<BigNumberish>,
    b: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  assertEqual(
    a: PromiseOrValue<BigNumberish>,
    b: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  assertLarger(
    a: PromiseOrValue<BigNumberish>,
    b: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  execute(
    commands: PromiseOrValue<BytesLike>[],
    state: PromiseOrValue<BytesLike>[],
    tokens: PromiseOrValue<string>[],
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  executeDeploy(
    commands: PromiseOrValue<BytesLike>[],
    state: PromiseOrValue<BytesLike>[],
    tokens: PromiseOrValue<string>[],
    config: DeployFolioConfigStruct,
    recipient: PromiseOrValue<string>,
    nonce: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  fpMul(
    a: PromiseOrValue<BigNumberish>,
    b: PromiseOrValue<BigNumberish>,
    scale: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  mintMaxRToken(
    facade: PromiseOrValue<string>,
    token: PromiseOrValue<string>,
    recipient: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  rawCall(
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  sub(
    a: PromiseOrValue<BigNumberish>,
    b: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    add(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    assertEqual(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    assertLarger(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    execute(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<ExecuteOutputStructOutput>;

    executeDeploy(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      config: DeployFolioConfigStruct,
      recipient: PromiseOrValue<string>,
      nonce: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<ExecuteDeployOutputStructOutput>;

    fpMul(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      scale: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mintMaxRToken(
      facade: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    rawCall(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { success: boolean; out: string }>;

    sub(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    add(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    assertEqual(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    assertLarger(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    execute(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    executeDeploy(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      config: DeployFolioConfigStruct,
      recipient: PromiseOrValue<string>,
      nonce: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    fpMul(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      scale: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mintMaxRToken(
      facade: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    rawCall(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    sub(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    add(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    assertEqual(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    assertLarger(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    execute(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    executeDeploy(
      commands: PromiseOrValue<BytesLike>[],
      state: PromiseOrValue<BytesLike>[],
      tokens: PromiseOrValue<string>[],
      config: DeployFolioConfigStruct,
      recipient: PromiseOrValue<string>,
      nonce: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    fpMul(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      scale: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    mintMaxRToken(
      facade: PromiseOrValue<string>,
      token: PromiseOrValue<string>,
      recipient: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    rawCall(
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    sub(
      a: PromiseOrValue<BigNumberish>,
      b: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
