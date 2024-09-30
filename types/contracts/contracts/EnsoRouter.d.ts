import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface EnsoRouterInterface extends utils.Interface {
    functions: {
        "routeSingle(address,uint256,bytes32[],bytes[])": FunctionFragment;
        "safeRouteSingle(address,address,uint256,uint256,address,bytes32[],bytes[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "routeSingle" | "safeRouteSingle"): FunctionFragment;
    encodeFunctionData(functionFragment: "routeSingle", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<BytesLike>[]
    ]): string;
    encodeFunctionData(functionFragment: "safeRouteSingle", values: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>[],
        PromiseOrValue<BytesLike>[]
    ]): string;
    decodeFunctionResult(functionFragment: "routeSingle", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "safeRouteSingle", data: BytesLike): Result;
    events: {};
}
export interface EnsoRouter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: EnsoRouterInterface;
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
        routeSingle(tokenIn: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        safeRouteSingle(tokenIn: PromiseOrValue<string>, tokenOut: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, minAmountOut: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    routeSingle(tokenIn: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    safeRouteSingle(tokenIn: PromiseOrValue<string>, tokenOut: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, minAmountOut: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        routeSingle(tokenIn: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<string[]>;
        safeRouteSingle(tokenIn: PromiseOrValue<string>, tokenOut: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, minAmountOut: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: CallOverrides): Promise<string[]>;
    };
    filters: {};
    estimateGas: {
        routeSingle(tokenIn: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        safeRouteSingle(tokenIn: PromiseOrValue<string>, tokenOut: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, minAmountOut: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        routeSingle(tokenIn: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        safeRouteSingle(tokenIn: PromiseOrValue<string>, tokenOut: PromiseOrValue<string>, amountIn: PromiseOrValue<BigNumberish>, minAmountOut: PromiseOrValue<BigNumberish>, receiver: PromiseOrValue<string>, commands: PromiseOrValue<BytesLike>[], state: PromiseOrValue<BytesLike>[], overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=EnsoRouter.d.ts.map