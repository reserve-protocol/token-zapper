import { type TransactionRequest } from '@ethersproject/providers';
import { type ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper';
import { PricedTokenQuantity, type TokenQuantity } from '../entities/Token';
import { Planner } from '../tx-gen/Planner';
import { type BaseSearcherResult } from './SearcherResult';
declare class DustStats {
    readonly dust: PricedTokenQuantity[];
    readonly valueUSD: TokenQuantity;
    private constructor();
    static fromDust(result: BaseSearcherResult, dust: PricedTokenQuantity[]): DustStats;
    toString(): string;
}
declare class FeeStats {
    private readonly result;
    readonly units: bigint;
    private constructor();
    get txFee(): PricedTokenQuantity;
    static fromGas(universe: BaseSearcherResult, gasUnits: bigint): FeeStats;
    [Symbol.toPrimitive](): string;
    readonly [Symbol.toStringTag] = "FeeStats";
    toString(): string;
}
export declare class ZapTxStats {
    readonly result: BaseSearcherResult;
    private readonly gasUnits;
    readonly input: PricedTokenQuantity;
    readonly output: PricedTokenQuantity;
    readonly dust: DustStats;
    readonly outputs: PricedTokenQuantity[];
    readonly valueUSD: TokenQuantity;
    get universe(): import("..").Universe<import("..").Config>;
    private constructor();
    get txFee(): FeeStats;
    get netValueUSD(): TokenQuantity;
    static create(result: BaseSearcherResult, input: {
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
    get universe(): import("..").Universe<import("..").Config>;
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
    serialize(): Promise<{
        id: string;
        chainId: number;
        zapType: string;
        requestStart: string;
        requestBlock: number;
        createdAt: string;
        createdAtBlock: number;
        searchTime: number;
        txArgs: any;
        tx: {
            to: string | null;
            data: string | null;
            value: string;
            from: string | null;
        };
        gasUnits: string;
        input: string;
        output: string;
        dust: string[];
        description: string;
        state: {
            prices: {
                searcherPrices: {
                    token: string;
                    price: string;
                }[];
            };
        };
    }>;
}
export {};
