import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ConvexStakingWrapperInterface extends utils.Interface {
    functions: {
        "allowance(address,address)": FunctionFragment;
        "approve(address,uint256)": FunctionFragment;
        "balanceOf(address)": FunctionFragment;
        "collateralVault()": FunctionFragment;
        "convexBooster()": FunctionFragment;
        "convexPool()": FunctionFragment;
        "convexPoolId()": FunctionFragment;
        "convexToken()": FunctionFragment;
        "crv()": FunctionFragment;
        "curveToken()": FunctionFragment;
        "cvx()": FunctionFragment;
        "decimals()": FunctionFragment;
        "deposit(uint256,address)": FunctionFragment;
        "name()": FunctionFragment;
        "stake(uint256,address)": FunctionFragment;
        "symbol()": FunctionFragment;
        "totalBalanceOf(address)": FunctionFragment;
        "totalSupply()": FunctionFragment;
        "transfer(address,uint256)": FunctionFragment;
        "transferFrom(address,address,uint256)": FunctionFragment;
        "withdraw(uint256)": FunctionFragment;
        "withdrawAndUnwrap(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "allowance" | "approve" | "balanceOf" | "collateralVault" | "convexBooster" | "convexPool" | "convexPoolId" | "convexToken" | "crv" | "curveToken" | "cvx" | "decimals" | "deposit" | "name" | "stake" | "symbol" | "totalBalanceOf" | "totalSupply" | "transfer" | "transferFrom" | "withdraw" | "withdrawAndUnwrap"): FunctionFragment;
    encodeFunctionData(functionFragment: "allowance", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "approve", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "balanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "collateralVault", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexBooster", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexPool", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexPoolId", values?: undefined): string;
    encodeFunctionData(functionFragment: "convexToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "crv", values?: undefined): string;
    encodeFunctionData(functionFragment: "curveToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "cvx", values?: undefined): string;
    encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "name", values?: undefined): string;
    encodeFunctionData(functionFragment: "stake", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
    encodeFunctionData(functionFragment: "totalBalanceOf", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "totalSupply", values?: undefined): string;
    encodeFunctionData(functionFragment: "transfer", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "transferFrom", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawAndUnwrap", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "allowance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "collateralVault", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexBooster", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexPoolId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "convexToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "crv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "curveToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cvx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stake", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalBalanceOf", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "totalSupply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAndUnwrap", data: BytesLike): Result;
    events: {
        "Approval(address,address,uint256)": EventFragment;
        "Deposited(address,address,uint256,bool)": EventFragment;
        "RewardAdded(address)": EventFragment;
        "RewardRedirected(address,address)": EventFragment;
        "RewardsClaimed(address,uint256)": EventFragment;
        "Transfer(address,address,uint256)": EventFragment;
        "UserCheckpoint(address,address)": EventFragment;
        "Withdrawn(address,uint256,bool)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Approval"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Deposited"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RewardAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RewardRedirected"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RewardsClaimed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Transfer"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "UserCheckpoint"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Withdrawn"): EventFragment;
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
export interface DepositedEventObject {
    _user: string;
    _account: string;
    _amount: BigNumber;
    _wrapped: boolean;
}
export type DepositedEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    boolean
], DepositedEventObject>;
export type DepositedEventFilter = TypedEventFilter<DepositedEvent>;
export interface RewardAddedEventObject {
    _token: string;
}
export type RewardAddedEvent = TypedEvent<[string], RewardAddedEventObject>;
export type RewardAddedEventFilter = TypedEventFilter<RewardAddedEvent>;
export interface RewardRedirectedEventObject {
    _account: string;
    _forward: string;
}
export type RewardRedirectedEvent = TypedEvent<[
    string,
    string
], RewardRedirectedEventObject>;
export type RewardRedirectedEventFilter = TypedEventFilter<RewardRedirectedEvent>;
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
export interface UserCheckpointEventObject {
    _userA: string;
    _userB: string;
}
export type UserCheckpointEvent = TypedEvent<[
    string,
    string
], UserCheckpointEventObject>;
export type UserCheckpointEventFilter = TypedEventFilter<UserCheckpointEvent>;
export interface WithdrawnEventObject {
    _user: string;
    _amount: BigNumber;
    _unwrapped: boolean;
}
export type WithdrawnEvent = TypedEvent<[
    string,
    BigNumber,
    boolean
], WithdrawnEventObject>;
export type WithdrawnEventFilter = TypedEventFilter<WithdrawnEvent>;
export interface ConvexStakingWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ConvexStakingWrapperInterface;
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
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        collateralVault(overrides?: CallOverrides): Promise<[string]>;
        convexBooster(overrides?: CallOverrides): Promise<[string]>;
        convexPool(overrides?: CallOverrides): Promise<[string]>;
        convexPoolId(overrides?: CallOverrides): Promise<[BigNumber]>;
        convexToken(overrides?: CallOverrides): Promise<[string]>;
        crv(overrides?: CallOverrides): Promise<[string]>;
        curveToken(overrides?: CallOverrides): Promise<[string]>;
        cvx(overrides?: CallOverrides): Promise<[string]>;
        decimals(overrides?: CallOverrides): Promise<[number]>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        name(overrides?: CallOverrides): Promise<[string]>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        symbol(overrides?: CallOverrides): Promise<[string]>;
        totalBalanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    collateralVault(overrides?: CallOverrides): Promise<string>;
    convexBooster(overrides?: CallOverrides): Promise<string>;
    convexPool(overrides?: CallOverrides): Promise<string>;
    convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
    convexToken(overrides?: CallOverrides): Promise<string>;
    crv(overrides?: CallOverrides): Promise<string>;
    curveToken(overrides?: CallOverrides): Promise<string>;
    cvx(overrides?: CallOverrides): Promise<string>;
    decimals(overrides?: CallOverrides): Promise<number>;
    deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    name(overrides?: CallOverrides): Promise<string>;
    stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    symbol(overrides?: CallOverrides): Promise<string>;
    totalBalanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
    transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        collateralVault(overrides?: CallOverrides): Promise<string>;
        convexBooster(overrides?: CallOverrides): Promise<string>;
        convexPool(overrides?: CallOverrides): Promise<string>;
        convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
        convexToken(overrides?: CallOverrides): Promise<string>;
        crv(overrides?: CallOverrides): Promise<string>;
        curveToken(overrides?: CallOverrides): Promise<string>;
        cvx(overrides?: CallOverrides): Promise<string>;
        decimals(overrides?: CallOverrides): Promise<number>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        name(overrides?: CallOverrides): Promise<string>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        symbol(overrides?: CallOverrides): Promise<string>;
        totalBalanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "Approval(address,address,uint256)"(owner?: PromiseOrValue<string> | null, spender?: PromiseOrValue<string> | null, value?: null): ApprovalEventFilter;
        Approval(owner?: PromiseOrValue<string> | null, spender?: PromiseOrValue<string> | null, value?: null): ApprovalEventFilter;
        "Deposited(address,address,uint256,bool)"(_user?: PromiseOrValue<string> | null, _account?: PromiseOrValue<string> | null, _amount?: null, _wrapped?: null): DepositedEventFilter;
        Deposited(_user?: PromiseOrValue<string> | null, _account?: PromiseOrValue<string> | null, _amount?: null, _wrapped?: null): DepositedEventFilter;
        "RewardAdded(address)"(_token?: null): RewardAddedEventFilter;
        RewardAdded(_token?: null): RewardAddedEventFilter;
        "RewardRedirected(address,address)"(_account?: PromiseOrValue<string> | null, _forward?: null): RewardRedirectedEventFilter;
        RewardRedirected(_account?: PromiseOrValue<string> | null, _forward?: null): RewardRedirectedEventFilter;
        "RewardsClaimed(address,uint256)"(erc20?: PromiseOrValue<string> | null, amount?: PromiseOrValue<BigNumberish> | null): RewardsClaimedEventFilter;
        RewardsClaimed(erc20?: PromiseOrValue<string> | null, amount?: PromiseOrValue<BigNumberish> | null): RewardsClaimedEventFilter;
        "Transfer(address,address,uint256)"(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, value?: null): TransferEventFilter;
        Transfer(from?: PromiseOrValue<string> | null, to?: PromiseOrValue<string> | null, value?: null): TransferEventFilter;
        "UserCheckpoint(address,address)"(_userA?: null, _userB?: null): UserCheckpointEventFilter;
        UserCheckpoint(_userA?: null, _userB?: null): UserCheckpointEventFilter;
        "Withdrawn(address,uint256,bool)"(_user?: PromiseOrValue<string> | null, _amount?: null, _unwrapped?: null): WithdrawnEventFilter;
        Withdrawn(_user?: PromiseOrValue<string> | null, _amount?: null, _unwrapped?: null): WithdrawnEventFilter;
    };
    estimateGas: {
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        collateralVault(overrides?: CallOverrides): Promise<BigNumber>;
        convexBooster(overrides?: CallOverrides): Promise<BigNumber>;
        convexPool(overrides?: CallOverrides): Promise<BigNumber>;
        convexPoolId(overrides?: CallOverrides): Promise<BigNumber>;
        convexToken(overrides?: CallOverrides): Promise<BigNumber>;
        crv(overrides?: CallOverrides): Promise<BigNumber>;
        curveToken(overrides?: CallOverrides): Promise<BigNumber>;
        cvx(overrides?: CallOverrides): Promise<BigNumber>;
        decimals(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        name(overrides?: CallOverrides): Promise<BigNumber>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        symbol(overrides?: CallOverrides): Promise<BigNumber>;
        totalBalanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        allowance(owner: PromiseOrValue<string>, spender: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        approve(spender: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        balanceOf(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        collateralVault(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexBooster(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexPoolId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        convexToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        crv(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        curveToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        cvx(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        name(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stake(_amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalBalanceOf(_account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        transfer(to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        transferFrom(from: PromiseOrValue<string>, to: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdraw(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAndUnwrap(_amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}