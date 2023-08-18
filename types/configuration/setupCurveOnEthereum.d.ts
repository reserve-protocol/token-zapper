import { type EthereumUniverse } from './ethereum';
export interface IRouteStep {
    poolId: string;
    poolAddress: string;
    inputCoinAddress: string;
    outputCoinAddress: string;
    i: number;
    j: number;
    swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
    swapAddress: string;
}
export type IRoute = IRouteStep[];
export declare const initCurveOnEthereum: (universe: EthereumUniverse, convexBooster: string) => Promise<void>;
//# sourceMappingURL=setupCurveOnEthereum.d.ts.map