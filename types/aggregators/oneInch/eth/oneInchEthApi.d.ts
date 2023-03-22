export interface ApproveSpenderResponseDto {
    /** Address of the 1inch router that must be trusted to spend funds for the exchange */
    address: string;
}
export interface ApproveCalldataResponseDto {
    /** The encoded data to call the approve method on the swapped token contract */
    data: string;
    /** Gas price for fast transaction processing */
    gasPrice: string;
    /**
     * Token address that will be allowed to exchange through 1inch router
     * @example "0x6b175474e89094c44da98b954eedeac495271d0f"
     */
    to: string;
    /** Native token value in WEI (for approve is always 0) */
    value: string;
}
export interface TokenDto {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI: string;
}
export interface TokensResponseDto {
    /** List of supported tokens */
    tokens: TokenDto[];
}
export interface ProtocolImageDto {
    /** Protocol id */
    id: string;
    /** Protocol title */
    title: string;
    /** Protocol logo image */
    img: string;
    /** Protocol logo image in color */
    img_color: string;
}
export interface ProtocolsResponseDto {
    /** List of protocols that are available for routing in the 1inch Aggregation protocol */
    protocols: ProtocolImageDto[];
}
export interface PathViewDto {
    name: string;
    part: number;
    fromTokenAddress: string;
    toTokenAddress: string;
}
export interface QuoteResponseDto {
    /** Source token info */
    fromToken: TokenDto;
    /** Destination token info */
    toToken: TokenDto;
    /** Expected amount of destination token */
    toTokenAmount: string;
    /** Amount of source token */
    fromTokenAmount: string;
    /** Selected protocols in a path */
    protocols: PathViewDto[];
    estimatedGas: number;
}
export interface NestErrorMeta {
    /**
     * Type of field
     * @example "fromTokenAddress"
     */
    type: string;
    /**
     * Value of field
     * @example "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
     */
    value: object;
}
export interface SwapErrorDto {
    /**
     * HTTP code
     * @example 400
     */
    statusCode: number;
    /**
     * Error code description
     * @example "Bad Request"
     */
    error: string;
    /** Error description (one of the following) */
    description: string;
    /** Request id */
    requestId: string;
    /** Meta information */
    meta: NestErrorMeta[];
}
export interface Tx {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
}
export interface SwapResponseDto {
    /** Source token info */
    fromToken: TokenDto;
    /** Destination token info */
    toToken: TokenDto;
    /** Expected amount of destination token */
    toTokenAmount: string;
    /** Amount of source token */
    fromTokenAmount: string;
    /** Selected protocols in a path */
    protocols: string[];
    /** Transaction object */
    tx: Tx;
}
export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;
export interface FullRequestParams extends Omit<RequestInit, 'body'> {
    /** set parameter to `true` for call `securityWorker` for this request */
    secure?: boolean;
    /** request path */
    path: string;
    /** content type of request body */
    type?: ContentType;
    /** query params */
    query?: QueryParamsType;
    /** format of response (i.e. response.json() -> format: "json") */
    format?: ResponseFormat;
    /** request body */
    body?: unknown;
    /** base url */
    baseUrl?: string;
    /** request cancellation token */
    cancelToken?: CancelToken;
}
export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;
export interface ApiConfig<SecurityDataType = unknown> {
    baseUrl?: string;
    baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
    securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
    customFetch?: typeof fetch;
}
export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
    data: D;
    error: E;
}
type CancelToken = Symbol | string | number;
export declare enum ContentType {
    Json = "application/json",
    FormData = "multipart/form-data",
    UrlEncoded = "application/x-www-form-urlencoded",
    Text = "text/plain"
}
export declare class HttpClient<SecurityDataType = unknown> {
    baseUrl: string;
    private securityData;
    private securityWorker?;
    private abortControllers;
    private customFetch;
    private baseApiParams;
    constructor(apiConfig?: ApiConfig<SecurityDataType>);
    setSecurityData: (data: SecurityDataType | null) => void;
    protected encodeQueryParam(key: string, value: any): string;
    protected addQueryParam(query: QueryParamsType, key: string): string;
    protected addArrayQueryParam(query: QueryParamsType, key: string): any;
    protected toQueryString(rawQuery?: QueryParamsType): string;
    protected addQueryParams(rawQuery?: QueryParamsType): string;
    private contentFormatters;
    protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams;
    protected createAbortSignal: (cancelToken: CancelToken) => AbortSignal | undefined;
    abortRequest: (cancelToken: CancelToken) => void;
    request: <T = any, E = any>({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }: FullRequestParams) => Promise<HttpResponse<T, E>>;
}
/**
 * @title 1inch Aggregation protocol API
 * @version 5.0
 * @contact
 *
 *
 * <h2>Ethereum Network</h2>
 * Using 1inch Aggregation protocol API, you can find the best route to exchange assets and make the exchange.
 * <br><br>
 * Step by step:
 * 1. Lookup addresses of tokens you want to swap, for example ‘0xxx’ , ‘0xxxx’ for DAI -> 1INCH
 * 2. Check for allowance of 1inch router contract to spend source asset (/approve/allowance)
 * 3. If necessary, give approval for 1inch router to spend source token (/approve/transaction)
 * 4. Monitor the best exchange route using (/quote)
 * 5. When you ready use to perform swap (/swap)
 *
 */
