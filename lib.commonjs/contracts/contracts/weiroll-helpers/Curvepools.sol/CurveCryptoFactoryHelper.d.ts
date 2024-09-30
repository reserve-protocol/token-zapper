import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../../common";
export interface CurveCryptoFactoryHelperInterface extends utils.Interface {
    functions: {
        "addliquidity(uint256,uint256,address,uint256,bool)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addliquidity"): FunctionFragment;
    encodeFunctionData(functionFragment: "addliquidity", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<boolean>
    ]): string;
    decodeFunctionResult(functionFragment: "addliquidity", data: BytesLike): Result;
    events: {};
}
export interface CurveCryptoFactoryHelper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CurveCryptoFactoryHelperInterface;
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
        addliquidity(amount: PromiseOrValue<BigNumberish>, coinIdx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    addliquidity(amount: PromiseOrValue<BigNumberish>, coinIdx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        addliquidity(amount: PromiseOrValue<BigNumberish>, coinIdx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        addliquidity(amount: PromiseOrValue<BigNumberish>, coinIdx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addliquidity(amount: PromiseOrValue<BigNumberish>, coinIdx: PromiseOrValue<BigNumberish>, pool: PromiseOrValue<string>, minOut: PromiseOrValue<BigNumberish>, useEth: PromiseOrValue<boolean>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
