import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type PoolInfoStruct = {
    lptoken: PromiseOrValue<string>;
    token: PromiseOrValue<string>;
    gauge: PromiseOrValue<string>;
    crvRewards: PromiseOrValue<string>;
    stash: PromiseOrValue<string>;
    shutdown: PromiseOrValue<boolean>;
};
export type PoolInfoStructOutput = [
    string,
    string,
    string,
    string,
    string,
    boolean
] & {
    lptoken: string;
    token: string;
    gauge: string;
    crvRewards: string;
    stash: string;
    shutdown: boolean;
};
export interface IBoosterInterface extends utils.Interface {
    functions: {
        "poolInfo(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "poolInfo"): FunctionFragment;
    encodeFunctionData(functionFragment: "poolInfo", values: [PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "poolInfo", data: BytesLike): Result;
    events: {};
}
export interface IBooster extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBoosterInterface;
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
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[PoolInfoStructOutput]>;
    };
    poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PoolInfoStructOutput>;
    callStatic: {
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PoolInfoStructOutput>;
    };
    filters: {};
    estimateGas: {
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        poolInfo(arg0: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IBooster.d.ts.map