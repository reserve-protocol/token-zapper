import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type ExecuteOutputStruct = {
    dust: PromiseOrValue<BigNumberish>[];
};
export type ExecuteOutputStructOutput = [BigNumber[]] & {
    dust: BigNumber[];
};
export interface ZapperExecutorInterface extends utils.Interface {
    functions: {
        "add(uint256,uint256)": FunctionFragment;
        "assertEqual(uint256,uint256)": FunctionFragment;
        "assertLarger(uint256,uint256)": FunctionFragment;
        "execute(bytes32[],bytes[],address[])": FunctionFragment;
        "fpMul(uint256,uint256,uint256)": FunctionFragment;
        "mintMaxRToken(address,address,address)": FunctionFragment;
        "rawCall(address,uint256,bytes)": FunctionFragment;
        "sub(uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "add" | "assertEqual" | "assertLarger" | "execute" | "fpMul" | "mintMaxRToken" | "rawCall" | "sub"): FunctionFragment;
    encodeFunctionData(functionFragment: "add", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "assertEqual", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "assertLarger", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "execute", values: [
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<string>[]
    ]): string;
    encodeFunctionData(functionFragment: "fpMul", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "mintMaxRToken", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "rawCall", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "sub", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "add", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assertEqual", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "assertLarger", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fpMul", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintMaxRToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rawCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "sub", data: BytesLike): Result;
    events: {};
}
export interface ZapperExecutor extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ZapperExecutorInterface;
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
        add(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        assertEqual(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        assertLarger(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        execute(commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], tokens: PromiseOrValue<string>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        fpMul(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, scale: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        mintMaxRToken(facade: PromiseOrValue<string>, token: PromiseOrValue<string>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rawCall(to: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        sub(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    add(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    assertEqual(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    assertLarger(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    execute(commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], tokens: PromiseOrValue<string>[], overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    fpMul(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, scale: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    mintMaxRToken(facade: PromiseOrValue<string>, token: PromiseOrValue<string>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rawCall(to: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    sub(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        add(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        assertEqual(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        assertLarger(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<boolean>;
        execute(commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], tokens: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<ExecuteOutputStructOutput>;
        fpMul(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, scale: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        mintMaxRToken(facade: PromiseOrValue<string>, token: PromiseOrValue<string>, recipient: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        rawCall(to: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<[boolean, string] & {
            success: boolean;
            out: string;
        }>;
        sub(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        add(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        assertEqual(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        assertLarger(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        execute(commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], tokens: PromiseOrValue<string>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        fpMul(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, scale: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        mintMaxRToken(facade: PromiseOrValue<string>, token: PromiseOrValue<string>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rawCall(to: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        sub(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        add(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        assertEqual(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        assertLarger(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        execute(commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], tokens: PromiseOrValue<string>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        fpMul(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, scale: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mintMaxRToken(facade: PromiseOrValue<string>, token: PromiseOrValue<string>, recipient: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rawCall(to: PromiseOrValue<string>, value: PromiseOrValue<BigNumberish>, data: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        sub(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
