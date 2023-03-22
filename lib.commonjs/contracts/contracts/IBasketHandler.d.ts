import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export type BasketRangeStruct = {
    bottom: PromiseOrValue<BigNumberish>;
    top: PromiseOrValue<BigNumberish>;
};
export type BasketRangeStructOutput = [BigNumber, BigNumber] & {
    bottom: BigNumber;
    top: BigNumber;
};
export interface IBasketHandlerInterface extends utils.Interface {
    functions: {
        "basketsHeldBy(address)": FunctionFragment;
        "disableBasket()": FunctionFragment;
        "fullyCollateralized()": FunctionFragment;
        "lotPrice()": FunctionFragment;
        "nonce()": FunctionFragment;
        "price()": FunctionFragment;
        "quantity(address)": FunctionFragment;
        "quote(uint192,uint8)": FunctionFragment;
        "refreshBasket()": FunctionFragment;
        "setBackupConfig(bytes32,uint256,address[])": FunctionFragment;
        "setPrimeBasket(address[],uint192[])": FunctionFragment;
        "status()": FunctionFragment;
        "timestamp()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "basketsHeldBy" | "disableBasket" | "fullyCollateralized" | "lotPrice" | "nonce" | "price" | "quantity" | "quote" | "refreshBasket" | "setBackupConfig" | "setPrimeBasket" | "status" | "timestamp"): FunctionFragment;
    encodeFunctionData(functionFragment: "basketsHeldBy", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "disableBasket", values?: undefined): string;
    encodeFunctionData(functionFragment: "fullyCollateralized", values?: undefined): string;
    encodeFunctionData(functionFragment: "lotPrice", values?: undefined): string;
    encodeFunctionData(functionFragment: "nonce", values?: undefined): string;
    encodeFunctionData(functionFragment: "price", values?: undefined): string;
    encodeFunctionData(functionFragment: "quantity", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "quote", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "refreshBasket", values?: undefined): string;
    encodeFunctionData(functionFragment: "setBackupConfig", values: [
        PromiseOrValue<BytesLike>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>[]
    ]): string;
    encodeFunctionData(functionFragment: "setPrimeBasket", values: [PromiseOrValue<string>[], PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "status", values?: undefined): string;
    encodeFunctionData(functionFragment: "timestamp", values?: undefined): string;
    decodeFunctionResult(functionFragment: "basketsHeldBy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "disableBasket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fullyCollateralized", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lotPrice", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "quantity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "quote", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "refreshBasket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setBackupConfig", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setPrimeBasket", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "status", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "timestamp", data: BytesLike): Result;
    events: {};
}
export interface IBasketHandler extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBasketHandlerInterface;
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
        basketsHeldBy(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BasketRangeStructOutput]>;
        disableBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        fullyCollateralized(overrides?: CallOverrides): Promise<[boolean]>;
        lotPrice(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            lotLow: BigNumber;
            lotHigh: BigNumber;
        }>;
        nonce(overrides?: CallOverrides): Promise<[number]>;
        price(overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            low: BigNumber;
            high: BigNumber;
        }>;
        quantity(erc20: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[]
        ] & {
            erc20s: string[];
            quantities: BigNumber[];
        }>;
        refreshBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setBackupConfig(targetName: PromiseOrValue<BytesLike>, max: PromiseOrValue<BigNumberish>, erc20s: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setPrimeBasket(erc20s: PromiseOrValue<string>[], targetAmts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        status(overrides?: CallOverrides): Promise<[number] & {
            status: number;
        }>;
        timestamp(overrides?: CallOverrides): Promise<[number]>;
    };
    basketsHeldBy(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BasketRangeStructOutput>;
    disableBasket(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    fullyCollateralized(overrides?: CallOverrides): Promise<boolean>;
    lotPrice(overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber
    ] & {
        lotLow: BigNumber;
        lotHigh: BigNumber;
    }>;
    nonce(overrides?: CallOverrides): Promise<number>;
    price(overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
        low: BigNumber;
        high: BigNumber;
    }>;
    quantity(erc20: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
        string[],
        BigNumber[]
    ] & {
        erc20s: string[];
        quantities: BigNumber[];
    }>;
    refreshBasket(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setBackupConfig(targetName: PromiseOrValue<BytesLike>, max: PromiseOrValue<BigNumberish>, erc20s: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setPrimeBasket(erc20s: PromiseOrValue<string>[], targetAmts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    status(overrides?: CallOverrides): Promise<number>;
    timestamp(overrides?: CallOverrides): Promise<number>;
    callStatic: {
        basketsHeldBy(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BasketRangeStructOutput>;
        disableBasket(overrides?: CallOverrides): Promise<void>;
        fullyCollateralized(overrides?: CallOverrides): Promise<boolean>;
        lotPrice(overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber
        ] & {
            lotLow: BigNumber;
            lotHigh: BigNumber;
        }>;
        nonce(overrides?: CallOverrides): Promise<number>;
        price(overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            low: BigNumber;
            high: BigNumber;
        }>;
        quantity(erc20: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[]
        ] & {
            erc20s: string[];
            quantities: BigNumber[];
        }>;
        refreshBasket(overrides?: CallOverrides): Promise<void>;
        setBackupConfig(targetName: PromiseOrValue<BytesLike>, max: PromiseOrValue<BigNumberish>, erc20s: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
        setPrimeBasket(erc20s: PromiseOrValue<string>[], targetAmts: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<void>;
        status(overrides?: CallOverrides): Promise<number>;
        timestamp(overrides?: CallOverrides): Promise<number>;
    };
    filters: {};
    estimateGas: {
        basketsHeldBy(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        disableBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        fullyCollateralized(overrides?: CallOverrides): Promise<BigNumber>;
        lotPrice(overrides?: CallOverrides): Promise<BigNumber>;
        nonce(overrides?: CallOverrides): Promise<BigNumber>;
        price(overrides?: CallOverrides): Promise<BigNumber>;
        quantity(erc20: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        refreshBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setBackupConfig(targetName: PromiseOrValue<BytesLike>, max: PromiseOrValue<BigNumberish>, erc20s: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setPrimeBasket(erc20s: PromiseOrValue<string>[], targetAmts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        status(overrides?: CallOverrides): Promise<BigNumber>;
        timestamp(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        basketsHeldBy(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        disableBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        fullyCollateralized(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        lotPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        nonce(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        price(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        quantity(erc20: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        quote(amount: PromiseOrValue<BigNumberish>, rounding: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        refreshBasket(overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setBackupConfig(targetName: PromiseOrValue<BytesLike>, max: PromiseOrValue<BigNumberish>, erc20s: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setPrimeBasket(erc20s: PromiseOrValue<string>[], targetAmts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        status(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        timestamp(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
