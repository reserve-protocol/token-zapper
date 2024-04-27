import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IConvexStakingWrapperInterface extends utils.Interface {
    functions: {
        "N_COINS()": FunctionFragment;
        "add_liquidity(uint256[],uint256)": FunctionFragment;
        "calc_token_amount(uint256[],bool)": FunctionFragment;
        "calc_withdraw_one_coin(uint256,int128)": FunctionFragment;
        "coins(uint256)": FunctionFragment;
        "dynamic_fee(int128,int128,address)": FunctionFragment;
        "get_dx(int128,int128,uint256,address)": FunctionFragment;
        "get_dy(int128,int128,uint256,address)": FunctionFragment;
        "remove_liquidity(uint256,uint256[])": FunctionFragment;
        "remove_liquidity_one_coin(uint256,int128,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "N_COINS" | "add_liquidity" | "calc_token_amount" | "calc_withdraw_one_coin" | "coins" | "dynamic_fee" | "get_dx" | "get_dy" | "remove_liquidity" | "remove_liquidity_one_coin"): FunctionFragment;
    encodeFunctionData(functionFragment: "N_COINS", values?: undefined): string;
    encodeFunctionData(functionFragment: "add_liquidity", values: [PromiseOrValue<BigNumberish>[], PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "calc_token_amount", values: [PromiseOrValue<BigNumberish>[], PromiseOrValue<boolean>]): string;
    encodeFunctionData(functionFragment: "calc_withdraw_one_coin", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "coins", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "dynamic_fee", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "get_dx", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "get_dy", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "remove_liquidity", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>[]]): string;
    encodeFunctionData(functionFragment: "remove_liquidity_one_coin", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "N_COINS", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "add_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calc_token_amount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "calc_withdraw_one_coin", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "coins", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "dynamic_fee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dx", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "get_dy", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remove_liquidity_one_coin", data: BytesLike): Result;
    events: {};
}
export interface IConvexStakingWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IConvexStakingWrapperInterface;
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
        N_COINS(overrides?: CallOverrides): Promise<[BigNumber]>;
        add_liquidity(amounts: PromiseOrValue<BigNumberish>[], minOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        calc_token_amount(amounts: PromiseOrValue<BigNumberish>[], isDeposit: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<[BigNumber]>;
        calc_withdraw_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        coins(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[string]>;
        dynamic_fee(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_dx(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dy: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        get_dy(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[BigNumber]>;
        remove_liquidity(amount: PromiseOrValue<BigNumberish>, mintOuts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        remove_liquidity_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, mintOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    N_COINS(overrides?: CallOverrides): Promise<BigNumber>;
    add_liquidity(amounts: PromiseOrValue<BigNumberish>[], minOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    calc_token_amount(amounts: PromiseOrValue<BigNumberish>[], isDeposit: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
    calc_withdraw_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    coins(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
    dynamic_fee(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    get_dx(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dy: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    get_dy(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    remove_liquidity(amount: PromiseOrValue<BigNumberish>, mintOuts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    remove_liquidity_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, mintOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        N_COINS(overrides?: CallOverrides): Promise<BigNumber>;
        add_liquidity(amounts: PromiseOrValue<BigNumberish>[], minOut: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        calc_token_amount(amounts: PromiseOrValue<BigNumberish>[], isDeposit: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
        calc_withdraw_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        coins(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<string>;
        dynamic_fee(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        get_dx(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dy: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        remove_liquidity(amount: PromiseOrValue<BigNumberish>, mintOuts: PromiseOrValue<BigNumberish>[], overrides?: CallOverrides): Promise<BigNumber[]>;
        remove_liquidity_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, mintOut: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        N_COINS(overrides?: CallOverrides): Promise<BigNumber>;
        add_liquidity(amounts: PromiseOrValue<BigNumberish>[], minOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        calc_token_amount(amounts: PromiseOrValue<BigNumberish>[], isDeposit: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
        calc_withdraw_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        coins(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        dynamic_fee(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        get_dx(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dy: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        get_dy(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        remove_liquidity(amount: PromiseOrValue<BigNumberish>, mintOuts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        remove_liquidity_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, mintOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        N_COINS(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        add_liquidity(amounts: PromiseOrValue<BigNumberish>[], minOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        calc_token_amount(amounts: PromiseOrValue<BigNumberish>[], isDeposit: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        calc_withdraw_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        coins(i: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        dynamic_fee(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_dx(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dy: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        get_dy(i: PromiseOrValue<BigNumberish>, j: PromiseOrValue<BigNumberish>, dx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        remove_liquidity(amount: PromiseOrValue<BigNumberish>, mintOuts: PromiseOrValue<BigNumberish>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        remove_liquidity_one_coin(amt: PromiseOrValue<BigNumberish>, i: PromiseOrValue<BigNumberish>, mintOut: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
