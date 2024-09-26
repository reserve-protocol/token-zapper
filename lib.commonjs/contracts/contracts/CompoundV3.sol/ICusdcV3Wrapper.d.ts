import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type TotalsBasicStruct = {
    baseSupplyIndex: PromiseOrValue<BigNumberish>;
    baseBorrowIndex: PromiseOrValue<BigNumberish>;
    trackingSupplyIndex: PromiseOrValue<BigNumberish>;
    trackingBorrowIndex: PromiseOrValue<BigNumberish>;
    totalSupplyBase: PromiseOrValue<BigNumberish>;
    totalBorrowBase: PromiseOrValue<BigNumberish>;
    lastAccrualTime: PromiseOrValue<BigNumberish>;
    pauseFlags: PromiseOrValue<BigNumberish>;
};
export type TotalsBasicStructOutput = [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    number,
    number
] & {
    baseSupplyIndex: BigNumber;
    baseBorrowIndex: BigNumber;
    trackingSupplyIndex: BigNumber;
    trackingBorrowIndex: BigNumber;
    totalSupplyBase: BigNumber;
    totalBorrowBase: BigNumber;
    lastAccrualTime: number;
    pauseFlags: number;
};
export interface ICusdcV3WrapperInterface extends utils.Interface {
    functions: {
        "accrue()": FunctionFragment;
        "accrueAccount(address)": FunctionFragment;
        "allow(address,bool)": FunctionFragment;
        "allowBySig(address,address,bool,uint256,uint256,uint8,bytes32,bytes32)": FunctionFragment;
        "allowance(address,address)": FunctionFragment;
        "approve(address,uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "baseAccrualScale()": FunctionFragment;
        "baseIndexScale()": FunctionFragment;
        "baseTrackingAccrued(address)": FunctionFragment;
        "baseTrackingIndex(address)": FunctionFragment;
        "claimRewards()": FunctionFragment;
        "claimTo(address,address)": FunctionFragment;
        "collateralBalanceOf(address,address)": FunctionFragment;
        "convertDynamicToStatic(uint256)": FunctionFragment;
        "convertStaticToDynamic(uint104)": FunctionFragment;
        "decimals()": FunctionFragment;
        "deposit(uint256)": FunctionFragment;
        "depositFrom(address,address,uint256)": FunctionFragment;
        "depositTo(address,uint256)": FunctionFragment;
        "exchangeRate()": FunctionFragment;
        "factorScale()": FunctionFragment;
        "getRewardOwed(address)": FunctionFragment;
        "hasPermission(address,address)": FunctionFragment;
        "isAllowed(address,address)": FunctionFragment;
        "maxAssets()": FunctionFragment;
        "name()": FunctionFragment;
        "priceScale()": FunctionFragment;
        "rewardERC20()": FunctionFragment;
        "symbol()": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "totalsBasic()": FunctionFragment;
        "transfer(address,uint256)": FunctionFragment;
        "transferFrom(address,address,uint256)": FunctionFragment;
        "underlyingBalanceOf(address)": FunctionFragment;
        "underlyingComet()": FunctionFragment;
        "version()": FunctionFragment;
        "withdraw(uint256)": FunctionFragment;
        "withdrawFrom(address,address,uint256)": FunctionFragment;
        "withdrawTo(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "accrue" | "accrueAccount" | "allow" | "allowBySig" | "allowance" | "approve" | "balanceOf" | "baseAccrualScale" | "baseIndexScale" | "baseTrackingAccrued" | "baseTrackingIndex" | "claimRewards" | "claimTo" | "collateralBalanceOf" | "convertDynamicToStatic" | "convertStaticToDynamic" | "decimals" | "deposit" | "depositFrom" | "depositTo" | "exchangeRate" | "factorScale" | "getRewardOwed" | "hasPermission" | "isAllowed" | "maxAssets" | "name" | "priceScale" | "rewardERC20" | "symbol" | "totalSupply" | "totalsBasic" | "transfer" | "transferFrom" | "underlyingBalanceOf" | "underlyingComet" | "version" | "withdraw" | "withdrawFrom" | "withdrawTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "accrue", values?: undefined): string;
    encodeFunctionData(functionFragment: "accrueAccount", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "allow", values: [PromiseOrValue<string>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "allowBySig", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "allowance", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "approve", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "baseAccrualScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseIndexScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTrackingAccrued", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "baseTrackingIndex", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "claimRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "claimTo", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "collateralBalanceOf", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "convertDynamicToStatic", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "convertStaticToDynamic", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "depositFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "depositTo", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "exchangeRate", values?: undefined): string;
    encodeFunctionData(functionFragment: "factorScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "getRewardOwed", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "hasPermission", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isAllowed", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "maxAssets", values?: undefined): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "priceScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardERC20", values?: undefined): string;
    encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalsBasic", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "transferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "underlyingBalanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "underlyingComet", values?: undefined): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "withdrawTo", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "accrue", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accrueAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "allow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "allowBySig", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseAccrualScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseIndexScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTrackingAccrued", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTrackingIndex", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimTo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "collateralBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convertDynamicToStatic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convertStaticToDynamic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositTo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exchangeRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "factorScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getRewardOwed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "hasPermission", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isAllowed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "maxAssets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "priceScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardERC20", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalsBasic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlyingBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "underlyingComet", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;
    events: {
        "Approval(address,address,uint256)": EventFragment;
        "RewardsClaimed(address,uint256)": EventFragment;
        "Transfer(address,address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RewardsClaimed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
}
export interface ApprovalEventObject {
    owner: string;
    spender: string;
    value: BigNumber;
}
export type ApprovalEvent = TypedEvent<[
    string,
    string,
    BigNumber
], ApprovalEventObject>;
export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;
export interface RewardsClaimedEventObject {
    erc20: string;
    amount: BigNumber;
}
export type RewardsClaimedEvent = TypedEvent<[
    string,
    BigNumber
], RewardsClaimedEventObject>;
export type RewardsClaimedEventFilter = TypedEventFilter<RewardsClaimedEvent>;
export interface TransferEventObject {
    from: string;
    to: string;
    value: BigNumber;
}
export type TransferEvent = TypedEvent<[
    string,
    string,
    BigNumber
], TransferEventObject>;
export type TransferEventFilter = TypedEventFilter<TransferEvent>;
export interface ICusdcV3Wrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICusdcV3WrapperInterface;
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
        accrue(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        allow(manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        allowBySig(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, nonce: PromiseOrValue<BigNumberish>, expiry: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        baseAccrualScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseIndexScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseTrackingAccrued(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        baseTrackingIndex(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimTo(src: PromiseOrValue<string>, to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        collateralBalanceOf(account: PromiseOrValue<string>, asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        convertDynamicToStatic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        convertStaticToDynamic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        deposit(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        depositFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        depositTo(account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        exchangeRate(overrides?: CallOverrides): Promise<[BigNumber]>;
        factorScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        getRewardOwed(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        hasPermission(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        isAllowed(first: PromiseOrValue<string>, second: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        maxAssets(overrides?: CallOverrides): Promise<[number]>;
        name(overrides?: CallOverrides): Promise<[string]>;
        priceScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        rewardERC20(overrides?: CallOverrides): Promise<[string]>;
        symbol(overrides?: CallOverrides): Promise<[string]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        totalsBasic(overrides?: CallOverrides): Promise<[TotalsBasicStructOutput]>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        underlyingBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        underlyingComet(overrides?: CallOverrides): Promise<[string]>;
        version(overrides?: CallOverrides): Promise<[string]>;
        withdraw(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawTo(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    accrue(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    allow(manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    allowBySig(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, nonce: PromiseOrValue<BigNumberish>, expiry: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    baseAccrualScale(overrides?: CallOverrides): Promise<BigNumber>;
    baseIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
    baseTrackingAccrued(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    baseTrackingIndex(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    claimRewards(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimTo(src: PromiseOrValue<string>, to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    collateralBalanceOf(account: PromiseOrValue<string>, asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    convertDynamicToStatic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    convertStaticToDynamic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    decimals(overrides?: CallOverrides): Promise<number>;
    deposit(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    depositFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    depositTo(account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    exchangeRate(overrides?: CallOverrides): Promise<BigNumber>;
    factorScale(overrides?: CallOverrides): Promise<BigNumber>;
    getRewardOwed(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    hasPermission(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    isAllowed(first: PromiseOrValue<string>, second: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    maxAssets(overrides?: CallOverrides): Promise<number>;
    name(overrides?: CallOverrides): Promise<string>;
    priceScale(overrides?: CallOverrides): Promise<BigNumber>;
    rewardERC20(overrides?: CallOverrides): Promise<string>;
    symbol(overrides?: CallOverrides): Promise<string>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    totalsBasic(overrides?: CallOverrides): Promise<TotalsBasicStructOutput>;
    transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    underlyingBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    underlyingComet(overrides?: CallOverrides): Promise<string>;
    version(overrides?: CallOverrides): Promise<string>;
    withdraw(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawTo(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        accrue(overrides?: CallOverrides): Promise<void>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        allow(manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        allowBySig(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, nonce: PromiseOrValue<BigNumberish>, expiry: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseAccrualScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingAccrued(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingIndex(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        claimRewards(overrides?: CallOverrides): Promise<void>;
        claimTo(src: PromiseOrValue<string>, to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        collateralBalanceOf(account: PromiseOrValue<string>, asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        convertDynamicToStatic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        convertStaticToDynamic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<number>;
        deposit(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        depositFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        depositTo(account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        exchangeRate(overrides?: CallOverrides): Promise<BigNumber>;
        factorScale(overrides?: CallOverrides): Promise<BigNumber>;
        getRewardOwed(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        hasPermission(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        isAllowed(first: PromiseOrValue<string>, second: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        maxAssets(overrides?: CallOverrides): Promise<number>;
        name(overrides?: CallOverrides): Promise<string>;
        priceScale(overrides?: CallOverrides): Promise<BigNumber>;
        rewardERC20(overrides?: CallOverrides): Promise<string>;
        symbol(overrides?: CallOverrides): Promise<string>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        totalsBasic(overrides?: CallOverrides): Promise<TotalsBasicStructOutput>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        underlyingBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        underlyingComet(overrides?: CallOverrides): Promise<string>;
        version(overrides?: CallOverrides): Promise<string>;
        withdraw(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawTo(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "Approval(address,address,uint256)"(owner?: PromiseOrValue<string> | null, spender?: PromiseOrValue<string> | null, value?: null): ApprovalEventFilter;
        Approval(owner?: PromiseOrValue<string> | null, spender?: PromiseOrValue<string> | null, value?: null): ApprovalEventFilter;
        "RewardsClaimed(address,uint256)"(erc20?: PromiseOrValue<string> | null, amount?: null): RewardsClaimedEventFilter;
        RewardsClaimed(erc20?: PromiseOrValue<string> | null, amount?: null): RewardsClaimedEventFilter;
        "Transfer(address,address,uint256)"(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, value?: null): TransferEventFilter;
        Transfer(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, value?: null): TransferEventFilter;
    };
    estimateGas: {
        accrue(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        allow(manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        allowBySig(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, nonce: PromiseOrValue<BigNumberish>, expiry: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseAccrualScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingAccrued(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingIndex(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimTo(src: PromiseOrValue<string>, to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        collateralBalanceOf(account: PromiseOrValue<string>, asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        convertDynamicToStatic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        convertStaticToDynamic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        depositFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        depositTo(account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        exchangeRate(overrides?: CallOverrides): Promise<BigNumber>;
        factorScale(overrides?: CallOverrides): Promise<BigNumber>;
        getRewardOwed(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        hasPermission(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isAllowed(first: PromiseOrValue<string>, second: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        maxAssets(overrides?: CallOverrides): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        priceScale(overrides?: CallOverrides): Promise<BigNumber>;
        rewardERC20(overrides?: CallOverrides): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        totalsBasic(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        underlyingBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        underlyingComet(overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawTo(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        accrue(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        allow(manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        allowBySig(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, isAllowed: PromiseOrValue<boolean>, nonce: PromiseOrValue<BigNumberish>, expiry: PromiseOrValue<BigNumberish>, v: PromiseOrValue<BigNumberish>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseAccrualScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseIndexScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseTrackingAccrued(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseTrackingIndex(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimTo(src: PromiseOrValue<string>, to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        collateralBalanceOf(account: PromiseOrValue<string>, asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convertDynamicToStatic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convertStaticToDynamic(amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        depositFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        depositTo(account: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        exchangeRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        factorScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getRewardOwed(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        hasPermission(owner: PromiseOrValue<string>, manager: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isAllowed(first: PromiseOrValue<string>, second: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        maxAssets(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        priceScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardERC20(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalsBasic(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        underlyingBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        underlyingComet(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawTo(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
