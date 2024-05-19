import { type Address } from '../base/Address';
import { type Provider } from '@ethersproject/providers';
export declare const makeTokenLoader: (provider: Provider) => (address: Address) => Promise<{
    symbol: string;
    decimals: number;
}>;
export type TokenLoader = ReturnType<typeof makeTokenLoader>;
