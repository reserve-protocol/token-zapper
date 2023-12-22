import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface ExpressionEvaluatorInterface extends utils.Interface {
    functions: {
        "evalExpression(uint256,uint256,uint256,uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "evalExpression"): FunctionFragment;
    encodeFunctionData(functionFragment: "evalExpression", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    decodeFunctionResult(functionFragment: "evalExpression", data: BytesLike): Result;
    events: {};
}
export interface ExpressionEvaluator extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ExpressionEvaluatorInterface;
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
        evalExpression(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, c: PromiseOrValue<BigNumberish>, d: PromiseOrValue<BigNumberish>, ops: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    evalExpression(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, c: PromiseOrValue<BigNumberish>, d: PromiseOrValue<BigNumberish>, ops: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        evalExpression(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, c: PromiseOrValue<BigNumberish>, d: PromiseOrValue<BigNumberish>, ops: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        evalExpression(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, c: PromiseOrValue<BigNumberish>, d: PromiseOrValue<BigNumberish>, ops: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        evalExpression(a: PromiseOrValue<BigNumberish>, b: PromiseOrValue<BigNumberish>, c: PromiseOrValue<BigNumberish>, d: PromiseOrValue<BigNumberish>, ops: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=ExpressionEvaluator.d.ts.map