import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type AssetInfoStruct = {
    offset: PromiseOrValue<BigNumberish>;
    asset: PromiseOrValue<string>;
    priceFeed: PromiseOrValue<string>;
    scale: PromiseOrValue<BigNumberish>;
    borrowCollateralFactor: PromiseOrValue<BigNumberish>;
    liquidateCollateralFactor: PromiseOrValue<BigNumberish>;
    liquidationFactor: PromiseOrValue<BigNumberish>;
    supplyCap: PromiseOrValue<BigNumberish>;
};
export type AssetInfoStructOutput = [
    number,
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
] & {
    offset: number;
    asset: string;
    priceFeed: string;
    scale: BigNumber;
    borrowCollateralFactor: BigNumber;
    liquidateCollateralFactor: BigNumber;
    liquidationFactor: BigNumber;
    supplyCap: BigNumber;
};
export declare namespace IComet {
    type UserBasicStruct = {
        principal: PromiseOrValue<BigNumberish>;
        baseTrackingIndex: PromiseOrValue<BigNumberish>;
        baseTrackingAccrued: PromiseOrValue<BigNumberish>;
    };
    type UserBasicStructOutput = [BigNumber, BigNumber, BigNumber] & {
        principal: BigNumber;
        baseTrackingIndex: BigNumber;
        baseTrackingAccrued: BigNumber;
    };
}
export interface ICometInterface extends utils.Interface {
    functions: {
        "absorb(address,address[])": FunctionFragment;
        "accrueAccount(address)": FunctionFragment;
        "approveThis(address,address,uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "baseBorrowMin()": FunctionFragment;
        "baseMinForRewards()": FunctionFragment;
        "baseScale()": FunctionFragment;
        "baseToken()": FunctionFragment;
        "baseTokenPriceFeed()": FunctionFragment;
        "baseTrackingBorrowSpeed()": FunctionFragment;
        "baseTrackingSupplySpeed()": FunctionFragment;
        "borrowBalanceOf(address)": FunctionFragment;
        "borrowKink()": FunctionFragment;
        "borrowPerSecondInterestRateBase()": FunctionFragment;
        "borrowPerSecondInterestRateSlopeHigh()": FunctionFragment;
        "borrowPerSecondInterestRateSlopeLow()": FunctionFragment;
        "buyCollateral(address,uint256,uint256,address)": FunctionFragment;
        "decimals()": FunctionFragment;
        "extensionDelegate()": FunctionFragment;
        "getAssetInfo(uint8)": FunctionFragment;
        "getAssetInfoByAddress(address)": FunctionFragment;
        "getBorrowRate(uint256)": FunctionFragment;
        "getPrice(address)": FunctionFragment;
        "getReserves()": FunctionFragment;
        "getSupplyRate(uint256)": FunctionFragment;
        "getUtilization()": FunctionFragment;
        "governor()": FunctionFragment;
        "initializeStorage()": FunctionFragment;
        "isAbsorbPaused()": FunctionFragment;
        "isBorrowCollateralized(address)": FunctionFragment;
        "isBuyPaused()": FunctionFragment;
        "isLiquidatable(address)": FunctionFragment;
        "isSupplyPaused()": FunctionFragment;
        "isTransferPaused()": FunctionFragment;
        "isWithdrawPaused()": FunctionFragment;
        "numAssets()": FunctionFragment;
        "pause(bool,bool,bool,bool,bool)": FunctionFragment;
        "pauseGuardian()": FunctionFragment;
        "quoteCollateral(address,uint256)": FunctionFragment;
        "storeFrontPriceFactor()": FunctionFragment;
        "supply(address,uint256)": FunctionFragment;
        "supplyFrom(address,address,address,uint256)": FunctionFragment;
        "supplyKink()": FunctionFragment;
        "supplyPerSecondInterestRateBase()": FunctionFragment;
        "supplyPerSecondInterestRateSlopeHigh()": FunctionFragment;
        "supplyPerSecondInterestRateSlopeLow()": FunctionFragment;
        "supplyTo(address,address,uint256)": FunctionFragment;
        "targetReserves()": FunctionFragment;
        "totalBorrow()": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "trackingIndexScale()": FunctionFragment;
        "transfer(address,uint256)": FunctionFragment;
        "transferAsset(address,address,uint256)": FunctionFragment;
        "transferAssetFrom(address,address,address,uint256)": FunctionFragment;
        "transferFrom(address,address,uint256)": FunctionFragment;
        "userBasic(address)": FunctionFragment;
        "withdraw(address,uint256)": FunctionFragment;
        "withdrawFrom(address,address,address,uint256)": FunctionFragment;
        "withdrawReserves(address,uint256)": FunctionFragment;
        "withdrawTo(address,address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "absorb" | "accrueAccount" | "approveThis" | "balanceOf" | "baseBorrowMin" | "baseMinForRewards" | "baseScale" | "baseToken" | "baseTokenPriceFeed" | "baseTrackingBorrowSpeed" | "baseTrackingSupplySpeed" | "borrowBalanceOf" | "borrowKink" | "borrowPerSecondInterestRateBase" | "borrowPerSecondInterestRateSlopeHigh" | "borrowPerSecondInterestRateSlopeLow" | "buyCollateral" | "decimals" | "extensionDelegate" | "getAssetInfo" | "getAssetInfoByAddress" | "getBorrowRate" | "getPrice" | "getReserves" | "getSupplyRate" | "getUtilization" | "governor" | "initializeStorage" | "isAbsorbPaused" | "isBorrowCollateralized" | "isBuyPaused" | "isLiquidatable" | "isSupplyPaused" | "isTransferPaused" | "isWithdrawPaused" | "numAssets" | "pause" | "pauseGuardian" | "quoteCollateral" | "storeFrontPriceFactor" | "supply" | "supplyFrom" | "supplyKink" | "supplyPerSecondInterestRateBase" | "supplyPerSecondInterestRateSlopeHigh" | "supplyPerSecondInterestRateSlopeLow" | "supplyTo" | "targetReserves" | "totalBorrow" | "totalSupply" | "trackingIndexScale" | "transfer" | "transferAsset" | "transferAssetFrom" | "transferFrom" | "userBasic" | "withdraw" | "withdrawFrom" | "withdrawReserves" | "withdrawTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "absorb", values: [PromiseOrValue<string>, PromiseOrValue<string>[]]): string;
    encodeFunctionData(functionFragment: "accrueAccount", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "approveThis", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "baseBorrowMin", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseMinForRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTokenPriceFeed", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTrackingBorrowSpeed", values?: undefined): string;
    encodeFunctionData(functionFragment: "baseTrackingSupplySpeed", values?: undefined): string;
    encodeFunctionData(functionFragment: "borrowBalanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "borrowKink", values?: undefined): string;
    encodeFunctionData(functionFragment: "borrowPerSecondInterestRateBase", values?: undefined): string;
    encodeFunctionData(functionFragment: "borrowPerSecondInterestRateSlopeHigh", values?: undefined): string;
    encodeFunctionData(functionFragment: "borrowPerSecondInterestRateSlopeLow", values?: undefined): string;
    encodeFunctionData(functionFragment: "buyCollateral", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "extensionDelegate", values?: undefined): string;
    encodeFunctionData(functionFragment: "getAssetInfo", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getAssetInfoByAddress", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getBorrowRate", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getPrice", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getReserves", values?: undefined): string;
    encodeFunctionData(functionFragment: "getSupplyRate", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getUtilization", values?: undefined): string;
    encodeFunctionData(functionFragment: "governor", values?: undefined): string;
    encodeFunctionData(functionFragment: "initializeStorage", values?: undefined): string;
    encodeFunctionData(functionFragment: "isAbsorbPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "isBorrowCollateralized", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isBuyPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "isLiquidatable", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isSupplyPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "isTransferPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "isWithdrawPaused", values?: undefined): string;
    encodeFunctionData(functionFragment: "numAssets", values?: undefined): string;
    encodeFunctionData(functionFragment: "pause", values: [
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "pauseGuardian", values?: undefined): string;
    encodeFunctionData(functionFragment: "quoteCollateral", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "storeFrontPriceFactor", values?: undefined): string;
    encodeFunctionData(functionFragment: "supply", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "supplyFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "supplyKink", values?: undefined): string;
    encodeFunctionData(functionFragment: "supplyPerSecondInterestRateBase", values?: undefined): string;
    encodeFunctionData(functionFragment: "supplyPerSecondInterestRateSlopeHigh", values?: undefined): string;
    encodeFunctionData(functionFragment: "supplyPerSecondInterestRateSlopeLow", values?: undefined): string;
    encodeFunctionData(functionFragment: "supplyTo", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "targetReserves", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalBorrow", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "trackingIndexScale", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "transferAsset", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "transferAssetFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "transferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "userBasic", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "withdrawReserves", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawTo", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "absorb", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "accrueAccount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approveThis", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseBorrowMin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseMinForRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTokenPriceFeed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTrackingBorrowSpeed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "baseTrackingSupplySpeed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "borrowBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "borrowKink", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "borrowPerSecondInterestRateBase", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "borrowPerSecondInterestRateSlopeHigh", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "borrowPerSecondInterestRateSlopeLow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "buyCollateral", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "extensionDelegate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAssetInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAssetInfoByAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBorrowRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getReserves", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSupplyRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getUtilization", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "governor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initializeStorage", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isAbsorbPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isBorrowCollateralized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isBuyPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isLiquidatable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isSupplyPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isTransferPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isWithdrawPaused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "numAssets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "pauseGuardian", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "quoteCollateral", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "storeFrontPriceFactor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyKink", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyPerSecondInterestRateBase", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyPerSecondInterestRateSlopeHigh", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyPerSecondInterestRateSlopeLow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyTo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "targetReserves", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalBorrow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "trackingIndexScale", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferAsset", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferAssetFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "userBasic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawReserves", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;
    events: {
        "AbsorbCollateral(address,address,address,uint256,uint256)": EventFragment;
        "AbsorbDebt(address,address,uint256,uint256)": EventFragment;
        "BuyCollateral(address,address,uint256,uint256)": EventFragment;
        "PauseAction(bool,bool,bool,bool,bool)": EventFragment;
        "Supply(address,address,uint256)": EventFragment;
        "SupplyCollateral(address,address,address,uint256)": EventFragment;
        "Transfer(address,address,uint256)": EventFragment;
        "TransferCollateral(address,address,address,uint256)": EventFragment;
        "Withdraw(address,address,uint256)": EventFragment;
        "WithdrawCollateral(address,address,address,uint256)": EventFragment;
        "WithdrawReserves(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AbsorbCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "AbsorbDebt"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "BuyCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PauseAction"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Supply"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SupplyCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TransferCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Withdraw"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WithdrawCollateral"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WithdrawReserves"): EventFragment;
}
export interface AbsorbCollateralEventObject {
    absorber: string;
    borrower: string;
    asset: string;
    collateralAbsorbed: BigNumber;
    usdValue: BigNumber;
}
export type AbsorbCollateralEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber,
    BigNumber
], AbsorbCollateralEventObject>;
export type AbsorbCollateralEventFilter = TypedEventFilter<AbsorbCollateralEvent>;
export interface AbsorbDebtEventObject {
    absorber: string;
    borrower: string;
    basePaidOut: BigNumber;
    usdValue: BigNumber;
}
export type AbsorbDebtEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], AbsorbDebtEventObject>;
export type AbsorbDebtEventFilter = TypedEventFilter<AbsorbDebtEvent>;
export interface BuyCollateralEventObject {
    buyer: string;
    asset: string;
    baseAmount: BigNumber;
    collateralAmount: BigNumber;
}
export type BuyCollateralEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], BuyCollateralEventObject>;
export type BuyCollateralEventFilter = TypedEventFilter<BuyCollateralEvent>;
export interface PauseActionEventObject {
    supplyPaused: boolean;
    transferPaused: boolean;
    withdrawPaused: boolean;
    absorbPaused: boolean;
    buyPaused: boolean;
}
export type PauseActionEvent = TypedEvent<[
    boolean,
    boolean,
    boolean,
    boolean,
    boolean
], PauseActionEventObject>;
export type PauseActionEventFilter = TypedEventFilter<PauseActionEvent>;
export interface SupplyEventObject {
    from: string;
    dst: string;
    amount: BigNumber;
}
export type SupplyEvent = TypedEvent<[
    string,
    string,
    BigNumber
], SupplyEventObject>;
export type SupplyEventFilter = TypedEventFilter<SupplyEvent>;
export interface SupplyCollateralEventObject {
    from: string;
    dst: string;
    asset: string;
    amount: BigNumber;
}
export type SupplyCollateralEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], SupplyCollateralEventObject>;
export type SupplyCollateralEventFilter = TypedEventFilter<SupplyCollateralEvent>;
export interface TransferEventObject {
    from: string;
    to: string;
    amount: BigNumber;
}
export type TransferEvent = TypedEvent<[
    string,
    string,
    BigNumber
], TransferEventObject>;
export type TransferEventFilter = TypedEventFilter<TransferEvent>;
export interface TransferCollateralEventObject {
    from: string;
    to: string;
    asset: string;
    amount: BigNumber;
}
export type TransferCollateralEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], TransferCollateralEventObject>;
export type TransferCollateralEventFilter = TypedEventFilter<TransferCollateralEvent>;
export interface WithdrawEventObject {
    src: string;
    to: string;
    amount: BigNumber;
}
export type WithdrawEvent = TypedEvent<[
    string,
    string,
    BigNumber
], WithdrawEventObject>;
export type WithdrawEventFilter = TypedEventFilter<WithdrawEvent>;
export interface WithdrawCollateralEventObject {
    src: string;
    to: string;
    asset: string;
    amount: BigNumber;
}
export type WithdrawCollateralEvent = TypedEvent<[
    string,
    string,
    string,
    BigNumber
], WithdrawCollateralEventObject>;
export type WithdrawCollateralEventFilter = TypedEventFilter<WithdrawCollateralEvent>;
export interface WithdrawReservesEventObject {
    to: string;
    amount: BigNumber;
}
export type WithdrawReservesEvent = TypedEvent<[
    string,
    BigNumber
], WithdrawReservesEventObject>;
export type WithdrawReservesEventFilter = TypedEventFilter<WithdrawReservesEvent>;
export interface IComet extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICometInterface;
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
        absorb(absorber: PromiseOrValue<string>, accounts: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        approveThis(manager: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        balanceOf(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        baseBorrowMin(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseMinForRewards(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseToken(overrides?: CallOverrides): Promise<[string]>;
        baseTokenPriceFeed(overrides?: CallOverrides): Promise<[string]>;
        baseTrackingBorrowSpeed(overrides?: CallOverrides): Promise<[BigNumber]>;
        baseTrackingSupplySpeed(overrides?: CallOverrides): Promise<[BigNumber]>;
        borrowBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        borrowKink(overrides?: CallOverrides): Promise<[BigNumber]>;
        borrowPerSecondInterestRateBase(overrides?: CallOverrides): Promise<[BigNumber]>;
        borrowPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<[BigNumber]>;
        borrowPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<[BigNumber]>;
        buyCollateral(asset: PromiseOrValue<string>, minAmount: PromiseOrValue<BigNumberish>, baseAmount: PromiseOrValue<BigNumberish>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        extensionDelegate(overrides?: CallOverrides): Promise<[string]>;
        getAssetInfo(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[AssetInfoStructOutput]>;
        getAssetInfoByAddress(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[AssetInfoStructOutput]>;
        getBorrowRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getPrice(priceFeed: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getReserves(overrides?: CallOverrides): Promise<[BigNumber]>;
        getSupplyRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getUtilization(overrides?: CallOverrides): Promise<[BigNumber]>;
        governor(overrides?: CallOverrides): Promise<[string]>;
        initializeStorage(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        isAbsorbPaused(overrides?: CallOverrides): Promise<[boolean]>;
        isBorrowCollateralized(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        isBuyPaused(overrides?: CallOverrides): Promise<[boolean]>;
        isLiquidatable(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        isSupplyPaused(overrides?: CallOverrides): Promise<[boolean]>;
        isTransferPaused(overrides?: CallOverrides): Promise<[boolean]>;
        isWithdrawPaused(overrides?: CallOverrides): Promise<[boolean]>;
        numAssets(overrides?: CallOverrides): Promise<[number]>;
        pause(supplyPaused: PromiseOrValue<boolean>, transferPaused: PromiseOrValue<boolean>, withdrawPaused: PromiseOrValue<boolean>, absorbPaused: PromiseOrValue<boolean>, buyPaused: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        pauseGuardian(overrides?: CallOverrides): Promise<[string]>;
        quoteCollateral(asset: PromiseOrValue<string>, baseAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        storeFrontPriceFactor(overrides?: CallOverrides): Promise<[BigNumber]>;
        supply(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supplyFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supplyKink(overrides?: CallOverrides): Promise<[BigNumber]>;
        supplyPerSecondInterestRateBase(overrides?: CallOverrides): Promise<[BigNumber]>;
        supplyPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<[BigNumber]>;
        supplyPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<[BigNumber]>;
        supplyTo(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        targetReserves(overrides?: CallOverrides): Promise<[BigNumber]>;
        totalBorrow(overrides?: CallOverrides): Promise<[BigNumber]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        trackingIndexScale(overrides?: CallOverrides): Promise<[BigNumber]>;
        transfer(dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferAsset(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferAssetFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        userBasic(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[IComet.UserBasicStructOutput]>;
        withdraw(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawReserves(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawTo(to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    absorb(absorber: PromiseOrValue<string>, accounts: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    approveThis(manager: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    balanceOf(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    baseBorrowMin(overrides?: CallOverrides): Promise<BigNumber>;
    baseMinForRewards(overrides?: CallOverrides): Promise<BigNumber>;
    baseScale(overrides?: CallOverrides): Promise<BigNumber>;
    baseToken(overrides?: CallOverrides): Promise<string>;
    baseTokenPriceFeed(overrides?: CallOverrides): Promise<string>;
    baseTrackingBorrowSpeed(overrides?: CallOverrides): Promise<BigNumber>;
    baseTrackingSupplySpeed(overrides?: CallOverrides): Promise<BigNumber>;
    borrowBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    borrowKink(overrides?: CallOverrides): Promise<BigNumber>;
    borrowPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
    borrowPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
    borrowPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
    buyCollateral(asset: PromiseOrValue<string>, minAmount: PromiseOrValue<BigNumberish>, baseAmount: PromiseOrValue<BigNumberish>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    decimals(overrides?: CallOverrides): Promise<number>;
    extensionDelegate(overrides?: CallOverrides): Promise<string>;
    getAssetInfo(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<AssetInfoStructOutput>;
    getAssetInfoByAddress(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<AssetInfoStructOutput>;
    getBorrowRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getPrice(priceFeed: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    getReserves(overrides?: CallOverrides): Promise<BigNumber>;
    getSupplyRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getUtilization(overrides?: CallOverrides): Promise<BigNumber>;
    governor(overrides?: CallOverrides): Promise<string>;
    initializeStorage(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    isAbsorbPaused(overrides?: CallOverrides): Promise<boolean>;
    isBorrowCollateralized(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    isBuyPaused(overrides?: CallOverrides): Promise<boolean>;
    isLiquidatable(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    isSupplyPaused(overrides?: CallOverrides): Promise<boolean>;
    isTransferPaused(overrides?: CallOverrides): Promise<boolean>;
    isWithdrawPaused(overrides?: CallOverrides): Promise<boolean>;
    numAssets(overrides?: CallOverrides): Promise<number>;
    pause(supplyPaused: PromiseOrValue<boolean>, transferPaused: PromiseOrValue<boolean>, withdrawPaused: PromiseOrValue<boolean>, absorbPaused: PromiseOrValue<boolean>, buyPaused: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    pauseGuardian(overrides?: CallOverrides): Promise<string>;
    quoteCollateral(asset: PromiseOrValue<string>, baseAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    storeFrontPriceFactor(overrides?: CallOverrides): Promise<BigNumber>;
    supply(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supplyFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supplyKink(overrides?: CallOverrides): Promise<BigNumber>;
    supplyPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
    supplyPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
    supplyPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
    supplyTo(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    targetReserves(overrides?: CallOverrides): Promise<BigNumber>;
    totalBorrow(overrides?: CallOverrides): Promise<BigNumber>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    trackingIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
    transfer(dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferAsset(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferAssetFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    userBasic(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IComet.UserBasicStructOutput>;
    withdraw(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawReserves(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawTo(to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        absorb(absorber: PromiseOrValue<string>, accounts: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        approveThis(manager: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        balanceOf(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseBorrowMin(overrides?: CallOverrides): Promise<BigNumber>;
        baseMinForRewards(overrides?: CallOverrides): Promise<BigNumber>;
        baseScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseToken(overrides?: CallOverrides): Promise<string>;
        baseTokenPriceFeed(overrides?: CallOverrides): Promise<string>;
        baseTrackingBorrowSpeed(overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingSupplySpeed(overrides?: CallOverrides): Promise<BigNumber>;
        borrowBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        borrowKink(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
        buyCollateral(asset: PromiseOrValue<string>, minAmount: PromiseOrValue<BigNumberish>, baseAmount: PromiseOrValue<BigNumberish>, recipient: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        decimals(overrides?: CallOverrides): Promise<number>;
        extensionDelegate(overrides?: CallOverrides): Promise<string>;
        getAssetInfo(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<AssetInfoStructOutput>;
        getAssetInfoByAddress(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<AssetInfoStructOutput>;
        getBorrowRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getPrice(priceFeed: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getReserves(overrides?: CallOverrides): Promise<BigNumber>;
        getSupplyRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getUtilization(overrides?: CallOverrides): Promise<BigNumber>;
        governor(overrides?: CallOverrides): Promise<string>;
        initializeStorage(overrides?: CallOverrides): Promise<void>;
        isAbsorbPaused(overrides?: CallOverrides): Promise<boolean>;
        isBorrowCollateralized(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        isBuyPaused(overrides?: CallOverrides): Promise<boolean>;
        isLiquidatable(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        isSupplyPaused(overrides?: CallOverrides): Promise<boolean>;
        isTransferPaused(overrides?: CallOverrides): Promise<boolean>;
        isWithdrawPaused(overrides?: CallOverrides): Promise<boolean>;
        numAssets(overrides?: CallOverrides): Promise<number>;
        pause(supplyPaused: PromiseOrValue<boolean>, transferPaused: PromiseOrValue<boolean>, withdrawPaused: PromiseOrValue<boolean>, absorbPaused: PromiseOrValue<boolean>, buyPaused: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<void>;
        pauseGuardian(overrides?: CallOverrides): Promise<string>;
        quoteCollateral(asset: PromiseOrValue<string>, baseAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        storeFrontPriceFactor(overrides?: CallOverrides): Promise<BigNumber>;
        supply(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        supplyFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        supplyKink(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
        supplyTo(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        targetReserves(overrides?: CallOverrides): Promise<BigNumber>;
        totalBorrow(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        trackingIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        transferAsset(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        transferAssetFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        transferFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        userBasic(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<IComet.UserBasicStructOutput>;
        withdraw(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawReserves(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawTo(to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "AbsorbCollateral(address,address,address,uint256,uint256)"(absorber?: PromiseOrValue<string> | null, borrower?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, collateralAbsorbed?: null, usdValue?: null): AbsorbCollateralEventFilter;
        AbsorbCollateral(absorber?: PromiseOrValue<string> | null, borrower?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, collateralAbsorbed?: null, usdValue?: null): AbsorbCollateralEventFilter;
        "AbsorbDebt(address,address,uint256,uint256)"(absorber?: PromiseOrValue<string> | null, borrower?: PromiseOrValue<string> | null, basePaidOut?: null, usdValue?: null): AbsorbDebtEventFilter;
        AbsorbDebt(absorber?: PromiseOrValue<string> | null, borrower?: PromiseOrValue<string> | null, basePaidOut?: null, usdValue?: null): AbsorbDebtEventFilter;
        "BuyCollateral(address,address,uint256,uint256)"(buyer?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, baseAmount?: null, collateralAmount?: null): BuyCollateralEventFilter;
        BuyCollateral(buyer?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, baseAmount?: null, collateralAmount?: null): BuyCollateralEventFilter;
        "PauseAction(bool,bool,bool,bool,bool)"(supplyPaused?: null, transferPaused?: null, withdrawPaused?: null, absorbPaused?: null, buyPaused?: null): PauseActionEventFilter;
        PauseAction(supplyPaused?: null, transferPaused?: null, withdrawPaused?: null, absorbPaused?: null, buyPaused?: null): PauseActionEventFilter;
        "Supply(address,address,uint256)"(from?: PromiseOrValue<string> | null, dst?: PromiseOrValue<string> | null, amount?: null): SupplyEventFilter;
        Supply(from?: PromiseOrValue<string> | null, dst?: PromiseOrValue<string> | null, amount?: null): SupplyEventFilter;
        "SupplyCollateral(address,address,address,uint256)"(from?: PromiseOrValue<string> | null, dst?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): SupplyCollateralEventFilter;
        SupplyCollateral(from?: PromiseOrValue<string> | null, dst?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): SupplyCollateralEventFilter;
        "Transfer(address,address,uint256)"(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, amount?: null): TransferEventFilter;
        Transfer(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, amount?: null): TransferEventFilter;
        "TransferCollateral(address,address,address,uint256)"(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): TransferCollateralEventFilter;
        TransferCollateral(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): TransferCollateralEventFilter;
        "Withdraw(address,address,uint256)"(src?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, amount?: null): WithdrawEventFilter;
        Withdraw(src?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, amount?: null): WithdrawEventFilter;
        "WithdrawCollateral(address,address,address,uint256)"(src?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): WithdrawCollateralEventFilter;
        WithdrawCollateral(src?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, asset?: PromiseOrValue<string> | null, amount?: null): WithdrawCollateralEventFilter;
        "WithdrawReserves(address,uint256)"(to?: PromiseOrValue<string> | null, amount?: null): WithdrawReservesEventFilter;
        WithdrawReserves(to?: PromiseOrValue<string> | null, amount?: null): WithdrawReservesEventFilter;
    };
    estimateGas: {
        absorb(absorber: PromiseOrValue<string>, accounts: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        approveThis(manager: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        balanceOf(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        baseBorrowMin(overrides?: CallOverrides): Promise<BigNumber>;
        baseMinForRewards(overrides?: CallOverrides): Promise<BigNumber>;
        baseScale(overrides?: CallOverrides): Promise<BigNumber>;
        baseToken(overrides?: CallOverrides): Promise<BigNumber>;
        baseTokenPriceFeed(overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingBorrowSpeed(overrides?: CallOverrides): Promise<BigNumber>;
        baseTrackingSupplySpeed(overrides?: CallOverrides): Promise<BigNumber>;
        borrowBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        borrowKink(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
        borrowPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
        buyCollateral(asset: PromiseOrValue<string>, minAmount: PromiseOrValue<BigNumberish>, baseAmount: PromiseOrValue<BigNumberish>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        extensionDelegate(overrides?: CallOverrides): Promise<BigNumber>;
        getAssetInfo(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getAssetInfoByAddress(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getBorrowRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getPrice(priceFeed: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getReserves(overrides?: CallOverrides): Promise<BigNumber>;
        getSupplyRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getUtilization(overrides?: CallOverrides): Promise<BigNumber>;
        governor(overrides?: CallOverrides): Promise<BigNumber>;
        initializeStorage(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        isAbsorbPaused(overrides?: CallOverrides): Promise<BigNumber>;
        isBorrowCollateralized(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isBuyPaused(overrides?: CallOverrides): Promise<BigNumber>;
        isLiquidatable(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isSupplyPaused(overrides?: CallOverrides): Promise<BigNumber>;
        isTransferPaused(overrides?: CallOverrides): Promise<BigNumber>;
        isWithdrawPaused(overrides?: CallOverrides): Promise<BigNumber>;
        numAssets(overrides?: CallOverrides): Promise<BigNumber>;
        pause(supplyPaused: PromiseOrValue<boolean>, transferPaused: PromiseOrValue<boolean>, withdrawPaused: PromiseOrValue<boolean>, absorbPaused: PromiseOrValue<boolean>, buyPaused: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        pauseGuardian(overrides?: CallOverrides): Promise<BigNumber>;
        quoteCollateral(asset: PromiseOrValue<string>, baseAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        storeFrontPriceFactor(overrides?: CallOverrides): Promise<BigNumber>;
        supply(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supplyFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supplyKink(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateBase(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<BigNumber>;
        supplyPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<BigNumber>;
        supplyTo(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        targetReserves(overrides?: CallOverrides): Promise<BigNumber>;
        totalBorrow(overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        trackingIndexScale(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferAsset(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferAssetFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        userBasic(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawReserves(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawTo(to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        absorb(absorber: PromiseOrValue<string>, accounts: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        accrueAccount(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        approveThis(manager: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseBorrowMin(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseMinForRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseTokenPriceFeed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseTrackingBorrowSpeed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        baseTrackingSupplySpeed(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        borrowBalanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        borrowKink(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        borrowPerSecondInterestRateBase(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        borrowPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        borrowPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        buyCollateral(asset: PromiseOrValue<string>, minAmount: PromiseOrValue<BigNumberish>, baseAmount: PromiseOrValue<BigNumberish>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        extensionDelegate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAssetInfo(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getAssetInfoByAddress(asset: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getBorrowRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getPrice(priceFeed: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getReserves(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSupplyRate(utilization: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getUtilization(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        governor(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initializeStorage(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        isAbsorbPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isBorrowCollateralized(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isBuyPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isLiquidatable(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isSupplyPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isTransferPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isWithdrawPaused(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        numAssets(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        pause(supplyPaused: PromiseOrValue<boolean>, transferPaused: PromiseOrValue<boolean>, withdrawPaused: PromiseOrValue<boolean>, absorbPaused: PromiseOrValue<boolean>, buyPaused: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        pauseGuardian(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        quoteCollateral(asset: PromiseOrValue<string>, baseAmount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        storeFrontPriceFactor(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supply(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supplyFrom(from: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supplyKink(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supplyPerSecondInterestRateBase(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supplyPerSecondInterestRateSlopeHigh(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supplyPerSecondInterestRateSlopeLow(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        supplyTo(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        targetReserves(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalBorrow(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        trackingIndexScale(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transfer(dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferAsset(dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferAssetFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferFrom(src: PromiseOrValue<string>, dst: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        userBasic(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawFrom(src: PromiseOrValue<string>, to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawReserves(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawTo(to: PromiseOrValue<string>, asset: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IComet.d.ts.map