import { type TransactionRequest } from "@ethersproject/providers";
import { type TokenQuantity } from '../entities/Token';
import { type ZapERC20ParamsStruct } from "../contracts/contracts/Zapper.sol/Zapper";
import { ContractCall } from "../base/ContractCall";
export declare class ZapTransaction {
    readonly params: ZapERC20ParamsStruct;
    readonly tx: Omit<TransactionRequest, "gas">;
    readonly gasEstimate: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity[];
    readonly contractCalls: ContractCall[];
    constructor(params: ZapERC20ParamsStruct, tx: Omit<TransactionRequest, "gas">, gasEstimate: bigint, input: TokenQuantity, output: TokenQuantity[], contractCalls: ContractCall[]);
    describe(): string[];
    feeEstimate(gasPrice: bigint): bigint;
    toString(): string;
}
