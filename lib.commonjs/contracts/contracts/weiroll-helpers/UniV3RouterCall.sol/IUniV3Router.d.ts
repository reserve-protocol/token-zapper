import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../../common";
export declare namespace IUniV3Router {
    type ExactInputParamsStruct = {
        path: PromiseOrValue<BytesLike>;
        recipient: PromiseOrValue<string>;
        deadline: PromiseOrValue<BigNumberish>;
        amountIn: PromiseOrValue<BigNumberish>;
        amountOutMinimum: PromiseOrValue<BigNumberish>;
    };
    type ExactInputParamsStructOutput = [
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        path: string;
        recipient: string;
        deadline: BigNumber;
        amountIn: BigNumber;
        amountOutMinimum: BigNumber;
    };
    type ExactInputSingleParamsStruct = {
        tokenIn: PromiseOrValue<string>;
        tokenOut: PromiseOrValue<string>;
        fee: PromiseOrValue<BigNumberish>;
        recipient: PromiseOrValue<string>;
        deadline: PromiseOrValue<BigNumberish>;
        amountIn: PromiseOrValue<BigNumberish>;
        amountOutMinimum: PromiseOrValue<BigNumberish>;
        sqrtPriceLimitX96: PromiseOrValue<BigNumberish>;
    };
    type ExactInputSingleParamsStructOutput = [
        string,
        string,
        number,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        tokenIn: string;
        tokenOut: string;
        fee: number;
        recipient: string;
        deadline: BigNumber;
        amountIn: BigNumber;
        amountOutMinimum: BigNumber;
        sqrtPriceLimitX96: BigNumber;
    };
}
export interface IUniV3RouterInterface extends utils.Interface {
    functions: {
        "exactInput((bytes,address,uint256,uint256,uint256))": FunctionFragment;
        "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "exactInput" | "exactInputSingle"): FunctionFragment;
    encodeFunctionData(functionFragment: "exactInput", values: [IUniV3Router.ExactInputParamsStruct]): string;
    encodeFunctionData(functionFragment: "exactInputSingle", values: [IUniV3Router.ExactInputSingleParamsStruct]): string;
    decodeFunctionResult(functionFragment: "exactInput", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "exactInputSingle", data: BytesLike): Result;
    events: {};
}
export interface IUniV3Router extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IUniV3RouterInterface;
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
        exactInput(params: IUniV3Router.ExactInputParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        exactInputSingle(params: IUniV3Router.ExactInputSingleParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    exactInput(params: IUniV3Router.ExactInputParamsStruct, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    exactInputSingle(params: IUniV3Router.ExactInputSingleParamsStruct, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        exactInput(params: IUniV3Router.ExactInputParamsStruct, overrides?: CallOverrides): Promise<BigNumber>;
        exactInputSingle(params: IUniV3Router.ExactInputSingleParamsStruct, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        exactInput(params: IUniV3Router.ExactInputParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        exactInputSingle(params: IUniV3Router.ExactInputSingleParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        exactInput(params: IUniV3Router.ExactInputParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        exactInputSingle(params: IUniV3Router.ExactInputSingleParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}