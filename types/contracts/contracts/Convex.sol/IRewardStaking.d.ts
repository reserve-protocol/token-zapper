import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IRewardStakingInterface extends utils.Interface {
    functions: {
        "balanceOf(address)": FunctionFragment;
        "earned(address)": FunctionFragment;
        "extraRewards(uint256)": FunctionFragment;
        "extraRewardsLength()": FunctionFragment;
        "getReward()": FunctionFragment;
        "getReward(address,bool)": FunctionFragment;
        "rewardToken()": FunctionFragment;
        "stake(uint256)": FunctionFragment;
        "stakeFor(address,uint256)": FunctionFragment;
        "withdraw(uint256,bool)": FunctionFragment;
        "withdrawAndUnwrap(uint256,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "balanceOf" | "earned" | "extraRewards" | "extraRewardsLength" | "getReward()" | "getReward(address,bool)" | "rewardToken" | "stake" | "stakeFor" | "withdraw" | "withdrawAndUnwrap"): FunctionFragment;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "earned", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "extraRewards", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "extraRewardsLength", values?: undefined): string;
    encodeFunctionData(functionFragment: "getReward()", values?: undefined): string;
    encodeFunctionData(functionFragment: "getReward(address,bool)", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "rewardToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "stake", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "stakeFor", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "withdrawAndUnwrap", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<boolean>]): string;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earned", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "extraRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "extraRewardsLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward()", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReward(address,bool)", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakeFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAndUnwrap", data: BytesLike): Result;
    events: {};
}
export interface IRewardStaking extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IRewardStakingInterface;
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
        balanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        earned(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        extraRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        extraRewardsLength(overrides?: CallOverrides): Promise<[BigNumber]>;
        "getReward()"(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        "getReward(address,bool)"(_account: PromiseOrValue<string>, _claimExtras: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rewardToken(overrides?: CallOverrides): Promise<[string]>;
        stake(arg0: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        stakeFor(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdraw(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawAndUnwrap(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    balanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    earned(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    extraRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;
    "getReward()"(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    "getReward(address,bool)"(_account: PromiseOrValue<string>, _claimExtras: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rewardToken(overrides?: CallOverrides): Promise<string>;
    stake(arg0: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    stakeFor(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdraw(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawAndUnwrap(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        balanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        earned(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        extraRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;
        "getReward()"(overrides?: CallOverrides): Promise<void>;
        "getReward(address,bool)"(_account: PromiseOrValue<string>, _claimExtras: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        rewardToken(overrides?: CallOverrides): Promise<string>;
        stake(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        stakeFor(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdraw(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        withdrawAndUnwrap(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        balanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        earned(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        extraRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        extraRewardsLength(overrides?: CallOverrides): Promise<BigNumber>;
        "getReward()"(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        "getReward(address,bool)"(_account: PromiseOrValue<string>, _claimExtras: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rewardToken(overrides?: CallOverrides): Promise<BigNumber>;
        stake(arg0: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        stakeFor(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdraw(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawAndUnwrap(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        balanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        earned(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        extraRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        extraRewardsLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        "getReward()"(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        "getReward(address,bool)"(_account: PromiseOrValue<string>, _claimExtras: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rewardToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stake(arg0: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        stakeFor(arg0: PromiseOrValue<string>, arg1: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdraw(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAndUnwrap(amount: PromiseOrValue<BigNumberish>, claim: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IRewardStaking.d.ts.map