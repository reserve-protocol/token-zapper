import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type SwapLpStruct = {
    lp: PromiseOrValue<string>;
    poolType: PromiseOrValue<BigNumberish>;
    token0: PromiseOrValue<string>;
    token1: PromiseOrValue<string>;
    factory: PromiseOrValue<string>;
    poolFee: PromiseOrValue<BigNumberish>;
};
export type SwapLpStructOutput = [
    string,
    number,
    string,
    string,
    string,
    BigNumber
] & {
    lp: string;
    poolType: number;
    token0: string;
    token1: string;
    factory: string;
    poolFee: BigNumber;
};
export interface IAerodromeSugarInterface extends utils.Interface {
    functions: {
        "forSwaps(uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "forSwaps"): FunctionFragment;
    encodeFunctionData(functionFragment: "forSwaps", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "forSwaps", data: BytesLike): Result;
    events: {};
}
export interface IAerodromeSugar extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IAerodromeSugarInterface;
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
        forSwaps(limit: PromiseOrValue<BigNumberish>, offset: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[SwapLpStructOutput[]]>;
    };
    forSwaps(limit: PromiseOrValue<BigNumberish>, offset: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<SwapLpStructOutput[]>;
    callStatic: {
        forSwaps(limit: PromiseOrValue<BigNumberish>, offset: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<SwapLpStructOutput[]>;
    };
    filters: {};
    estimateGas: {
        forSwaps(limit: PromiseOrValue<BigNumberish>, offset: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        forSwaps(limit: PromiseOrValue<BigNumberish>, offset: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IAerodromeSugar.d.ts.map