export declare class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
    v50: {
        /**
         * No description
         *
         * @tags Healthcheck
         * @name FactoryHealthCheckControllerHealthcheck
         * @summary API health check
         * @request GET:/v5.0/1/healthcheck
         */
        factoryHealthCheckControllerHealthcheck: (params?: RequestParams) => Promise<HttpResponse<void, any>>;
        /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetSpender
         * @summary Address of the 1inch router that must be trusted to spend funds for the exchange
         * @request GET:/v5.0/1/approve/spender
         */
        chainApproveControllerGetSpender: (params?: RequestParams) => Promise<HttpResponse<ApproveSpenderResponseDto, any>>;
        /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetCallData
         * @summary Generate data for calling the contract in order to allow the 1inch router to spend funds
         * @request GET:/v5.0/1/approve/transaction
         */
        chainApproveControllerGetCallData: (query: {
            /**
             * Token address you want to exchange
             * @example "0x111111111117dc0aa78b770fa6a738034120c302"
             */
            tokenAddress: string;
            /**
             * The number of tokens that the 1inch router is allowed to spend.If not specified, it will be allowed to spend an infinite amount of tokens.
             * @example "100000000000"
             */
            amount?: string;
        }, params?: RequestParams) => Promise<HttpResponse<ApproveCalldataResponseDto, any>>;
        /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetAllowance
         * @summary Get the number of tokens that the 1inch router is allowed to spend
         * @request GET:/v5.0/1/approve/allowance
         */
        chainApproveControllerGetAllowance: (query: {
            /**
             * Token address you want to exchange
             * @example "0x111111111117dc0aa78b770fa6a738034120c302"
             */
            tokenAddress: string;
            /** Wallet address for which you want to check */
            walletAddress: string;
        }, params?: RequestParams) => Promise<HttpResponse<void, any>>;
        /**
         * No description
         *
         * @tags Info
         * @name ChainTokensControllerGetTokens
         * @summary List of tokens that are available for swap in the 1inch Aggregation protocol
         * @request GET:/v5.0/1/tokens
         */
        chainTokensControllerGetTokens: (params?: RequestParams) => Promise<HttpResponse<TokensResponseDto, any>>;
        /**
         * No description
         *
         * @tags Info
         * @name ChainPresetsControllerGetPresets
         * @summary List of preset configurations for the 1inch router
         * @request GET:/v5.0/1/presets
         */
        chainPresetsControllerGetPresets: (params?: RequestParams) => Promise<HttpResponse<void, any>>;
        /**
         * No description
         *
         * @tags Info
         * @name ChainProtocolsControllerGetProtocolsImages
         * @summary List of liquidity sources that are available for routing in the 1inch Aggregation protocol
         * @request GET:/v5.0/1/liquidity-sources
         */
        chainProtocolsControllerGetProtocolsImages: (params?: RequestParams) => Promise<HttpResponse<ProtocolsResponseDto, any>>;
        /**
         * No description
         *
         * @tags Swap
         * @name ExchangeControllerGetQuote
         * @summary Find the best quote to exchange via 1inch router
         * @request GET:/v5.0/1/quote
         */
        exchangeControllerGetQuote: (query: {
            /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
            fromTokenAddress: string;
            /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
            toTokenAddress: string;
            /** @example "10000000000000000" */
            amount: string;
            /** default: all */
            protocols?: string;
            /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
            fee?: string;
            gasLimit?: any;
            /** max: 5; !should be the same for quote and swap! */
            connectorTokens?: any;
            /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
            complexityLevel?: any;
            /** default: 10; max: 50  !should be the same for quote and swap! */
            mainRouteParts?: any;
            /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
            parts?: any;
            /** default: fast from network */
            gasPrice?: any;
        }, params?: RequestParams) => Promise<HttpResponse<QuoteResponseDto, SwapErrorDto>>;
        /**
         * No description
         *
         * @tags Swap
         * @name ExchangeControllerGetSwap
         * @summary Generate data for calling the 1inch router for exchange
         * @request GET:/v5.0/1/swap
         */
        exchangeControllerGetSwap: (query: {
            /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
            fromTokenAddress: string;
            /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
            toTokenAddress: string;
            /** @example "10000000000000000" */
            amount: string;
            /** The address that calls the 1inch contract */
            fromAddress: string;
            /**
             * min: 0; max: 50;
             * @example 1
             */
            slippage: number;
            /** default: all */
            protocols?: string;
            /** Receiver of destination currency. default: fromAddress */
            destReceiver?: string;
            referrerAddress?: string;
            /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
            fee?: string;
            disableEstimate?: boolean;
            /** https://eips.ethereum.org/EIPS/eip-2612 */
            permit?: string;
            /** Allows to build calldata without optimized routers */
            compatibilityMode?: boolean;
            /** default: false; Suggest to check user's balance and allowance before set this flag; CHI should be approved to spender address */
            burnChi?: boolean;
            allowPartialFill?: boolean;
            /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
            parts?: any;
            /** default: 10; max: 50  !should be the same for quote and swap! */
            mainRouteParts?: any;
            /** max: 5; !should be the same for quote and swap! */
            connectorTokens?: any;
            /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
            complexityLevel?: any;
            gasLimit?: any;
            /** default: fast from network */
            gasPrice?: any;
        }, params?: RequestParams) => Promise<HttpResponse<SwapResponseDto, SwapErrorDto>>;
    };
}
export {};
//# sourceMappingURL=oneInchEthApi.d.ts.map