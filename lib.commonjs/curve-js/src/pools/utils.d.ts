import { IDict } from "../interfaces";
export declare const getUserPoolListByLiquidity: (address?: string) => Promise<string[]>;
export declare const getUserLiquidityUSD: (pools: string[], address?: string) => Promise<string[]>;
export declare const _getAmplificationCoefficientsFromApi: () => Promise<IDict<number>>;
