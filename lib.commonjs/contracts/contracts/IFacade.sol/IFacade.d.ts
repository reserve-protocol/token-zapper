import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IFacadeInterface extends utils.Interface {
    functions: {
        "basketTokens(address)": FunctionFragment;
        "issue(address,uint256)": FunctionFragment;
        "maxIssuable(address,address)": FunctionFragment;
        "maxIssuableByAmounts(address,uint256[])": FunctionFragment;
        "price(address)": FunctionFragment;
        "redeem(address,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "basketTokens" | "issue" | "maxIssuable" | "maxIssuableByAmounts" | "price" | "redeem"): FunctionFragment;
    encodeFunctionData(functionFragment: "basketTokens", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "issue", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "maxIssuable", values: [PromiseOrValue<string>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "maxIssuableByAmounts", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "price", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "redeem", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "basketTokens", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "issue", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "maxIssuable", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "maxIssuableByAmounts", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
    events: {};
}
export interface IFacade extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IFacadeInterface;
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
        basketTokens(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[string[]] & {
            tokens: string[];
        }>;
        issue(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        maxIssuable(rToken: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        maxIssuableByAmounts(rToken: PromiseOrValue<string>, amounts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        price(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            low: BigNumber;
            high: BigNumber;
        }>;
        redeem(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    basketTokens(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string[]>;
    issue(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    maxIssuable(rToken: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    maxIssuableByAmounts(rToken: PromiseOrValue<string>, amounts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    price(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
        low: BigNumber;
        high: BigNumber;
    }>;
    redeem(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        basketTokens(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<string[]>;
        issue(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[],
            BigNumber[]
        ] & {
            tokens: string[];
            deposits: BigNumber[];
            depositsUoA: BigNumber[];
        }>;
        maxIssuable(rToken: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        maxIssuableByAmounts(rToken: PromiseOrValue<string>, amounts: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber>;
        price(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber, BigNumber] & {
            low: BigNumber;
            high: BigNumber;
        }>;
        redeem(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            string[],
            BigNumber[],
            BigNumber[]
        ] & {
            tokens: string[];
            withdrawals: BigNumber[];
            available: BigNumber[];
        }>;
    };
    filters: {};
    estimateGas: {
        basketTokens(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        issue(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        maxIssuable(rToken: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        maxIssuableByAmounts(rToken: PromiseOrValue<string>, amounts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        price(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        redeem(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        basketTokens(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        issue(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        maxIssuable(rToken: PromiseOrValue<string>, account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        maxIssuableByAmounts(rToken: PromiseOrValue<string>, amounts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        price(rToken: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        redeem(rToken: PromiseOrValue<string>, amount: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
