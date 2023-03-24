import { type Address } from '../../base/Address';
import { type Token, type TokenQuantity } from '../../entities/Token';
import { Universe } from '../../Universe';
import { DexAggregator } from '../DexAggregator';
import { type QuoteResponseDto, type SwapResponseDto } from './eth/oneInchEthApi';
export type OneInchQuoteResponse = QuoteResponseDto;
export type OneInchSwapResponse = SwapResponseDto;
export interface IOneInchRouter {
    quote: (inputToken: TokenQuantity, outputToken: Token) => Promise<OneInchQuoteResponse>;
    swap: (fromAddress: Address, toAddress: Address, inputToken: TokenQuantity, outputToken: Token, slippage: number) => Promise<OneInchSwapResponse>;
}
export declare const createEthereumRouter: (baseUrl: string) => IOneInchRouter;
export declare const initOneInch: (universe: Universe, baseUrl: string) => DexAggregator;
