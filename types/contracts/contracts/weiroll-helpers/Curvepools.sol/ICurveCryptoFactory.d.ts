import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../../common";
export interface ICurveCryptoFactoryInterface extends utils.Interface {
    functions: {
        "add_liquidity(uint256[2],uint256,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "add_liquidity"): FunctionFragment;
    encodeFunctionData(functionFragment: "add_liquidity", values: [
        [
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>
        ],
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    decodeFunctionResult(functionFragment: "add_liquidity", data: BytesLike): Result;
    events: {};
}
export interface ICurveCryptoFactory extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICurveCryptoFactoryInterface;
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
        add_liquidity(amounts: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>], minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    add_liquidity(amounts: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>], minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        add_liquidity(amounts: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>], minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        add_liquidity(amounts: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>], minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        add_liquidity(amounts: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>], minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=ICurveCryptoFactory.d.ts.map