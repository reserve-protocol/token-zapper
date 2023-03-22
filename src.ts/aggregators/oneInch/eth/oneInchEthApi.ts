/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApproveSpenderResponseDto {
  /** Address of the 1inch router that must be trusted to spend funds for the exchange */
  address: string
}

export interface ApproveCalldataResponseDto {
  /** The encoded data to call the approve method on the swapped token contract */
  data: string
  /** Gas price for fast transaction processing */
  gasPrice: string
  /**
   * Token address that will be allowed to exchange through 1inch router
   * @example "0x6b175474e89094c44da98b954eedeac495271d0f"
   */
  to: string
  /** Native token value in WEI (for approve is always 0) */
  value: string
}

export interface TokenDto {
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
}

export interface TokensResponseDto {
  /** List of supported tokens */
  tokens: TokenDto[]
}

export interface ProtocolImageDto {
  /** Protocol id */
  id: string
  /** Protocol title */
  title: string
  /** Protocol logo image */
  img: string
  /** Protocol logo image in color */
  img_color: string
}

export interface ProtocolsResponseDto {
  /** List of protocols that are available for routing in the 1inch Aggregation protocol */
  protocols: ProtocolImageDto[]
}

export interface PathViewDto {
  name: string
  part: number
  fromTokenAddress: string
  toTokenAddress: string
}

export interface QuoteResponseDto {
  /** Source token info */
  fromToken: TokenDto
  /** Destination token info */
  toToken: TokenDto
  /** Expected amount of destination token */
  toTokenAmount: string
  /** Amount of source token */
  fromTokenAmount: string
  /** Selected protocols in a path */
  protocols: PathViewDto[]
  estimatedGas: number
}

export interface NestErrorMeta {
  /**
   * Type of field
   * @example "fromTokenAddress"
   */
  type: string
  /**
   * Value of field
   * @example "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
   */
  value: object
}

export interface SwapErrorDto {
  /**
   * HTTP code
   * @example 400
   */
  statusCode: number
  /**
   * Error code description
   * @example "Bad Request"
   */
  error: string
  /** Error description (one of the following) */
  description: string
  /** Request id */
  requestId: string
  /** Meta information */
  meta: NestErrorMeta[]
}

export interface Tx {
  from: string
  to: string
  data: string
  value: string
  gasPrice: string
  gas: string
}

