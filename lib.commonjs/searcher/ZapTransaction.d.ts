import { type TransactionRequest } from '@ethersproject/providers';
import { type TokenQuantity } from '../entities/Token';
import { type ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper';
import { Planner } from '../tx-gen/Planner';
import { Universe } from '..';
export declare class ZapTransaction {
    readonly universe: Universe;
    readonly params: ZapERC20ParamsStruct;
    readonly tx: Omit<TransactionRequest, 'gas'>;
    readonly gasEstimate: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity[];
    readonly planner: Planner;
    constructor(universe: Universe, params: ZapERC20ParamsStruct, tx: Omit<TransactionRequest, 'gas'>, gasEstimate: bigint, input: TokenQuantity, output: TokenQuantity[], planner: Planner);
    describe(): string[];
    feeEstimate(gasPrice: bigint): bigint;
    toString(): string;
}
