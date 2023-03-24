import { ethers } from 'ethers';
import { type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { ZapERC20ParamsStruct } from '../contracts/contracts/IZapper.sol/IZapper';
import { SearcherResult } from './SearcherResult';
export declare class ZapTransaction {
    private readonly universe;
    readonly params: ZapERC20ParamsStruct;
    readonly tx: Omit<ethers.providers.TransactionRequest, "gas">;
    readonly gasEstimate: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity[];
    readonly result: SearcherResult;
    constructor(universe: Universe, params: ZapERC20ParamsStruct, tx: Omit<ethers.providers.TransactionRequest, "gas">, gasEstimate: bigint, input: TokenQuantity, output: TokenQuantity[], result: SearcherResult);
    get fee(): TokenQuantity;
    toString(): string;
}
