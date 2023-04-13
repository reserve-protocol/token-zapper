"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.HttpClient = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType = exports.ContentType || (exports.ContentType = {}));
class HttpClient {
    baseUrl = '';
    securityData = null;
    securityWorker;
    abortControllers = new Map();
    customFetch = (...fetchParams) => fetch(...fetchParams);
    baseApiParams = {
        credentials: 'same-origin',
        headers: {},
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    };
    constructor(apiConfig = {}) {
        Object.assign(this, apiConfig);
    }
    setSecurityData = (data) => {
        this.securityData = data;
    };
    encodeQueryParam(key, value) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
    }
    addQueryParam(query, key) {
        return this.encodeQueryParam(key, query[key]);
    }
    addArrayQueryParam(query, key) {
        const value = query[key];
        return value.map((v) => this.encodeQueryParam(key, v)).join('&');
    }
    toQueryString(rawQuery) {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
        return keys
            .map((key) => Array.isArray(query[key])
            ? this.addArrayQueryParam(query, key)
            : this.addQueryParam(query, key))
            .join('&');
    }
    addQueryParams(rawQuery) {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : '';
    }
    contentFormatters = {
        [ContentType.Json]: (input) => input !== null && (typeof input === 'object' || typeof input === 'string')
            ? JSON.stringify(input)
            : input,
        [ContentType.Text]: (input) => input !== null && typeof input !== 'string'
            ? JSON.stringify(input)
            : input,
        [ContentType.FormData]: (input) => Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            formData.append(key, property instanceof Blob
                ? property
                : typeof property === 'object' && property !== null
                    ? JSON.stringify(property)
                    : `${property}`);
            return formData;
        }, new FormData()),
        [ContentType.UrlEncoded]: (input) => this.toQueryString(input),
    };
    mergeRequestParams(params1, params2) {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }
    createAbortSignal = (cancelToken) => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                return abortController.signal;
            }
            return void 0;
        }
        const abortController = new AbortController();
        this.abortControllers.set(cancelToken, abortController);
        return abortController.signal;
    };
    abortRequest = (cancelToken) => {
        const abortController = this.abortControllers.get(cancelToken);
        if (abortController) {
            abortController.abort();
            this.abortControllers.delete(cancelToken);
        }
    };
    request = async ({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }) => {
        const secureParams = ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
            this.securityWorker &&
            (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const queryString = query && this.toQueryString(query);
        const payloadFormatter = this.contentFormatters[type || ContentType.Json];
        const responseFormat = format || requestParams.format;
        return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData
                    ? { 'Content-Type': type }
                    : {}),
            },
            signal: cancelToken
                ? this.createAbortSignal(cancelToken)
                : requestParams.signal,
            body: typeof body === 'undefined' || body == null
                ? null
                : payloadFormatter(body),
        }).then(async (response) => {
            const r = response;
            r.data = null;
            r.error = null;
            const data = !responseFormat
                ? r
                : await response[responseFormat]()
                    .then((data) => {
                    if (r.ok) {
                        r.data = data;
                    }
                    else {
                        r.error = data;
                    }
                    return r;
                })
                    .catch((e) => {
                    r.error = e;
                    return r;
                });
            if (cancelToken) {
                this.abortControllers.delete(cancelToken);
            }
            if (!response.ok)
                throw data;
            return data;
        });
    };
}
exports.HttpClient = HttpClient;
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
class Api extends HttpClient {
    v50 = {
        /**
         * No description
         *
         * @tags Healthcheck
         * @name FactoryHealthCheckControllerHealthcheck
         * @summary API health check
         * @request GET:/healthcheck
         */
        factoryHealthCheckControllerHealthcheck: (params = {}) => this.request({
            path: `/healthcheck`,
            method: 'GET',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Approve
         * @name ChainApproveControllerGetSpender
         * @summary Address of the 1inch router that must be trusted to spend funds for the exchange
         * @request GET:/approve/spender
         */
        chainApproveControllerGetSpender: (params = {}) => this.request({
            path: `/approve/spender`,
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
         * @request GET:/approve/transaction
         */
        chainApproveControllerGetCallData: (query, params = {}) => this.request({
            path: `/approve/transaction`,
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
         * @request GET:/approve/allowance
         */
        chainApproveControllerGetAllowance: (query, params = {}) => this.request({
            path: `/approve/allowance`,
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
         * @request GET:/tokens
         */
        chainTokensControllerGetTokens: (params = {}) => this.request({
            path: `/tokens`,
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
         * @request GET:/presets
         */
        chainPresetsControllerGetPresets: (params = {}) => this.request({
            path: `/presets`,
            method: 'GET',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Info
         * @name ChainProtocolsControllerGetProtocolsImages
         * @summary List of liquidity sources that are available for routing in the 1inch Aggregation protocol
         * @request GET:/liquidity-sources
         */
        chainProtocolsControllerGetProtocolsImages: (params = {}) => this.request({
            path: `/liquidity-sources`,
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
         * @request GET:/quote
         */
        exchangeControllerGetQuote: (query, params = {}) => this.request({
            path: `/quote`,
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
         * @request GET:/swap
         */
        exchangeControllerGetSwap: (query, params = {}) => this.request({
            path: `/swap`,
            method: 'GET',
            query: query,
            format: 'json',
            ...params,
        }),
    };
}
exports.Api = Api;
//# sourceMappingURL=oneInchApi.js.map