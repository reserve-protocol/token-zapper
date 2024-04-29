import { type Address } from '../../base/Address';
import { type OnRetryFunctionReturn, type RetryLoopConfig } from '../../base/controlflow';
import { type Token, type TokenQuantity } from '../../entities/Token';
import { type Universe } from '../../Universe';
import { DexRouter } from '../DexAggregator';
export { DexRouter as DexAggregator } from '../DexAggregator';
import { type HttpResponse, type QuoteResponseDto, type SwapErrorDto, type SwapResponseDto } from './swagger/oneInchApi';
export type OneInchQuoteResponse = QuoteResponseDto;
export type OneInchSwapResponse = SwapResponseDto;
export interface IOneInchRouter {
    quote: (inputToken: TokenQuantity, outputToken: Token) => Promise<HttpResponse<QuoteResponseDto, SwapErrorDto>>;
    swap: (fromAddress: Address, toAddress: Address, inputToken: TokenQuantity, outputToken: Token, slippage: number) => Promise<HttpResponse<SwapResponseDto, SwapErrorDto>>;
}
declare const SUPPORTED_ONE_INCH_CHAINS: readonly [1, 56, 137, 10, 42161, 100, 43114, 250, 8217, 1313161554, 31337, 8453];
type SupportedChainIDSTupleType = typeof SUPPORTED_ONE_INCH_CHAINS;
type SupportedOneInchChains = keyof {
    [K in SupportedChainIDSTupleType[number]]: K;
};
/**
 * Instantiates the 1inch API from the generated swagger file. We have edited the file such that it is
 * generic for all chains.
 * @param baseUrl
 * @param chainId
 * @returns
 */
export declare const createV5Api: (baseUrl?: string, chainId?: SupportedOneInchChains) => IOneInchRouter;
interface OneInchRetryConfig extends Omit<RetryLoopConfig, 'onRetry'> {
    onRetry: (error: SwapErrorDto) => Promise<OnRetryFunctionReturn>;
}
interface OneInchConfig {
    baseUrl: string;
    chainId: SupportedOneInchChains;
    retryConfig: OneInchRetryConfig;
}
/**
 * @param baseUrl Should be 'https://api.1inch.io', or proxy url.
 *                We append /v5.0/{chainId} to this url, and the swagger file is appending the rest of the path.
 * @param config The configuration is optional, and will default to the values below:
 * @param config.chainId The chain ID to use. Defaults to the chain ID of the universe.
 * @param config.baseUrl The base url to use. Defaults to 'https://api.1inch.io'.
 * @param config.retryConfig The retry configuration to use. Defaults to { maxRetries: 3, delay: 500, backoff: "CONST" }. See retryLoop.
 * @note The currently supported chain IDs are: 1, 56, 137, 10, 42161, 100, 43114, 250, 8217, 1313161554
 * @note does not add the aggregator to the universe, see example.
 * @see https://docs.1inch.io/docs/aggregation-protocol/api/swagger/
 * @returns A DexAggregator that uses the 1inch API.
 * @throws @OneInchError if the 1inch API returns an error. By default retry behavior will ignore the error and keep retrying.
 *
 * @example
 * // Creates an 1inch aggregator for the network of the universe instance.
 * const oneInchAggregator = createOneInchDexAggregator(universe)
 * universe.dexAggregators.push(oneInchAggregator)
 */
export declare const createOneInchDexAggregator: (universe: Universe, config?: Readonly<Partial<OneInchConfig>>) => DexRouter;
//# sourceMappingURL=oneInchRegistry.d.ts.map