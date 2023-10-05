import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IBoosterInterface extends utils.Interface {
    functions: {
        "deposit(uint256,uint256,bool)": FunctionFragment;
        "depositAll(uint256,bool)": FunctionFragment;
        "poolInfo(uint256)": FunctionFragment;
        "withdraw(uint256,uint256)": FunctionFragment;
        "withdrawAll(uint256)": FunctionFragment;
        "withdrawTo(uint256,uint256,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "deposit" | "depositAll" | "poolInfo" | "withdraw" | "withdrawAll" | "withdrawTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "deposit", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    encodeFunctionData(functionFragment: "depositAll", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "poolInfo", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawAll", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "withdrawTo", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "depositAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawAll", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdrawTo", data: BytesLike): Result;
    events: {};
}
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
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
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
    deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
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
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<boolean>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<boolean>;
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
        withdraw(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        withdrawAll(_pid: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        withdrawTo(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
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
        deposit(_pid: PromiseOrValue<BigNumberish>, _amount: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        depositAll(_pid: PromiseOrValue<BigNumberish>, _stake: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
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