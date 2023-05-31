import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IBoosterInterface extends utils.Interface {
    functions: {
        "FEE_DENOMINATOR()": FunctionFragment;
        "MaxFees()": FunctionFragment;
        "addPool(address,address,uint256)": FunctionFragment;
        "claimRewards(uint256,address)": FunctionFragment;
        "crv()": FunctionFragment;
        "deposit(uint256,uint256,bool)": FunctionFragment;
        "depositAll(uint256,bool)": FunctionFragment;
        "distributionAddressId()": FunctionFragment;
        "earmarkFees()": FunctionFragment;
        "earmarkIncentive()": FunctionFragment;
        "earmarkRewards(uint256)": FunctionFragment;
        "feeDistro()": FunctionFragment;
        "feeManager()": FunctionFragment;
        "feeToken()": FunctionFragment;
        "gaugeMap(address)": FunctionFragment;
        "isShutdown()": FunctionFragment;
        "lockFees()": FunctionFragment;
        "lockIncentive()": FunctionFragment;
        "lockRewards()": FunctionFragment;
        "minter()": FunctionFragment;
        "owner()": FunctionFragment;
        "platformFee()": FunctionFragment;
        "poolInfo(uint256)": FunctionFragment;
        "poolLength()": FunctionFragment;
        "poolManager()": FunctionFragment;
        "registry()": FunctionFragment;
        "rewardArbitrator()": FunctionFragment;
        "rewardClaimed(uint256,address,uint256)": FunctionFragment;
        "rewardFactory()": FunctionFragment;
        "setArbitrator(address)": FunctionFragment;
        "setFactories(address,address,address)": FunctionFragment;
        "setFeeInfo()": FunctionFragment;
        "setFeeManager(address)": FunctionFragment;
        "setFees(uint256,uint256,uint256,uint256)": FunctionFragment;
        "setGaugeRedirect(uint256)": FunctionFragment;
        "setOwner(address)": FunctionFragment;
        "setPoolManager(address)": FunctionFragment;
        "setRewardContracts(address,address)": FunctionFragment;
        "setTreasury(address)": FunctionFragment;
        "setVoteDelegate(address)": FunctionFragment;
        "shutdownPool(uint256)": FunctionFragment;
        "shutdownSystem()": FunctionFragment;
        "staker()": FunctionFragment;
        "stakerIncentive()": FunctionFragment;
        "stakerRewards()": FunctionFragment;
        "stashFactory()": FunctionFragment;
        "tokenFactory()": FunctionFragment;
        "treasury()": FunctionFragment;
        "vote(uint256,address,bool)": FunctionFragment;
        "voteDelegate()": FunctionFragment;
        "voteGaugeWeight(address[],uint256[])": FunctionFragment;
        "voteOwnership()": FunctionFragment;
        "voteParameter()": FunctionFragment;
        "withdraw(uint256,uint256)": FunctionFragment;
        "withdrawAll(uint256)": FunctionFragment;
        "withdrawTo(uint256,uint256,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "FEE_DENOMINATOR" | "MaxFees" | "addPool" | "claimRewards" | "crv" | "deposit" | "depositAll" | "distributionAddressId" | "earmarkFees" | "earmarkIncentive" | "earmarkRewards" | "feeDistro" | "feeManager" | "feeToken" | "gaugeMap" | "isShutdown" | "lockFees" | "lockIncentive" | "lockRewards" | "minter" | "owner" | "platformFee" | "poolInfo" | "poolLength" | "poolManager" | "registry" | "rewardArbitrator" | "rewardClaimed" | "rewardFactory" | "setArbitrator" | "setFactories" | "setFeeInfo" | "setFeeManager" | "setFees" | "setGaugeRedirect" | "setOwner" | "setPoolManager" | "setRewardContracts" | "setTreasury" | "setVoteDelegate" | "shutdownPool" | "shutdownSystem" | "staker" | "stakerIncentive" | "stakerRewards" | "stashFactory" | "tokenFactory" | "treasury" | "vote" | "voteDelegate" | "voteGaugeWeight" | "voteOwnership" | "voteParameter" | "withdraw" | "withdrawAll" | "withdrawTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "FEE_DENOMINATOR", values?: undefined): string;
    encodeFunctionData(functionFragment: "MaxFees", values?: undefined): string;
    encodeFunctionData(functionFragment: "addPool", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "claimRewards", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "crv", values?: undefined): string;
    encodeFunctionData(functionFragment: "deposit", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "depositAll", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "distributionAddressId", values?: undefined): string;
    encodeFunctionData(functionFragment: "earmarkFees", values?: undefined): string;
    encodeFunctionData(functionFragment: "earmarkIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "earmarkRewards", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "feeDistro", values?: undefined): string;
    encodeFunctionData(functionFragment: "feeManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "feeToken", values?: undefined): string;
    encodeFunctionData(functionFragment: "gaugeMap", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "isShutdown", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockFees", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "lockRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "minter", values?: undefined): string;
    encodeFunctionData(functionFragment: "owner", values?: undefined): string;
    encodeFunctionData(functionFragment: "platformFee", values?: undefined): string;
    encodeFunctionData(functionFragment: "poolInfo", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "poolLength", values?: undefined): string;
    encodeFunctionData(functionFragment: "poolManager", values?: undefined): string;
    encodeFunctionData(functionFragment: "registry", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardArbitrator", values?: undefined): string;
    encodeFunctionData(functionFragment: "rewardClaimed", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "rewardFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "setArbitrator", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setFactories", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "setFeeInfo", values?: undefined): string;
    encodeFunctionData(functionFragment: "setFeeManager", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setFees", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "setGaugeRedirect", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "setOwner", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setPoolManager", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setRewardContracts", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setTreasury", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "setVoteDelegate", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "shutdownPool", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "shutdownSystem", values?: undefined): string;
    encodeFunctionData(functionFragment: "staker", values?: undefined): string;
    encodeFunctionData(functionFragment: "stakerIncentive", values?: undefined): string;
    encodeFunctionData(functionFragment: "stakerRewards", values?: undefined): string;
    encodeFunctionData(functionFragment: "stashFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "tokenFactory", values?: undefined): string;
    encodeFunctionData(functionFragment: "treasury", values?: undefined): string;
    encodeFunctionData(functionFragment: "vote", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "voteDelegate", values?: undefined): string;
    encodeFunctionData(functionFragment: "voteGaugeWeight", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "voteOwnership", values?: undefined): string;
    encodeFunctionData(functionFragment: "voteParameter", values?: undefined): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawAll", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawTo", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "FEE_DENOMINATOR", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "MaxFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "crv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "distributionAddressId", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earmarkFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earmarkIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "earmarkRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeDistro", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "feeToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "gaugeMap", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isShutdown", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lockRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "minter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "platformFee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolLength", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "registry", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardArbitrator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardClaimed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rewardFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setArbitrator", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFactories", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFeeInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFeeManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFees", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setGaugeRedirect", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPoolManager", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setRewardContracts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setTreasury", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setVoteDelegate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "shutdownPool", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "shutdownSystem", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "staker", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakerIncentive", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stakerRewards", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "stashFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "tokenFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "treasury", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteDelegate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteGaugeWeight", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteOwnership", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "voteParameter", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;
    events: {
        "Deposited(address,uint256,uint256)": EventFragment;
        "Withdrawn(address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Deposited"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Withdrawn"): EventFragment;
}
export interface DepositedEventObject {
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
}
export type DepositedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], DepositedEventObject>;
export type DepositedEventFilter = TypedEventFilter<DepositedEvent>;
export interface WithdrawnEventObject {
    user: string;
    poolid: BigNumber;
    amount: BigNumber;
}
export type WithdrawnEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], WithdrawnEventObject>;
export type WithdrawnEventFilter = TypedEventFilter<WithdrawnEvent>;
export interface IBooster extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBoosterInterface;
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
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<[BigNumber]>;
        MaxFees(overrides?: CallOverrides): Promise<[BigNumber]>;
        addPool(_lptoken: PromiseOrValue<string>, _gauge: PromiseOrValue<string>, _stashVersion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        claimRewards(_pid: PromiseOrValue<BigNumberish>, _gauge: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        crv(overrides?: CallOverrides): Promise<[string]>;
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        distributionAddressId(overrides?: CallOverrides): Promise<[BigNumber]>;
        earmarkFees(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        earmarkIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        earmarkRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        feeDistro(overrides?: CallOverrides): Promise<[string]>;
        feeManager(overrides?: CallOverrides): Promise<[string]>;
        feeToken(overrides?: CallOverrides): Promise<[string]>;
        gaugeMap(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
        isShutdown(overrides?: CallOverrides): Promise<[boolean]>;
        lockFees(overrides?: CallOverrides): Promise<[string]>;
        lockIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        lockRewards(overrides?: CallOverrides): Promise<[string]>;
        minter(overrides?: CallOverrides): Promise<[string]>;
        owner(overrides?: CallOverrides): Promise<[string]>;
        platformFee(overrides?: CallOverrides): Promise<[BigNumber]>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string,
            string,
            string,
            string,
            string,
            boolean
        ] & {
            lptoken: string;
            token: string;
            gauge: string;
            crvRewards: string;
            stash: string;
            shutdown: boolean;
        }>;
        poolLength(overrides?: CallOverrides): Promise<[BigNumber]>;
        poolManager(overrides?: CallOverrides): Promise<[string]>;
        registry(overrides?: CallOverrides): Promise<[string]>;
        rewardArbitrator(overrides?: CallOverrides): Promise<[string]>;
        rewardClaimed(_pid: PromiseOrValue<BigNumberish>, _address: PromiseOrValue<string>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rewardFactory(overrides?: CallOverrides): Promise<[string]>;
        setArbitrator(_arb: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setFactories(_rfactory: PromiseOrValue<string>, _sfactory: PromiseOrValue<string>, _tfactory: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setFeeInfo(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setFeeManager(_feeM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setFees(_lockFees: PromiseOrValue<BigNumberish>, _stakerFees: PromiseOrValue<BigNumberish>, _callerFees: PromiseOrValue<BigNumberish>, _platform: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setGaugeRedirect(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPoolManager(_poolM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setRewardContracts(_rewards: PromiseOrValue<string>, _stakerRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setTreasury(_treasury: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setVoteDelegate(_voteDelegate: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        shutdownPool(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        shutdownSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        staker(overrides?: CallOverrides): Promise<[string]>;
        stakerIncentive(overrides?: CallOverrides): Promise<[BigNumber]>;
        stakerRewards(overrides?: CallOverrides): Promise<[string]>;
        stashFactory(overrides?: CallOverrides): Promise<[string]>;
        tokenFactory(overrides?: CallOverrides): Promise<[string]>;
        treasury(overrides?: CallOverrides): Promise<[string]>;
        vote(_voteId: PromiseOrValue<BigNumberish>, _votingAddress: PromiseOrValue<string>, _support: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        voteDelegate(overrides?: CallOverrides): Promise<[string]>;
        voteGaugeWeight(_gauge: PromiseOrValue<string>[], _weight: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        voteOwnership(overrides?: CallOverrides): Promise<[string]>;
        voteParameter(overrides?: CallOverrides): Promise<[string]>;
        withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
    MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
    addPool(_lptoken: PromiseOrValue<string>, _gauge: PromiseOrValue<string>, _stashVersion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    claimRewards(_pid: PromiseOrValue<BigNumberish>, _gauge: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    crv(overrides?: CallOverrides): Promise<string>;
    deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
    earmarkFees(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    earmarkRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    feeDistro(overrides?: CallOverrides): Promise<string>;
    feeManager(overrides?: CallOverrides): Promise<string>;
    feeToken(overrides?: CallOverrides): Promise<string>;
    gaugeMap(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    isShutdown(overrides?: CallOverrides): Promise<boolean>;
    lockFees(overrides?: CallOverrides): Promise<string>;
    lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    lockRewards(overrides?: CallOverrides): Promise<string>;
    minter(overrides?: CallOverrides): Promise<string>;
    owner(overrides?: CallOverrides): Promise<string>;
    platformFee(overrides?: CallOverrides): Promise<BigNumber>;
    poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
        string,
        string,
        string,
        string,
        string,
        boolean
    ] & {
        lptoken: string;
        token: string;
        gauge: string;
        crvRewards: string;
        stash: string;
        shutdown: boolean;
    }>;
    poolLength(overrides?: CallOverrides): Promise<BigNumber>;
    poolManager(overrides?: CallOverrides): Promise<string>;
    registry(overrides?: CallOverrides): Promise<string>;
    rewardArbitrator(overrides?: CallOverrides): Promise<string>;
    rewardClaimed(_pid: PromiseOrValue<BigNumberish>, _address: PromiseOrValue<string>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rewardFactory(overrides?: CallOverrides): Promise<string>;
    setArbitrator(_arb: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setFactories(_rfactory: PromiseOrValue<string>, _sfactory: PromiseOrValue<string>, _tfactory: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setFeeInfo(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setFeeManager(_feeM: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setFees(_lockFees: PromiseOrValue<BigNumberish>, _stakerFees: PromiseOrValue<BigNumberish>, _callerFees: PromiseOrValue<BigNumberish>, _platform: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setGaugeRedirect(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPoolManager(_poolM: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setRewardContracts(_rewards: PromiseOrValue<string>, _stakerRewards: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setTreasury(_treasury: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setVoteDelegate(_voteDelegate: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    shutdownPool(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    shutdownSystem(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    staker(overrides?: CallOverrides): Promise<string>;
    stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
    stakerRewards(overrides?: CallOverrides): Promise<string>;
    stashFactory(overrides?: CallOverrides): Promise<string>;
    tokenFactory(overrides?: CallOverrides): Promise<string>;
    treasury(overrides?: CallOverrides): Promise<string>;
    vote(_voteId: PromiseOrValue<BigNumberish>, _votingAddress: PromiseOrValue<string>, _support: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    voteDelegate(overrides?: CallOverrides): Promise<string>;
    voteGaugeWeight(_gauge: PromiseOrValue<string>[], _weight: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    voteOwnership(overrides?: CallOverrides): Promise<string>;
    voteParameter(overrides?: CallOverrides): Promise<string>;
    withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
        MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
        addPool(_lptoken: PromiseOrValue<string>, _gauge: PromiseOrValue<string>, _stashVersion: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        claimRewards(_pid: PromiseOrValue<BigNumberish>, _gauge: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        crv(overrides?: CallOverrides): Promise<string>;
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<boolean>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<boolean>;
        distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkFees(overrides?: CallOverrides): Promise<boolean>;
        earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        feeDistro(overrides?: CallOverrides): Promise<string>;
        feeManager(overrides?: CallOverrides): Promise<string>;
        feeToken(overrides?: CallOverrides): Promise<string>;
        gaugeMap(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
        isShutdown(overrides?: CallOverrides): Promise<boolean>;
        lockFees(overrides?: CallOverrides): Promise<string>;
        lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        lockRewards(overrides?: CallOverrides): Promise<string>;
        minter(overrides?: CallOverrides): Promise<string>;
        owner(overrides?: CallOverrides): Promise<string>;
        platformFee(overrides?: CallOverrides): Promise<BigNumber>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string,
            string,
            string,
            string,
            string,
            boolean
        ] & {
            lptoken: string;
            token: string;
            gauge: string;
            crvRewards: string;
            stash: string;
            shutdown: boolean;
        }>;
        poolLength(overrides?: CallOverrides): Promise<BigNumber>;
        poolManager(overrides?: CallOverrides): Promise<string>;
        registry(overrides?: CallOverrides): Promise<string>;
        rewardArbitrator(overrides?: CallOverrides): Promise<string>;
        rewardClaimed(_pid: PromiseOrValue<BigNumberish>, _address: PromiseOrValue<string>, _amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        rewardFactory(overrides?: CallOverrides): Promise<string>;
        setArbitrator(_arb: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setFactories(_rfactory: PromiseOrValue<string>, _sfactory: PromiseOrValue<string>, _tfactory: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setFeeInfo(overrides?: CallOverrides): Promise<void>;
        setFeeManager(_feeM: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setFees(_lockFees: PromiseOrValue<BigNumberish>, _stakerFees: PromiseOrValue<BigNumberish>, _callerFees: PromiseOrValue<BigNumberish>, _platform: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        setGaugeRedirect(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        setOwner(_owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setPoolManager(_poolM: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setRewardContracts(_rewards: PromiseOrValue<string>, _stakerRewards: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setTreasury(_treasury: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        setVoteDelegate(_voteDelegate: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        shutdownPool(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        shutdownSystem(overrides?: CallOverrides): Promise<void>;
        staker(overrides?: CallOverrides): Promise<string>;
        stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        stakerRewards(overrides?: CallOverrides): Promise<string>;
        stashFactory(overrides?: CallOverrides): Promise<string>;
        tokenFactory(overrides?: CallOverrides): Promise<string>;
        treasury(overrides?: CallOverrides): Promise<string>;
        vote(_voteId: PromiseOrValue<BigNumberish>, _votingAddress: PromiseOrValue<string>, _support: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<boolean>;
        voteDelegate(overrides?: CallOverrides): Promise<string>;
        voteGaugeWeight(_gauge: PromiseOrValue<string>[], _weight: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<boolean>;
        voteOwnership(overrides?: CallOverrides): Promise<string>;
        voteParameter(overrides?: CallOverrides): Promise<string>;
        withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "Deposited(address,uint256,uint256)"(user?: PromiseOrValue<string> | null, poolid?: PromiseOrValue<BigNumberish> | null, amount?: null): DepositedEventFilter;
        Deposited(user?: PromiseOrValue<string> | null, poolid?: PromiseOrValue<BigNumberish> | null, amount?: null): DepositedEventFilter;
        "Withdrawn(address,uint256,uint256)"(user?: PromiseOrValue<string> | null, poolid?: PromiseOrValue<BigNumberish> | null, amount?: null): WithdrawnEventFilter;
        Withdrawn(user?: PromiseOrValue<string> | null, poolid?: PromiseOrValue<BigNumberish> | null, amount?: null): WithdrawnEventFilter;
    };
    estimateGas: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<BigNumber>;
        MaxFees(overrides?: CallOverrides): Promise<BigNumber>;
        addPool(_lptoken: PromiseOrValue<string>, _gauge: PromiseOrValue<string>, _stashVersion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        claimRewards(_pid: PromiseOrValue<BigNumberish>, _gauge: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        crv(overrides?: CallOverrides): Promise<BigNumber>;
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        distributionAddressId(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkFees(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        earmarkIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        earmarkRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        feeDistro(overrides?: CallOverrides): Promise<BigNumber>;
        feeManager(overrides?: CallOverrides): Promise<BigNumber>;
        feeToken(overrides?: CallOverrides): Promise<BigNumber>;
        gaugeMap(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        isShutdown(overrides?: CallOverrides): Promise<BigNumber>;
        lockFees(overrides?: CallOverrides): Promise<BigNumber>;
        lockIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        lockRewards(overrides?: CallOverrides): Promise<BigNumber>;
        minter(overrides?: CallOverrides): Promise<BigNumber>;
        owner(overrides?: CallOverrides): Promise<BigNumber>;
        platformFee(overrides?: CallOverrides): Promise<BigNumber>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        poolLength(overrides?: CallOverrides): Promise<BigNumber>;
        poolManager(overrides?: CallOverrides): Promise<BigNumber>;
        registry(overrides?: CallOverrides): Promise<BigNumber>;
        rewardArbitrator(overrides?: CallOverrides): Promise<BigNumber>;
        rewardClaimed(_pid: PromiseOrValue<BigNumberish>, _address: PromiseOrValue<string>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rewardFactory(overrides?: CallOverrides): Promise<BigNumber>;
        setArbitrator(_arb: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setFactories(_rfactory: PromiseOrValue<string>, _sfactory: PromiseOrValue<string>, _tfactory: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setFeeInfo(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setFeeManager(_feeM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setFees(_lockFees: PromiseOrValue<BigNumberish>, _stakerFees: PromiseOrValue<BigNumberish>, _callerFees: PromiseOrValue<BigNumberish>, _platform: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setGaugeRedirect(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPoolManager(_poolM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setRewardContracts(_rewards: PromiseOrValue<string>, _stakerRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setTreasury(_treasury: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setVoteDelegate(_voteDelegate: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        shutdownPool(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        shutdownSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        staker(overrides?: CallOverrides): Promise<BigNumber>;
        stakerIncentive(overrides?: CallOverrides): Promise<BigNumber>;
        stakerRewards(overrides?: CallOverrides): Promise<BigNumber>;
        stashFactory(overrides?: CallOverrides): Promise<BigNumber>;
        tokenFactory(overrides?: CallOverrides): Promise<BigNumber>;
        treasury(overrides?: CallOverrides): Promise<BigNumber>;
        vote(_voteId: PromiseOrValue<BigNumberish>, _votingAddress: PromiseOrValue<string>, _support: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        voteDelegate(overrides?: CallOverrides): Promise<BigNumber>;
        voteGaugeWeight(_gauge: PromiseOrValue<string>[], _weight: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        voteOwnership(overrides?: CallOverrides): Promise<BigNumber>;
        voteParameter(overrides?: CallOverrides): Promise<BigNumber>;
        withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        FEE_DENOMINATOR(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        MaxFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        addPool(_lptoken: PromiseOrValue<string>, _gauge: PromiseOrValue<string>, _stashVersion: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        claimRewards(_pid: PromiseOrValue<BigNumberish>, _gauge: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        crv(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        distributionAddressId(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        earmarkFees(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        earmarkIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        earmarkRewards(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        feeDistro(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        feeManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        feeToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        gaugeMap(arg0: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isShutdown(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockFees(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lockRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        minter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        platformFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolLength(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        poolManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        registry(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardArbitrator(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        rewardClaimed(_pid: PromiseOrValue<BigNumberish>, _address: PromiseOrValue<string>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rewardFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setArbitrator(_arb: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setFactories(_rfactory: PromiseOrValue<string>, _sfactory: PromiseOrValue<string>, _tfactory: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setFeeInfo(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setFeeManager(_feeM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setFees(_lockFees: PromiseOrValue<BigNumberish>, _stakerFees: PromiseOrValue<BigNumberish>, _callerFees: PromiseOrValue<BigNumberish>, _platform: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setGaugeRedirect(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setOwner(_owner: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPoolManager(_poolM: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setRewardContracts(_rewards: PromiseOrValue<string>, _stakerRewards: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setTreasury(_treasury: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setVoteDelegate(_voteDelegate: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        shutdownPool(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        shutdownSystem(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        staker(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stakerIncentive(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stakerRewards(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        stashFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        tokenFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        treasury(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        vote(_voteId: PromiseOrValue<BigNumberish>, _votingAddress: PromiseOrValue<string>, _support: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        voteDelegate(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        voteGaugeWeight(_gauge: PromiseOrValue<string>[], _weight: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        voteOwnership(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        voteParameter(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IBooster.d.ts.map