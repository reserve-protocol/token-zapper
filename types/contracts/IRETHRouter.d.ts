import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export interface IRETHRouterInterface extends utils.Interface {
    functions: {
        "optimiseSwapFrom(uint256,uint256)": FunctionFragment;
        "optimiseSwapTo(uint256,uint256)": FunctionFragment;
        "swapFrom(uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
        "swapTo(uint256,uint256,uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "optimiseSwapFrom" | "optimiseSwapTo" | "swapFrom" | "swapTo"): FunctionFragment;
    encodeFunctionData(functionFragment: "optimiseSwapFrom", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "optimiseSwapTo", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "swapFrom", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "swapTo", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "optimiseSwapFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "optimiseSwapTo", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapFrom", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "swapTo", data: BytesLike): Result;
    events: {};
}
export interface IRETHRouter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IRETHRouterInterface;
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
        optimiseSwapFrom(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        optimiseSwapTo(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        swapFrom(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, _tokensIn: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        swapTo(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    optimiseSwapFrom(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    optimiseSwapTo(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    swapFrom(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, _tokensIn: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    swapTo(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        optimiseSwapFrom(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            [BigNumber, BigNumber],
            BigNumber
        ] & {
            portions: [BigNumber, BigNumber];
            amountOut: BigNumber;
        }>;
        optimiseSwapTo(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[
            [BigNumber, BigNumber],
            BigNumber
        ] & {
            portions: [BigNumber, BigNumber];
            amountOut: BigNumber;
        }>;
        swapFrom(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, _tokensIn: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        swapTo(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        optimiseSwapFrom(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        optimiseSwapTo(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        swapFrom(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, _tokensIn: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        swapTo(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        optimiseSwapFrom(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        optimiseSwapTo(_amount: PromiseOrValue<BigNumberish>, _steps: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        swapFrom(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, _tokensIn: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        swapTo(_uniswapPortion: PromiseOrValue<BigNumberish>, _balancerPortion: PromiseOrValue<BigNumberish>, _minTokensOut: PromiseOrValue<BigNumberish>, _idealTokensOut: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IRETHRouter.d.ts.map