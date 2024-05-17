import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export declare namespace IStaticATokenV3LM {
    type PermitParamsStruct = {
        owner: PromiseOrValue<string>;
        spender: PromiseOrValue<string>;
        value: PromiseOrValue<BigNumberish>;
        deadline: PromiseOrValue<BigNumberish>;
        v: PromiseOrValue<BigNumberish>;
        r: PromiseOrValue<BytesLike>;
        s: PromiseOrValue<BytesLike>;
    };
    type PermitParamsStructOutput = [
        string,
        string,
        BigNumber,
        BigNumber,
        number,
        string,
        string
    ] & {
        owner: string;
        spender: string;
        value: BigNumber;
        deadline: BigNumber;
        v: number;
        r: string;
        s: string;
    };
    type SignatureParamsStruct = {
        v: PromiseOrValue<BigNumberish>;
        r: PromiseOrValue<BytesLike>;
        s: PromiseOrValue<BytesLike>;
    };
    type SignatureParamsStructOutput = [number, string, string] & {
        v: number;
        r: string;
        s: string;
    };
}
export interface IStaticATokenV3LMInterface extends utils.Interface {
    functions: {
        "aToken()": FunctionFragment;
        "claimRewards(address,address[])": FunctionFragment;
        "claimRewardsOnBehalf(address,address,address[])": FunctionFragment;
        "claimRewardsToSelf(address[])": FunctionFragment;
        "collectAndUpdateRewards(address)": FunctionFragment;
        "deposit(uint256,address,uint16,bool)": FunctionFragment;
        "getClaimableRewards(address,address)": FunctionFragment;
        "getCurrentRewardsIndex(address)": FunctionFragment;
        "getTotalClaimableRewards(address)": FunctionFragment;
        "getUnclaimedRewards(address,address)": FunctionFragment;
        "initialize(address,string,string)": FunctionFragment;
        "isRegisteredRewardToken(address)": FunctionFragment;
        "metaDeposit(address,address,uint256,uint16,bool,uint256,(address,address,uint256,uint256,uint8,bytes32,bytes32),(uint8,bytes32,bytes32))": FunctionFragment;
        "metaWithdraw(address,address,uint256,uint256,bool,uint256,(uint8,bytes32,bytes32))": FunctionFragment;
        "rate()": FunctionFragment;
        "redeem(uint256,address,address,bool)": FunctionFragment;
        "refreshRewardTokens()": FunctionFragment;
        "rewardTokens()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "aToken" | "claimRewards" | "claimRewardsOnBehalf" | "claimRewardsToSelf" | "collectAndUpdateRewards" | "deposit" | "getClaimableRewards" | "getCurrentRewardsIndex" | "getTotalClaimableRewards" | "getUnclaimedRewards" | "initialize" | "isRegisteredRewardToken" | "metaDeposit" | "metaWithdraw" | "rate" | "redeem" | "refreshRewardTokens" | "rewardTokens"): FunctionFragment;
    encodeFunctionData(functionFragment: "aToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "claimRewards", values: [PromiseOrValue<string>, PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "claimRewardsOnBehalf", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>[]
    ]): string;
    encodeFunctionData(functionFragment: "claimRewardsToSelf", values: [PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "collectAndUpdateRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "deposit", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "getClaimableRewards", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getCurrentRewardsIndex", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getTotalClaimableRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getUnclaimedRewards", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "initialize", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "isRegisteredRewardToken", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "metaDeposit", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        IStaticATokenV3LM.PermitParamsStruct,
        IStaticATokenV3LM.SignatureParamsStruct
    ]): string;
    encodeFunctionData(functionFragment: "metaWithdraw", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        IStaticATokenV3LM.SignatureParamsStruct
    ]): string;
    encodeFunctionData(functionFragment: "rate", values?: undefined): string;
    encodeFunctionData(functionFragment: "redeem", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "refreshRewardTokens", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardTokens", values?: undefined): string;
    decodeFunctionResult(functionFragment: "aToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewardsOnBehalf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewardsToSelf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "collectAndUpdateRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaimableRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCurrentRewardsIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalClaimableRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getUnclaimedRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isRegisteredRewardToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaWithdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "refreshRewardTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardTokens", data: BytesLike): Result;
    events: {
        "InitializedStaticATokenLM(address,string,string)": EventFragment;
        "RewardTokenRegistered(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "InitializedStaticATokenLM"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RewardTokenRegistered"): EventFragment;
}
export interface InitializedStaticATokenLMEventObject {
    aToken: string;
    staticATokenName: string;
    staticATokenSymbol: string;
}
export type InitializedStaticATokenLMEvent = TypedEvent<[
    string,
    string,
    string
], InitializedStaticATokenLMEventObject>;
export type InitializedStaticATokenLMEventFilter = TypedEventFilter<InitializedStaticATokenLMEvent>;
export interface RewardTokenRegisteredEventObject {
    reward: string;
    startIndex: BigNumber;
}
export type RewardTokenRegisteredEvent = TypedEvent<[
    string,
    BigNumber
], RewardTokenRegisteredEventObject>;
export type RewardTokenRegisteredEventFilter = TypedEventFilter<RewardTokenRegisteredEvent>;
export interface IStaticATokenV3LM extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IStaticATokenV3LMInterface;
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
        aToken(overrides?: CallOverrides): Promise<[string]>;
        claimRewards(receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimRewardsToSelf(rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        collectAndUpdateRewards(reward: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deposit(assets: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getClaimableRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getCurrentRewardsIndex(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalClaimableRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getUnclaimedRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        isRegisteredRewardToken(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        metaDeposit(depositor: PromiseOrValue<string>, receiver: PromiseOrValue<string>, assets: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, permit: IStaticATokenV3LM.PermitParamsStruct, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaWithdraw(owner: PromiseOrValue<string>, receiver: PromiseOrValue<string>, shares: PromiseOrValue<BigNumberish>, assets: PromiseOrValue<BigNumberish>, withdrawFromAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rate(overrides?: CallOverrides): Promise<[BigNumber]>;
        redeem(shares: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, owner: PromiseOrValue<string>, withdrawFromAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        refreshRewardTokens(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rewardTokens(overrides?: CallOverrides): Promise<[string[]]>;
    };
    aToken(overrides?: CallOverrides): Promise<string>;
    claimRewards(receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimRewardsToSelf(rewards: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    collectAndUpdateRewards(reward: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deposit(assets: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getClaimableRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getCurrentRewardsIndex(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalClaimableRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getUnclaimedRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    isRegisteredRewardToken(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    metaDeposit(depositor: PromiseOrValue<string>, receiver: PromiseOrValue<string>, assets: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, permit: IStaticATokenV3LM.PermitParamsStruct, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaWithdraw(owner: PromiseOrValue<string>, receiver: PromiseOrValue<string>, shares: PromiseOrValue<BigNumberish>, assets: PromiseOrValue<BigNumberish>, withdrawFromAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rate(overrides?: CallOverrides): Promise<BigNumber>;
    redeem(shares: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, owner: PromiseOrValue<string>, withdrawFromAave: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    refreshRewardTokens(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rewardTokens(overrides?: CallOverrides): Promise<string[]>;
    callStatic: {
        aToken(overrides?: CallOverrides): Promise<string>;
        claimRewards(receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        claimRewardsToSelf(rewards: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        collectAndUpdateRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        deposit(assets: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
        getClaimableRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getCurrentRewardsIndex(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalClaimableRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getUnclaimedRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        isRegisteredRewardToken(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        metaDeposit(depositor: PromiseOrValue<string>, receiver: PromiseOrValue<string>, assets: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, permit: IStaticATokenV3LM.PermitParamsStruct, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: CallOverrides): Promise<BigNumber>;
        metaWithdraw(owner: PromiseOrValue<string>, receiver: PromiseOrValue<string>, shares: PromiseOrValue<BigNumberish>, assets: PromiseOrValue<BigNumberish>, withdrawFromAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        redeem(shares: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, owner: PromiseOrValue<string>, withdrawFromAave: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
        refreshRewardTokens(overrides?: CallOverrides): Promise<void>;
        rewardTokens(overrides?: CallOverrides): Promise<string[]>;
    };
    filters: {
        "InitializedStaticATokenLM(address,string,string)"(aToken?: PromiseOrValue<string> | null, staticATokenName?: null, staticATokenSymbol?: null): InitializedStaticATokenLMEventFilter;
        InitializedStaticATokenLM(aToken?: PromiseOrValue<string> | null, staticATokenName?: null, staticATokenSymbol?: null): InitializedStaticATokenLMEventFilter;
        "RewardTokenRegistered(address,uint256)"(reward?: PromiseOrValue<string> | null, startIndex?: null): RewardTokenRegisteredEventFilter;
        RewardTokenRegistered(reward?: PromiseOrValue<string> | null, startIndex?: null): RewardTokenRegisteredEventFilter;
    };
    estimateGas: {
        aToken(overrides?: CallOverrides): Promise<BigNumber>;
        claimRewards(receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimRewardsToSelf(rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        collectAndUpdateRewards(reward: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deposit(assets: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getClaimableRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getCurrentRewardsIndex(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalClaimableRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getUnclaimedRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        isRegisteredRewardToken(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        metaDeposit(depositor: PromiseOrValue<string>, receiver: PromiseOrValue<string>, assets: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, permit: IStaticATokenV3LM.PermitParamsStruct, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaWithdraw(owner: PromiseOrValue<string>, receiver: PromiseOrValue<string>, shares: PromiseOrValue<BigNumberish>, assets: PromiseOrValue<BigNumberish>, withdrawFromAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        redeem(shares: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, owner: PromiseOrValue<string>, withdrawFromAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        refreshRewardTokens(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rewardTokens(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        aToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        claimRewards(receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimRewardsToSelf(rewards: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        collectAndUpdateRewards(reward: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deposit(assets: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getClaimableRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCurrentRewardsIndex(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalClaimableRewards(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getUnclaimedRewards(user: PromiseOrValue<string>, reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize(aToken: PromiseOrValue<string>, staticATokenName: PromiseOrValue<string>, staticATokenSymbol: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        isRegisteredRewardToken(reward: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        metaDeposit(depositor: PromiseOrValue<string>, receiver: PromiseOrValue<string>, assets: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, depositToAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, permit: IStaticATokenV3LM.PermitParamsStruct, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaWithdraw(owner: PromiseOrValue<string>, receiver: PromiseOrValue<string>, shares: PromiseOrValue<BigNumberish>, assets: PromiseOrValue<BigNumberish>, withdrawFromAave: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenV3LM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        redeem(shares: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, owner: PromiseOrValue<string>, withdrawFromAave: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        refreshRewardTokens(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rewardTokens(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
