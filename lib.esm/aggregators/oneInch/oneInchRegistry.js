import { OneInchAction } from '../../action/OneInch';
import { retryLoop, } from '../../base/controlflow';
import { SwapPlan } from '../../searcher/Swap';
import { DexAggregator } from '../DexAggregator';
import { Api, } from './swagger/oneInchApi';
const SUPPORTED_ONE_INCH_CHAINS = [
    1, 56, 137, 10, 42161, 100, 43114, 250, 8217, 1313161554,
];
const numberToSupportedChainId = (n) => {
    if (SUPPORTED_ONE_INCH_CHAINS.includes(n)) {
        return n;
    }
    throw new Error(`Unsupported chain ID: ${n}`);
};
/**
 * Instantiates the 1inch API from the generated swagger file. We have edited the file such that it is
 * generic for all chains.
 * @param baseUrl
 * @param chainId
 * @returns
 */
export const createV5Api = (baseUrl = 'https://api.1inch.io', chainId = 1) => {
    const chainApiUrl = new URL(new URL(baseUrl).origin);
    chainApiUrl.pathname = `/v5.0/${chainId}`;
    const api = new Api({
        baseUrl: chainApiUrl.toString(),
    });
    return {
        quote: async (inputQrt, output) => {
            const out = await api.v50.exchangeControllerGetQuote({
                fromTokenAddress: inputQrt.token.address.address,
                toTokenAddress: output.address.address,
                amount: inputQrt.amount.toString(),
            });
            return out;
        },
        swap: async (fromAddress, toAddress, inputQty, output, slippage) => {
            const params = {
                fromAddress: fromAddress.address,
                fromTokenAddress: inputQty.token.address.address,
                toTokenAddress: output.address.address,
                destReceiver: toAddress.address,
                slippage,
                amount: inputQty.amount.toString(),
                disableEstimate: true,
            };
            const out = await api.v50.exchangeControllerGetSwap(params);
            return out;
        },
    };
};
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 5,
    retryDelay: 1000,
    backoff: 'CONST',
    timeout: 6000,
    onRetry: async () => 'CONTINUE',
};
let _id = 0;
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
export const createOneInchDexAggregator = (universe, config) => {
    const chainIdToUse = numberToSupportedChainId(config?.chainId ?? universe.chainId);
    const api = createV5Api(config?.baseUrl ?? 'https://api.1inch.io', chainIdToUse);
    const resolved = { ...(config?.retryConfig ?? DEFAULT_RETRY_CONFIG) };
    const retryConfig = {
        ...resolved,
        onRetry: async (e) => {
            if ('statusCode' in e &&
                'error' in e &&
                'message' in e.error &&
                'meta' in e.error) {
                return resolved.onRetry(e);
            }
            return 'RETURN';
        },
    };
    const aggregatorName = `aggregator.1inch.${_id++}.${chainIdToUse}`;
    return new DexAggregator(aggregatorName, async (user, destination, input, output, slippage) => {
        return await retryLoop(async () => {
            const resp = await api.swap(user, destination, input, output, slippage);
            if (resp.error != null) {
                throw resp.error;
            }
            return await new SwapPlan(universe, [
                OneInchAction.createAction(universe, input.token, output, resp.data, slippage),
            ]).quote([input], destination);
        }, retryConfig);
    });
};
//# sourceMappingURL=oneInchRegistry.js.map