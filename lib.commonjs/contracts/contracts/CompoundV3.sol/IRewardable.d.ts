import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IRewardableInterface extends utils.Interface {
    functions: {
        "claimRewards()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "claimRewards"): FunctionFragment;
    encodeFunctionData(functionFragment: "claimRewards", values?: undefined): string;
    decodeFunctionResult(functionFragment: "claimRewards", data: BytesLike): Result;
    events: {
        "RewardsClaimed(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "RewardsClaimed"): EventFragment;
}
export interface RewardsClaimedEventObject {
    erc20: string;
    amount: BigNumber;
}
export type RewardsClaimedEvent = TypedEvent<[
    string,
    BigNumber
], RewardsClaimedEventObject>;
export type RewardsClaimedEventFilter = TypedEventFilter<RewardsClaimedEvent>;
export interface IRewardable extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IRewardableInterface;
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
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    claimRewards(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        claimRewards(overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "RewardsClaimed(address,uint256)"(erc20?: PromiseOrValue<string> | null, amount?: null): RewardsClaimedEventFilter;
        RewardsClaimed(erc20?: PromiseOrValue<string> | null, amount?: null): RewardsClaimedEventFilter;
    };
    estimateGas: {
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        claimRewards(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
