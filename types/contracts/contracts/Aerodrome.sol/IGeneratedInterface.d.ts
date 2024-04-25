import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type SwapLpStruct = {
    lp: PromiseOrValue<string>;
    stable: PromiseOrValue<boolean>;
    token0: PromiseOrValue<string>;
    token1: PromiseOrValue<string>;
    factory: PromiseOrValue<string>;
    pool_fee: PromiseOrValue<BigNumberish>;
};
export type SwapLpStructOutput = [
    string,
    boolean,
    string,
    string,
    string,
    BigNumber
] & {
    lp: string;
    stable: boolean;
    token0: string;
    token1: string;
    factory: string;
    pool_fee: BigNumber;
};
export interface IGeneratedInterfaceInterface extends utils.Interface {
    functions: {
        "forSwaps()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "forSwaps"): FunctionFragment;
    encodeFunctionData(functionFragment: "forSwaps", values?: undefined): string;
    decodeFunctionResult(functionFragment: "forSwaps", data: BytesLike): Result;
    events: {};
}
export interface IGeneratedInterface extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IGeneratedInterfaceInterface;
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
        forSwaps(overrides?: CallOverrides): Promise<[SwapLpStructOutput[]]>;
    };
    forSwaps(overrides?: CallOverrides): Promise<SwapLpStructOutput[]>;
    callStatic: {
        forSwaps(overrides?: CallOverrides): Promise<SwapLpStructOutput[]>;
    };
    filters: {};
    estimateGas: {
        forSwaps(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        forSwaps(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IGeneratedInterface.d.ts.map