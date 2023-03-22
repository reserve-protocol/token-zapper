import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../common";
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
export type SignatureTransferDetailsStruct = {
    to: PromiseOrValue<string>;
    requestedAmount: PromiseOrValue<BigNumberish>;
};
export type SignatureTransferDetailsStructOutput = [string, BigNumber] & {
    to: string;
    requestedAmount: BigNumber;
};
export interface IPermit2Interface extends utils.Interface {
    functions: {
        "permitTransferFrom(((address,uint256),uint256,uint256),(address,uint256),address,bytes)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "permitTransferFrom"): FunctionFragment;
    encodeFunctionData(functionFragment: "permitTransferFrom", values: [
        PermitTransferFromStruct,
        SignatureTransferDetailsStruct,
        PromiseOrValue<string>,
        PromiseOrValue<BytesLike>
    ]): string;
    decodeFunctionResult(functionFragment: "permitTransferFrom", data: BytesLike): Result;
    events: {};
}
export interface IPermit2 extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IPermit2Interface;
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
        permitTransferFrom(permit: PermitTransferFromStruct, transferDetails: SignatureTransferDetailsStruct, owner: PromiseOrValue<string>, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    permitTransferFrom(permit: PermitTransferFromStruct, transferDetails: SignatureTransferDetailsStruct, owner: PromiseOrValue<string>, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        permitTransferFrom(permit: PermitTransferFromStruct, transferDetails: SignatureTransferDetailsStruct, owner: PromiseOrValue<string>, signature: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {};
    estimateGas: {
        permitTransferFrom(permit: PermitTransferFromStruct, transferDetails: SignatureTransferDetailsStruct, owner: PromiseOrValue<string>, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        permitTransferFrom(permit: PermitTransferFromStruct, transferDetails: SignatureTransferDetailsStruct, owner: PromiseOrValue<string>, signature: PromiseOrValue<BytesLike>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
