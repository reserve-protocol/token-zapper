import { type Address } from '../base/Address';
import { SwapPaths } from '../searcher/Swap';
import { type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { ethers } from 'ethers';
import { ApprovalsStore } from './ApprovalsStore';
import { ZapERC20ParamsStruct } from '../contracts/contracts/IZapper.sol/IZapper';
declare class ZapTransaction {
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
export declare class SearcherResult {
    readonly universe: Universe;
    readonly approvals: ApprovalsStore;
    readonly swaps: SwapPaths;
    readonly signer: Address;
    constructor(universe: Universe, approvals: ApprovalsStore, swaps: SwapPaths, signer: Address);
    describe(): string[];
    private encodeActions;
    toTransaction(): Promise<ZapTransaction>;
}
export {};
