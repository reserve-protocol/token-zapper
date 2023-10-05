import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../common";
export type CallStruct = {
    to: PromiseOrValue<string>;
    data: PromiseOrValue<BytesLike>;
    value: PromiseOrValue<BigNumberish>;
};
export type CallStructOutput = [string, string, BigNumber] & {
    to: string;
    data: string;
    value: BigNumber;
};
export type ZapERC20ParamsStruct = {
    tokenIn: PromiseOrValue<string>;
    amountIn: PromiseOrValue<BigNumberish>;
    commands: CallStruct[];
    amountOut: PromiseOrValue<BigNumberish>;
    tokenOut: PromiseOrValue<string>;
    tokensUsedByZap: PromiseOrValue<string>[];
};
export type ZapERC20ParamsStructOutput = [
    string,
    BigNumber,
    CallStructOutput[],
    BigNumber,
    string,
    string[]
] & {
    tokenIn: string;
    amountIn: BigNumber;
    commands: CallStructOutput[];
    amountOut: BigNumber;
    tokenOut: string;
    tokensUsedByZap: string[];
};
export type ZapperOutputStruct = {
    dust: PromiseOrValue<BigNumberish>[];
    amountOut: PromiseOrValue<BigNumberish>;
    gasUsed: PromiseOrValue<BigNumberish>;
};
export type ZapperOutputStructOutput = [BigNumber[], BigNumber, BigNumber] & {
    dust: BigNumber[];
    amountOut: BigNumber;
    gasUsed: BigNumber;
};
export type TokenPermissionsStruct = {
    token: PromiseOrValue<string>;
    amount: PromiseOrValue<BigNumberish>;
};
export type TokenPermissionsStructOutput = [string, BigNumber] & {
    token: string;
    amount: BigNumber;
};
export type PermitTransferFromStruct = {
    permitted: TokenPermissionsStruct;
    nonce: PromiseOrValue<BigNumberish>;
    deadline: PromiseOrValue<BigNumberish>;
};
export type PermitTransferFromStructOutput = [
    TokenPermissionsStructOutput,
    BigNumber,
    BigNumber
] & {
    permitted: TokenPermissionsStructOutput;
    nonce: BigNumber;
    deadline: BigNumber;
};
export interface ZapperInterface extends utils.Interface {
    functions: {
        "zapERC20((address,uint256,(address,bytes,uint256)[],uint256,address,address[]))": FunctionFragment;
        "zapERC20WithPermit2((address,uint256,(address,bytes,uint256)[],uint256,address,address[]),((address,uint256),uint256,uint256),bytes)": FunctionFragment;
        "zapETH((address,uint256,(address,bytes,uint256)[],uint256,address,address[]))": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "zapERC20" | "zapERC20WithPermit2" | "zapETH"): FunctionFragment;
    encodeFunctionData(functionFragment: "zapERC20", values: [ZapERC20ParamsStruct]): string;
    encodeFunctionData(functionFragment: "zapERC20WithPermit2", values: [
        ZapERC20ParamsStruct,
        PermitTransferFromStruct,
        PromiseOrValue<BytesLike>
    ]): string;
    encodeFunctionData(functionFragment: "zapETH", values: [ZapERC20ParamsStruct]): string;
    decodeFunctionResult(functionFragment: "zapERC20", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "zapERC20WithPermit2", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "zapETH", data: BytesLike): Result;
    events: {};
}
export interface Zapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ZapperInterface;
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
        zapERC20(params: ZapERC20ParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        zapERC20WithPermit2(params: ZapERC20ParamsStruct, permit: PermitTransferFromStruct, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        zapETH(params: ZapERC20ParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    zapERC20(params: ZapERC20ParamsStruct, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    zapERC20WithPermit2(params: ZapERC20ParamsStruct, permit: PermitTransferFromStruct, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    zapETH(params: ZapERC20ParamsStruct, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        zapERC20(params: ZapERC20ParamsStruct, overrides?: CallOverrides): Promise<ZapperOutputStructOutput>;
        zapERC20WithPermit2(params: ZapERC20ParamsStruct, permit: PermitTransferFromStruct, signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<ZapperOutputStructOutput>;
        zapETH(params: ZapERC20ParamsStruct, overrides?: CallOverrides): Promise<ZapperOutputStructOutput>;
    };
    filters: {};
    estimateGas: {
        zapERC20(params: ZapERC20ParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        zapERC20WithPermit2(params: ZapERC20ParamsStruct, permit: PermitTransferFromStruct, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        zapETH(params: ZapERC20ParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        zapERC20(params: ZapERC20ParamsStruct, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        zapERC20WithPermit2(params: ZapERC20ParamsStruct, permit: PermitTransferFromStruct, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        zapETH(params: ZapERC20ParamsStruct, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
//# sourceMappingURL=Zapper.d.ts.map