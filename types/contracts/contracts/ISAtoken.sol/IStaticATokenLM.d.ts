import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export declare namespace IStaticATokenLM {
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
export interface IStaticATokenLMInterface extends utils.Interface {
    functions: {
        "ASSET()": FunctionFragment;
        "ATOKEN()": FunctionFragment;
        "INCENTIVES_CONTROLLER()": FunctionFragment;
        "LENDING_POOL()": FunctionFragment;
        "REWARD_TOKEN()": FunctionFragment;
        "UNDERLYING_ASSET_ADDRESS()": FunctionFragment;
        "claimRewards(address,bool)": FunctionFragment;
        "claimRewardsOnBehalf(address,address,bool)": FunctionFragment;
        "claimRewardsToSelf(bool)": FunctionFragment;
        "collectAndUpdateRewards()": FunctionFragment;
        "deposit(address,uint256,uint16,bool)": FunctionFragment;
        "dynamicBalanceOf(address)": FunctionFragment;
        "dynamicToStaticAmount(uint256)": FunctionFragment;
        "getAccRewardsPerToken()": FunctionFragment;
        "getClaimableRewards(address)": FunctionFragment;
        "getDomainSeparator()": FunctionFragment;
        "getIncentivesController()": FunctionFragment;
        "getLastRewardBlock()": FunctionFragment;
        "getLifetimeRewards()": FunctionFragment;
        "getLifetimeRewardsClaimed()": FunctionFragment;
        "getTotalClaimableRewards()": FunctionFragment;
        "getUnclaimedRewards(address)": FunctionFragment;
        "metaDeposit(address,address,uint256,uint16,bool,uint256,(uint8,bytes32,bytes32))": FunctionFragment;
        "metaWithdraw(address,address,uint256,uint256,bool,uint256,(uint8,bytes32,bytes32))": FunctionFragment;
        "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
        "rate()": FunctionFragment;
        "staticToDynamicAmount(uint256)": FunctionFragment;
        "withdraw(address,uint256,bool)": FunctionFragment;
        "withdrawDynamicAmount(address,uint256,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "ASSET" | "ATOKEN" | "INCENTIVES_CONTROLLER" | "LENDING_POOL" | "REWARD_TOKEN" | "UNDERLYING_ASSET_ADDRESS" | "claimRewards" | "claimRewardsOnBehalf" | "claimRewardsToSelf" | "collectAndUpdateRewards" | "deposit" | "dynamicBalanceOf" | "dynamicToStaticAmount" | "getAccRewardsPerToken" | "getClaimableRewards" | "getDomainSeparator" | "getIncentivesController" | "getLastRewardBlock" | "getLifetimeRewards" | "getLifetimeRewardsClaimed" | "getTotalClaimableRewards" | "getUnclaimedRewards" | "metaDeposit" | "metaWithdraw" | "permit" | "rate" | "staticToDynamicAmount" | "withdraw" | "withdrawDynamicAmount"): FunctionFragment;
    encodeFunctionData(functionFragment: "ASSET", values?: undefined): string;
    encodeFunctionData(functionFragment: "ATOKEN", values?: undefined): string;
    encodeFunctionData(functionFragment: "INCENTIVES_CONTROLLER", values?: undefined): string;
    encodeFunctionData(functionFragment: "LENDING_POOL", values?: undefined): string;
    encodeFunctionData(functionFragment: "REWARD_TOKEN", values?: undefined): string;
    encodeFunctionData(functionFragment: "UNDERLYING_ASSET_ADDRESS", values?: undefined): string;
    encodeFunctionData(functionFragment: "claimRewards", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "claimRewardsOnBehalf", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "claimRewardsToSelf", values: [PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "collectAndUpdateRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "dynamicBalanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "dynamicToStaticAmount", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getAccRewardsPerToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "getClaimableRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getDomainSeparator", values?: undefined): string;
    encodeFunctionData(functionFragment: "getIncentivesController", values?: undefined): string;
    encodeFunctionData(functionFragment: "getLastRewardBlock", values?: undefined): string;
    encodeFunctionData(functionFragment: "getLifetimeRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "getLifetimeRewardsClaimed", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalClaimableRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "getUnclaimedRewards", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "metaDeposit", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        IStaticATokenLM.SignatureParamsStruct
    ]): string;
    encodeFunctionData(functionFragment: "metaWithdraw", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        IStaticATokenLM.SignatureParamsStruct
    ]): string;
    encodeFunctionData(functionFragment: "permit", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "rate", values?: undefined): string;
    encodeFunctionData(functionFragment: "staticToDynamicAmount", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "withdrawDynamicAmount", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    decodeFunctionResult(functionFragment: "ASSET", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "ATOKEN", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "INCENTIVES_CONTROLLER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "LENDING_POOL", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "REWARD_TOKEN", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "UNDERLYING_ASSET_ADDRESS", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewardsOnBehalf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewardsToSelf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "collectAndUpdateRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "dynamicBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "dynamicToStaticAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAccRewardsPerToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaimableRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getDomainSeparator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getIncentivesController", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLastRewardBlock", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLifetimeRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getLifetimeRewardsClaimed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalClaimableRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getUnclaimedRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaDeposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "metaWithdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "permit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "staticToDynamicAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawDynamicAmount", data: BytesLike): Result;
    events: {};
}
export interface IStaticATokenLM extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IStaticATokenLMInterface;
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
        ASSET(overrides?: CallOverrides): Promise<[string]>;
        ATOKEN(overrides?: CallOverrides): Promise<[string]>;
        INCENTIVES_CONTROLLER(overrides?: CallOverrides): Promise<[string]>;
        LENDING_POOL(overrides?: CallOverrides): Promise<[string]>;
        REWARD_TOKEN(overrides?: CallOverrides): Promise<[string]>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<[string]>;
        claimRewards(receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimRewardsToSelf(forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        collectAndUpdateRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getAccRewardsPerToken(overrides?: CallOverrides): Promise<[BigNumber]>;
        getClaimableRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getDomainSeparator(overrides?: CallOverrides): Promise<[string]>;
        getIncentivesController(overrides?: CallOverrides): Promise<[string]>;
        getLastRewardBlock(overrides?: CallOverrides): Promise<[BigNumber]>;
        getLifetimeRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        getLifetimeRewardsClaimed(overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalClaimableRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        getUnclaimedRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        metaDeposit(depositor: PromiseOrValue<string>, recipient: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        metaWithdraw(owner: PromiseOrValue<string>, recipient: PromiseOrValue<string>, staticAmount: PromiseOrValue<BigNumberish>, dynamicAmount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        permit(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, deadline: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rate(overrides?: CallOverrides): Promise<[BigNumber]>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawDynamicAmount(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    ASSET(overrides?: CallOverrides): Promise<string>;
    ATOKEN(overrides?: CallOverrides): Promise<string>;
    INCENTIVES_CONTROLLER(overrides?: CallOverrides): Promise<string>;
    LENDING_POOL(overrides?: CallOverrides): Promise<string>;
    REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;
    UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;
    claimRewards(receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimRewardsToSelf(forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    collectAndUpdateRewards(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getAccRewardsPerToken(overrides?: CallOverrides): Promise<BigNumber>;
    getClaimableRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getDomainSeparator(overrides?: CallOverrides): Promise<string>;
    getIncentivesController(overrides?: CallOverrides): Promise<string>;
    getLastRewardBlock(overrides?: CallOverrides): Promise<BigNumber>;
    getLifetimeRewards(overrides?: CallOverrides): Promise<BigNumber>;
    getLifetimeRewardsClaimed(overrides?: CallOverrides): Promise<BigNumber>;
    getTotalClaimableRewards(overrides?: CallOverrides): Promise<BigNumber>;
    getUnclaimedRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    metaDeposit(depositor: PromiseOrValue<string>, recipient: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    metaWithdraw(owner: PromiseOrValue<string>, recipient: PromiseOrValue<string>, staticAmount: PromiseOrValue<BigNumberish>, dynamicAmount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    permit(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, deadline: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rate(overrides?: CallOverrides): Promise<BigNumber>;
    staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawDynamicAmount(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        ASSET(overrides?: CallOverrides): Promise<string>;
        ATOKEN(overrides?: CallOverrides): Promise<string>;
        INCENTIVES_CONTROLLER(overrides?: CallOverrides): Promise<string>;
        LENDING_POOL(overrides?: CallOverrides): Promise<string>;
        REWARD_TOKEN(overrides?: CallOverrides): Promise<string>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<string>;
        claimRewards(receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        claimRewardsToSelf(forceUpdate: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        collectAndUpdateRewards(overrides?: CallOverrides): Promise<void>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getAccRewardsPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        getClaimableRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getDomainSeparator(overrides?: CallOverrides): Promise<string>;
        getIncentivesController(overrides?: CallOverrides): Promise<string>;
        getLastRewardBlock(overrides?: CallOverrides): Promise<BigNumber>;
        getLifetimeRewards(overrides?: CallOverrides): Promise<BigNumber>;
        getLifetimeRewardsClaimed(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalClaimableRewards(overrides?: CallOverrides): Promise<BigNumber>;
        getUnclaimedRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        metaDeposit(depositor: PromiseOrValue<string>, recipient: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: CallOverrides): Promise<BigNumber>;
        metaWithdraw(owner: PromiseOrValue<string>, recipient: PromiseOrValue<string>, staticAmount: PromiseOrValue<BigNumberish>, dynamicAmount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
        permit(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, deadline: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
        withdrawDynamicAmount(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber]>;
    };
    filters: {};
    estimateGas: {
        ASSET(overrides?: CallOverrides): Promise<BigNumber>;
        ATOKEN(overrides?: CallOverrides): Promise<BigNumber>;
        INCENTIVES_CONTROLLER(overrides?: CallOverrides): Promise<BigNumber>;
        LENDING_POOL(overrides?: CallOverrides): Promise<BigNumber>;
        REWARD_TOKEN(overrides?: CallOverrides): Promise<BigNumber>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<BigNumber>;
        claimRewards(receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimRewardsToSelf(forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        collectAndUpdateRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getAccRewardsPerToken(overrides?: CallOverrides): Promise<BigNumber>;
        getClaimableRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getDomainSeparator(overrides?: CallOverrides): Promise<BigNumber>;
        getIncentivesController(overrides?: CallOverrides): Promise<BigNumber>;
        getLastRewardBlock(overrides?: CallOverrides): Promise<BigNumber>;
        getLifetimeRewards(overrides?: CallOverrides): Promise<BigNumber>;
        getLifetimeRewardsClaimed(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalClaimableRewards(overrides?: CallOverrides): Promise<BigNumber>;
        getUnclaimedRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        metaDeposit(depositor: PromiseOrValue<string>, recipient: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        metaWithdraw(owner: PromiseOrValue<string>, recipient: PromiseOrValue<string>, staticAmount: PromiseOrValue<BigNumberish>, dynamicAmount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        permit(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, deadline: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rate(overrides?: CallOverrides): Promise<BigNumber>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawDynamicAmount(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        ASSET(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        ATOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        INCENTIVES_CONTROLLER(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        LENDING_POOL(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        REWARD_TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        UNDERLYING_ASSET_ADDRESS(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        claimRewards(receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimRewardsOnBehalf(onBehalfOf: PromiseOrValue<string>, receiver: PromiseOrValue<string>, forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimRewardsToSelf(forceUpdate: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        collectAndUpdateRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        deposit(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        dynamicBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        dynamicToStaticAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAccRewardsPerToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClaimableRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getDomainSeparator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getIncentivesController(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getLastRewardBlock(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getLifetimeRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getLifetimeRewardsClaimed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalClaimableRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getUnclaimedRewards(user: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        metaDeposit(depositor: PromiseOrValue<string>, recipient: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, referralCode: PromiseOrValue<BigNumberish>, fromUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        metaWithdraw(owner: PromiseOrValue<string>, recipient: PromiseOrValue<string>, staticAmount: PromiseOrValue<BigNumberish>, dynamicAmount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, deadline: PromiseOrValue<BigNumberish>, sigParams: IStaticATokenLM.SignatureParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        permit(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, deadline: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        staticToDynamicAmount(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawDynamicAmount(recipient: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, toUnderlying: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IStaticATokenLM.d.ts.map