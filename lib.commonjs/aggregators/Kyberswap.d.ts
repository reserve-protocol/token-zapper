import { Token, TokenQuantity } from '..';
import { Universe } from '../Universe';
import { DexRouter } from './DexAggregator';
export interface GetRoute {
    code: number;
    message: string;
    requestId: string;
    data: {
        routeSummary: {
            tokenIn: string;
            amountIn: string;
            amountInUsd: string;
            tokenInMarketPriceAvailable: boolean;
            tokenOut: string;
            amountOut: string;
            amountOutUsd: string;
            tokenOutMarketPriceAvailable: boolean;
            gas: string;
            gasPrice: string;
            gasUsd: string;
            extraFee: {
                feeAmount: string;
                chargeFeeBy: string;
                isInBps: boolean;
                feeReceiver: string;
            };
            route: Array<{
                pool: string;
                tokenIn: string;
                tokenOut: string;
                limitReturnAmount: string;
                swapAmount: string;
                amountOut: string;
                exchange: string;
                poolLength: number;
                poolType: string;
                poolExtra: null;
                extra: any;
            }>[];
        };
        routerAddress: string;
    };
}
export interface SwapResult {
    data: {
        amountIn: string;
        amountInUsd: string;
        amountOut: string;
        amountOutUsd: string;
        gas: string;
        gasUsd: string;
        outputChange: {
            amount: string;
            percent: number;
            level: number;
        };
        data: string;
        routerAddress: string;
    };
}
export interface KyberswapAggregatorResult {
    block: number;
    req: GetRoute;
    quantityIn: TokenQuantity;
    output: Token;
    swap: SwapResult;
    slippage: bigint;
}
export declare const createKyberswap: (aggregatorName: string, universe: Universe) => DexRouter;
