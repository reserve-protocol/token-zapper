import { type TransactionRequest } from '@ethersproject/providers';
import { PricedTokenQuantity, type TokenQuantity } from '../entities/Token';
import { type ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper';
import { Planner } from '../tx-gen/Planner';
import { Universe } from '../Universe';
import { type BaseSearcherResult } from './SearcherResult';
declare class DustStats {
    readonly dust: PricedTokenQuantity[];
    readonly valueUSD: TokenQuantity;
    private constructor();
    static fromDust(universe: Universe, dust: PricedTokenQuantity[]): Promise<DustStats>;
    toString(): string;
}
declare class FeeStats {
    private readonly universe;
    readonly units: bigint;
    private constructor();
    get txFee(): PricedTokenQuantity;
    static fromGas(universe: Universe, gasUnits: bigint): FeeStats;
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "FeeStats";
    toString(): string;
}
export declare class ZapTxStats {
    readonly universe: Universe;
    private readonly gasUnits;
    readonly input: PricedTokenQuantity;
    readonly output: PricedTokenQuantity;
    readonly dust: DustStats;
    readonly outputs: PricedTokenQuantity[];
    readonly valueUSD: TokenQuantity;
    private constructor();
    get txFee(): FeeStats;
    get netValueUSD(): TokenQuantity;
    static create(universe: Universe, input: {
        gasUnits: bigint;
        input: TokenQuantity;
        output: TokenQuantity;
        dust: TokenQuantity[];
    }): Promise<ZapTxStats>;
    compare(other: ZapTxStats): 0 | 1 | -1;
    get isThereDust(): boolean;
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "ZapTxStats";
    toString(): string;
}
export declare class ZapTransaction {
    readonly planner: Planner;
    readonly searchResult: BaseSearcherResult;
    readonly transaction: {
        params: ZapERC20ParamsStruct;
        tx: TransactionRequest;
    };
    readonly stats: ZapTxStats;
    private constructor();
    get universe(): import("./UniverseWithERC20GasTokenDefined").UniverseWithERC20GasTokenDefined;
    get input(): TokenQuantity;
    get output(): TokenQuantity;
    get outputs(): TokenQuantity[];
    get dust(): DustStats;
    get inputValueUSD(): TokenQuantity;
    get outputsValueUSD(): TokenQuantity[];
    get dustValueUSD(): TokenQuantity;
    get outputValueUSD(): TokenQuantity;
    get gas(): bigint;
    get txFee(): PricedTokenQuantity;
    get txFeeUSD(): TokenQuantity;
    get netUSD(): TokenQuantity;
    describe(): string[];
    toString(): string;
    static create(searchResult: BaseSearcherResult, planner: Planner, tx: {
        params: ZapERC20ParamsStruct;
        tx: TransactionRequest;
    }, stats: ZapTxStats): Promise<ZapTransaction>;
    compare(other: ZapTransaction): 0 | 1 | -1;
}
export {};
