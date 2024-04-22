import { Universe } from '../Universe';
import { DexAggregator } from './DexAggregator';
export interface EnsoQuote {
    gas: string;
    amountOut: string;
    createdAt: number;
    tx: {
        data: string;
        to: string;
        from: string;
        value: string;
    };
    route: {
        action: string;
        protocol: string;
        tokenIn: [string];
        tokenOut: [string];
        positionInId: [string];
        positionOutId: [string];
    }[];
}
export declare const createEnso: (aggregatorName: string, universe: Universe, slippage: number, retries?: number) => DexAggregator;
//# sourceMappingURL=Enso.d.ts.map