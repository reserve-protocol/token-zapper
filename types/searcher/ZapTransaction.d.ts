import { type TransactionRequest } from "@ethersproject/providers";
import { type TokenQuantity } from '../entities/Token';
import { type ZapERC20ParamsStruct } from "../contracts/IZapper.sol/IZapper";
export declare class ZapTransaction {
    readonly params: ZapERC20ParamsStruct;
    readonly tx: Omit<TransactionRequest, "gas">;
    readonly gasEstimate: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity[];
    constructor(params: ZapERC20ParamsStruct, tx: Omit<TransactionRequest, "gas">, gasEstimate: bigint, input: TokenQuantity, output: TokenQuantity[]);
    feeEstimate(gasPrice: bigint): bigint;
    toString(): string;
}
//# sourceMappingURL=ZapTransaction.d.ts.map