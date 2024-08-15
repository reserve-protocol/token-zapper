import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../../common";
export interface UniV3RouterCallInterface extends utils.Interface {
    functions: {
        "exactInput(uint256,uint256,address,address,bytes)": FunctionFragment;
        "exactInputSingle(uint256,uint256,address,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "exactInput" | "exactInputSingle"): FunctionFragment;
    encodeFunctionData(functionFragment: "exactInput", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "exactInputSingle", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    decodeFunctionResult(functionFragment: "exactInput", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exactInputSingle", data: BytesLike): Result;
    events: {};
}
export interface UniV3RouterCall extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: UniV3RouterCallInterface;
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
        exactInput(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, recipient: PromiseOrValue<string>, path: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        exactInputSingle(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, encodedRouterCall: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    exactInput(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, recipient: PromiseOrValue<string>, path: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    exactInputSingle(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, encodedRouterCall: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        exactInput(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, recipient: PromiseOrValue<string>, path: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
        exactInputSingle(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, encodedRouterCall: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        exactInput(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, recipient: PromiseOrValue<string>, path: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        exactInputSingle(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, encodedRouterCall: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        exactInput(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, recipient: PromiseOrValue<string>, path: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        exactInputSingle(amountIn: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, router: PromiseOrValue<string>, encodedRouterCall: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
