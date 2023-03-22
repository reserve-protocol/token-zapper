import { ethers } from 'ethers';
import { type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { ZapERC20ParamsStruct } from '../contracts/contracts/IZapper.sol/IZapper';
import { SearcherResult } from './SearcherResult';
export declare class ZapTransaction {
    private readonly universe;
    readonly params: ZapERC20ParamsStruct;
    readonly tx: ethers.providers.TransactionRequest;
    readonly gas: bigint;
    readonly input: TokenQuantity;
    readonly output: TokenQuantity[];
    readonly result: SearcherResult;
    constructor(universe: Universe, params: ZapERC20ParamsStruct, tx: ethers.providers.TransactionRequest, gas: bigint, input: TokenQuantity, output: TokenQuantity[], result: SearcherResult);
    get fee(): TokenQuantity;
    toString(): string;
}
