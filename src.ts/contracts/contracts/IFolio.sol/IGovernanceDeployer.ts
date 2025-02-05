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

export interface IGovernanceDeployerInterface extends utils.Interface {
  functions: {
    "deployGovernanceWithTimelock((uint48,uint32,uint256,uint256,uint256,address[]),address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "deployGovernanceWithTimelock"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "deployGovernanceWithTimelock",
    values: [IGovernanceDeployer.GovParamsStruct, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "deployGovernanceWithTimelock",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IGovernanceDeployer extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IGovernanceDeployerInterface;

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
    deployGovernanceWithTimelock(
      govParams: IGovernanceDeployer.GovParamsStruct,
      stToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  deployGovernanceWithTimelock(
    govParams: IGovernanceDeployer.GovParamsStruct,
    stToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    deployGovernanceWithTimelock(
      govParams: IGovernanceDeployer.GovParamsStruct,
      stToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string, string] & { governor: string; timelock: string }>;
  };

  filters: {};

  estimateGas: {
    deployGovernanceWithTimelock(
      govParams: IGovernanceDeployer.GovParamsStruct,
      stToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    deployGovernanceWithTimelock(
      govParams: IGovernanceDeployer.GovParamsStruct,
      stToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
