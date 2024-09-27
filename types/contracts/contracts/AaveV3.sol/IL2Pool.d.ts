import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IL2PoolInterface extends utils.Interface {
    functions: {
        "borrow(bytes32)": FunctionFragment;
        "liquidationCall(bytes32,bytes32)": FunctionFragment;
        "rebalanceStableBorrowRate(bytes32)": FunctionFragment;
        "repay(bytes32)": FunctionFragment;
        "repayWithATokens(bytes32)": FunctionFragment;
        "repayWithPermit(bytes32,bytes32,bytes32)": FunctionFragment;
        "setUserUseReserveAsCollateral(bytes32)": FunctionFragment;
        "supply(bytes32)": FunctionFragment;
        "supplyWithPermit(bytes32,bytes32,bytes32)": FunctionFragment;
        "swapBorrowRateMode(bytes32)": FunctionFragment;
        "withdraw(bytes32)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "borrow" | "liquidationCall" | "rebalanceStableBorrowRate" | "repay" | "repayWithATokens" | "repayWithPermit" | "setUserUseReserveAsCollateral" | "supply" | "supplyWithPermit" | "swapBorrowRateMode" | "withdraw"): FunctionFragment;
    encodeFunctionData(functionFragment: "borrow", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "liquidationCall", values: [PromiseOrValue<BytesLike>, PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "rebalanceStableBorrowRate", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "repay", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "repayWithATokens", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "repayWithPermit", values: [
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "setUserUseReserveAsCollateral", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "supply", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "supplyWithPermit", values: [
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "swapBorrowRateMode", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "withdraw", values: [PromiseOrValue<BytesLike>]): string;
    decodeFunctionResult(functionFragment: "borrow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "liquidationCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rebalanceStableBorrowRate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "repay", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "repayWithATokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "repayWithPermit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setUserUseReserveAsCollateral", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supply", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "supplyWithPermit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapBorrowRateMode", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
    events: {};
}
export interface IL2Pool extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IL2PoolInterface;
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
        borrow(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        liquidationCall(args1: PromiseOrValue<BytesLike>, args2: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rebalanceStableBorrowRate(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        repay(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        repayWithATokens(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        repayWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setUserUseReserveAsCollateral(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supply(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        supplyWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        swapBorrowRateMode(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        withdraw(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    borrow(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    liquidationCall(args1: PromiseOrValue<BytesLike>, args2: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rebalanceStableBorrowRate(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    repay(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    repayWithATokens(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    repayWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setUserUseReserveAsCollateral(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supply(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    supplyWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    swapBorrowRateMode(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    withdraw(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        borrow(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        liquidationCall(args1: PromiseOrValue<BytesLike>, args2: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        rebalanceStableBorrowRate(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        repay(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        repayWithATokens(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        repayWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        setUserUseReserveAsCollateral(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        supply(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        supplyWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        swapBorrowRateMode(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        withdraw(args: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        borrow(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        liquidationCall(args1: PromiseOrValue<BytesLike>, args2: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rebalanceStableBorrowRate(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        repay(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        repayWithATokens(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        repayWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setUserUseReserveAsCollateral(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supply(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        supplyWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        swapBorrowRateMode(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        withdraw(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        borrow(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        liquidationCall(args1: PromiseOrValue<BytesLike>, args2: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rebalanceStableBorrowRate(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        repay(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        repayWithATokens(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        repayWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setUserUseReserveAsCollateral(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supply(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        supplyWithPermit(args: PromiseOrValue<BytesLike>, r: PromiseOrValue<BytesLike>, s: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        swapBorrowRateMode(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        withdraw(args: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IL2Pool.d.ts.map