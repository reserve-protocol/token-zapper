import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
export interface IComptrollerInterface extends utils.Interface {
    functions: {
        "claimComp(address)": FunctionFragment;
        "getAllMarkets()": FunctionFragment;
        "getCompAddress()": FunctionFragment;
        "mintGuardianPaused(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "claimComp" | "getAllMarkets" | "getCompAddress" | "mintGuardianPaused"): FunctionFragment;
    encodeFunctionData(functionFragment: "claimComp", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getAllMarkets", values?: undefined): string;
    encodeFunctionData(functionFragment: "getCompAddress", values?: undefined): string;
    encodeFunctionData(functionFragment: "mintGuardianPaused", values: [PromiseOrValue<string>]): string;
    decodeFunctionResult(functionFragment: "claimComp", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getAllMarkets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCompAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "mintGuardianPaused", data: BytesLike): Result;
    events: {};
}
export interface IComptroller extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IComptrollerInterface;
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
        claimComp(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getAllMarkets(overrides?: CallOverrides): Promise<[string[]] & {
            markets: string[];
        }>;
        getCompAddress(overrides?: CallOverrides): Promise<[string]>;
        mintGuardianPaused(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[boolean]>;
    };
    claimComp(account: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getAllMarkets(overrides?: CallOverrides): Promise<string[]>;
    getCompAddress(overrides?: CallOverrides): Promise<string>;
    mintGuardianPaused(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        claimComp(account: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        getAllMarkets(overrides?: CallOverrides): Promise<string[]>;
        getCompAddress(overrides?: CallOverrides): Promise<string>;
        mintGuardianPaused(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        claimComp(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getAllMarkets(overrides?: CallOverrides): Promise<BigNumber>;
        getCompAddress(overrides?: CallOverrides): Promise<BigNumber>;
        mintGuardianPaused(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        claimComp(account: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getAllMarkets(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCompAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        mintGuardianPaused(token: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=IComptroller.d.ts.map