export interface SwapResponseDto {
  /** Source token info */
  fromToken: TokenDto
  /** Destination token info */
  toToken: TokenDto
  /** Expected amount of destination token */
  toTokenAmount: string
  /** Amount of source token */
  fromTokenAmount: string
  /** Selected protocols in a path */
  protocols: string[]
  /** Transaction object */
  tx: Tx
}

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = ''
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body == null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      if (!response.ok) throw data
      return data
    })
  }
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
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v50 = {
    /**
     * No description
     *
     * @tags Healthcheck
     * @name FactoryHealthCheckControllerHealthcheck
     * @summary API health check
     * @request GET:/v5.0/1/healthcheck
     */
    factoryHealthCheckControllerHealthcheck: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/v5.0/1/healthcheck`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approve
     * @name ChainApproveControllerGetSpender
     * @summary Address of the 1inch router that must be trusted to spend funds for the exchange
     * @request GET:/v5.0/1/approve/spender
     */
    chainApproveControllerGetSpender: (params: RequestParams = {}) =>
      this.request<ApproveSpenderResponseDto, any>({
        path: `/v5.0/1/approve/spender`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approve
     * @name ChainApproveControllerGetCallData
     * @summary Generate data for calling the contract in order to allow the 1inch router to spend funds
     * @request GET:/v5.0/1/approve/transaction
     */
    chainApproveControllerGetCallData: (
      query: {
        /**
         * Token address you want to exchange
         * @example "0x111111111117dc0aa78b770fa6a738034120c302"
         */
        tokenAddress: string
        /**
         * The number of tokens that the 1inch router is allowed to spend.If not specified, it will be allowed to spend an infinite amount of tokens.
         * @example "100000000000"
         */
        amount?: string
      },
      params: RequestParams = {},
    ) =>
      this.request<ApproveCalldataResponseDto, any>({
        path: `/v5.0/1/approve/transaction`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Approve
     * @name ChainApproveControllerGetAllowance
     * @summary Get the number of tokens that the 1inch router is allowed to spend
     * @request GET:/v5.0/1/approve/allowance
     */
    chainApproveControllerGetAllowance: (
      query: {
        /**
         * Token address you want to exchange
         * @example "0x111111111117dc0aa78b770fa6a738034120c302"
         */
        tokenAddress: string
        /** Wallet address for which you want to check */
        walletAddress: string
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/v5.0/1/approve/allowance`,
        method: 'GET',
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Info
     * @name ChainTokensControllerGetTokens
     * @summary List of tokens that are available for swap in the 1inch Aggregation protocol
     * @request GET:/v5.0/1/tokens
     */
    chainTokensControllerGetTokens: (params: RequestParams = {}) =>
      this.request<TokensResponseDto, any>({
        path: `/v5.0/1/tokens`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Info
     * @name ChainPresetsControllerGetPresets
     * @summary List of preset configurations for the 1inch router
     * @request GET:/v5.0/1/presets
     */
    chainPresetsControllerGetPresets: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/v5.0/1/presets`,
        method: 'GET',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Info
     * @name ChainProtocolsControllerGetProtocolsImages
     * @summary List of liquidity sources that are available for routing in the 1inch Aggregation protocol
     * @request GET:/v5.0/1/liquidity-sources
     */
    chainProtocolsControllerGetProtocolsImages: (params: RequestParams = {}) =>
      this.request<ProtocolsResponseDto, any>({
        path: `/v5.0/1/liquidity-sources`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Swap
     * @name ExchangeControllerGetQuote
     * @summary Find the best quote to exchange via 1inch router
     * @request GET:/v5.0/1/quote
     */
    exchangeControllerGetQuote: (
      query: {
        /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
        fromTokenAddress: string
        /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
        toTokenAddress: string
        /** @example "10000000000000000" */
        amount: string
        /** default: all */
        protocols?: string
        /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
        fee?: string
        gasLimit?: any
        /** max: 5; !should be the same for quote and swap! */
        connectorTokens?: any
        /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
        complexityLevel?: any
        /** default: 10; max: 50  !should be the same for quote and swap! */
        mainRouteParts?: any
        /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
        parts?: any
        /** default: fast from network */
        gasPrice?: any
      },
      params: RequestParams = {},
    ) =>
      this.request<QuoteResponseDto, SwapErrorDto>({
        path: `/v5.0/1/quote`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags Swap
     * @name ExchangeControllerGetSwap
     * @summary Generate data for calling the 1inch router for exchange
     * @request GET:/v5.0/1/swap
     */
    exchangeControllerGetSwap: (
      query: {
        /** @example "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" */
        fromTokenAddress: string
        /** @example "0x111111111117dc0aa78b770fa6a738034120c302" */
        toTokenAddress: string
        /** @example "10000000000000000" */
        amount: string
        /** The address that calls the 1inch contract */
        fromAddress: string
        /**
         * min: 0; max: 50;
         * @example 1
         */
        slippage: number
        /** default: all */
        protocols?: string
        /** Receiver of destination currency. default: fromAddress */
        destReceiver?: string
        referrerAddress?: string
        /** Min: 0; max: 3; Max: 0; max: 3; default: 0;  !should be the same for quote and swap! */
        fee?: string
        disableEstimate?: boolean
        /** https://eips.ethereum.org/EIPS/eip-2612 */
        permit?: string
        /** Allows to build calldata without optimized routers */
        compatibilityMode?: boolean
        /** default: false; Suggest to check user's balance and allowance before set this flag; CHI should be approved to spender address */
        burnChi?: boolean
        allowPartialFill?: boolean
        /** split parts. default: 50;  max: 100!should be the same for quote and swap! */
        parts?: any
        /** default: 10; max: 50  !should be the same for quote and swap! */
        mainRouteParts?: any
        /** max: 5; !should be the same for quote and swap! */
        connectorTokens?: any
        /** min: 0; max: 3; default: 2; !should be the same for quote and swap! */
        complexityLevel?: any
        gasLimit?: any
        /** default: fast from network */
        gasPrice?: any
      },
      params: RequestParams = {},
    ) =>
      this.request<SwapResponseDto, SwapErrorDto>({
        path: `/v5.0/1/swap`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  }
}
