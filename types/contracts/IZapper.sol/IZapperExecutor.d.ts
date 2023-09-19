import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export type CallStruct = {
    to: PromiseOrValue<string>;
    data: PromiseOrValue<BytesLike>;
    value: PromiseOrValue<BigNumberish>;
};
export type CallStructOutput = [string, string, BigNumber] & {
    to: string;
    data: string;
    value: BigNumber;
};
export interface IZapperExecutorInterface extends utils.Interface {
    functions: {
        "drainERC20s(address[],address)": FunctionFragment;
        "execute((address,bytes,uint256)[])": FunctionFragment;
        "setupApprovals(address[],address[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "drainERC20s" | "execute" | "setupApprovals"): FunctionFragment;
    encodeFunctionData(functionFragment: "drainERC20s", values: [PromiseOrValue<string>[], PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "execute", values: [CallStruct[]]): string;
    encodeFunctionData(functionFragment: "setupApprovals", values: [PromiseOrValue<string>[], PromiseOrValue<string>[]]): string;
    decodeFunctionResult(functionFragment: "drainERC20s", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setupApprovals", data: BytesLike): Result;
    events: {};
}
export interface IZapperExecutor extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IZapperExecutorInterface;
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
        drainERC20s(tokens: PromiseOrValue<string>[], destination: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        execute(calls: CallStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        setupApprovals(tokens: PromiseOrValue<string>[], spenders: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    drainERC20s(tokens: PromiseOrValue<string>[], destination: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    execute(calls: CallStruct[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    setupApprovals(tokens: PromiseOrValue<string>[], spenders: PromiseOrValue<string>[], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        drainERC20s(tokens: PromiseOrValue<string>[], destination: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        execute(calls: CallStruct[], overrides?: CallOverrides): Promise<void>;
        setupApprovals(tokens: PromiseOrValue<string>[], spenders: PromiseOrValue<string>[], overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        drainERC20s(tokens: PromiseOrValue<string>[], destination: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        execute(calls: CallStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        setupApprovals(tokens: PromiseOrValue<string>[], spenders: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        drainERC20s(tokens: PromiseOrValue<string>[], destination: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        execute(calls: CallStruct[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        setupApprovals(tokens: PromiseOrValue<string>[], spenders: PromiseOrValue<string>[], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IZapperExecutor.d.ts.map