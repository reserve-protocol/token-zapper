import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export interface IStargateRouterInterface extends utils.Interface {
    functions: {
        "addLiquidity(uint256,uint256,address)": FunctionFragment;
        "instantRedeemLocal(uint256,uint256,address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addLiquidity" | "instantRedeemLocal"): FunctionFragment;
    encodeFunctionData(functionFragment: "addLiquidity", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    encodeFunctionData(functionFragment: "instantRedeemLocal", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>
    ]): string;
    decodeFunctionResult(functionFragment: "addLiquidity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "instantRedeemLocal", data: BytesLike): Result;
    events: {};
}
export interface IStargateRouter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IStargateRouterInterface;
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
        addLiquidity(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        instantRedeemLocal(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    addLiquidity(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    instantRedeemLocal(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        addLiquidity(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        instantRedeemLocal(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        addLiquidity(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        instantRedeemLocal(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addLiquidity(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        instantRedeemLocal(poolId: PromiseOrValue<BigNumberish>, amountLD: PromiseOrValue<BigNumberish>, _to: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
