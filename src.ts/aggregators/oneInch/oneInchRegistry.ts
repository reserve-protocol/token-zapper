// import { OneInchAction } from '../../action/OneInch'
// import { type Address } from '../../base/Address'
// import {
//   type OnRetryFunctionReturn,
//   type RetryLoopConfig,
//   wait,
// } from '../../base/controlflow'
// import { type Token, type TokenQuantity } from '../../entities/Token'
// import { SwapPath, SwapPlan } from '../../searcher/Swap'
// import { type Universe } from '../../Universe'
// import { DexRouter } from '../DexAggregator'
// export { DexRouter as DexAggregator } from '../DexAggregator'
// import {
//   Api,
//   type HttpResponse,
//   type QuoteResponseDto,
//   type SwapErrorDto,
//   type SwapResponseDto,
// } from './swagger/oneInchApi'

// export type OneInchQuoteResponse = QuoteResponseDto
// export type OneInchSwapResponse = SwapResponseDto
// export interface IOneInchRouter {
//   quote: (
//     inputToken: TokenQuantity,
//     outputToken: Token
//   ) => Promise<HttpResponse<QuoteResponseDto, SwapErrorDto>>
//   swap: (
//     fromAddress: Address,
//     toAddress: Address,
//     inputToken: TokenQuantity,
//     outputToken: Token,
//     slippage: number
//   ) => Promise<HttpResponse<SwapResponseDto, SwapErrorDto>>
// }

// const SUPPORTED_ONE_INCH_CHAINS = [
//   1, 56, 137, 10, 42161, 100, 43114, 250, 8217, 1313161554, 31337, 8453
// ] as const
// type SupportedChainIDSTupleType = typeof SUPPORTED_ONE_INCH_CHAINS
// type SupportedOneInchChains = keyof {
//   [K in SupportedChainIDSTupleType[number]]: K
// }
// const numberToSupportedChainId = (n: number): SupportedOneInchChains => {
//   if (n === 31337) {
//     return 1
//   }
//   if (SUPPORTED_ONE_INCH_CHAINS.includes(n as SupportedOneInchChains)) {
//     return n as SupportedOneInchChains
//   }
//   throw new Error(`Unsupported chain ID: ${n}`)
// }
// /**
//  * Instantiates the 1inch API from the generated swagger file. We have edited the file such that it is
//  * generic for all chains.
//  * @param baseUrl
//  * @param chainId
//  * @returns
//  */
// export const createV5Api = (
//   baseUrl: string = 'https://api.1inch.io/swap',
//   chainId: SupportedOneInchChains = 1
// ): IOneInchRouter => {
//   const chainApiUrl = new URL(new URL(baseUrl).origin)
//   chainApiUrl.pathname = `/swap/v5.2/${chainId}`

//   const api = new Api({
//     baseUrl: chainApiUrl.toString(),
//   })

//   return {
//     quote: async (inputQrt, output) => {
//       const out = await api.v50.exchangeControllerGetQuote({
//         fromTokenAddress: inputQrt.token.address.address,
//         toTokenAddress: output.address.address,
//         amount: inputQrt.amount.toString(),
//       })

//       return out
//     },
//     swap: async (fromAddress, toAddress, inputQty, output, slippage) => {
//       const params = {
//         fromAddress: fromAddress.address,
//         fromTokenAddress: inputQty.token.address.address,
//         toTokenAddress: output.address.address,
//         destReceiver: toAddress.address,
//         slippage,
//         amount: inputQty.amount.toString(),
//         disableEstimate: true,
//       }
//       const out = await api.v50.exchangeControllerGetSwap(params)

//       return out
//     },
//   }
// }

// interface OneInchRetryConfig extends Omit<RetryLoopConfig, 'onRetry'> {
//   onRetry: (error: SwapErrorDto) => Promise<OnRetryFunctionReturn>
// }

// interface OneInchConfig {
//   baseUrl: string
//   chainId: SupportedOneInchChains
//   retryConfig: OneInchRetryConfig
// }

// const DEFAULT_RETRY_CONFIG: OneInchRetryConfig = {
//   maxRetries: 5,
//   retryDelay: 1000,
//   backoff: 'CONST',
//   timeout: 6000,
//   onRetry: async () => 'CONTINUE',
// }

// let _id = 0
// /**
//  * @param baseUrl Should be 'https://api.1inch.io', or proxy url.
//  *                We append /v5.0/{chainId} to this url, and the swagger file is appending the rest of the path.
//  * @param config The configuration is optional, and will default to the values below:
//  * @param config.chainId The chain ID to use. Defaults to the chain ID of the universe.
//  * @param config.baseUrl The base url to use. Defaults to 'https://api.1inch.io'.
//  * @param config.retryConfig The retry configuration to use. Defaults to { maxRetries: 3, delay: 500, backoff: "CONST" }. See retryLoop.
//  * @note The currently supported chain IDs are: 1, 56, 137, 10, 42161, 100, 43114, 250, 8217, 1313161554
//  * @note does not add the aggregator to the universe, see example.
//  * @see https://docs.1inch.io/docs/aggregation-protocol/api/swagger/
//  * @returns A DexAggregator that uses the 1inch API.
//  * @throws @OneInchError if the 1inch API returns an error. By default retry behavior will ignore the error and keep retrying.
//  *
//  * @example
//  * // Creates an 1inch aggregator for the network of the universe instance.
//  * const oneInchAggregator = createOneInchDexAggregator(universe)
//  * universe.dexAggregators.push(oneInchAggregator)
//  */
// export const createOneInchDexAggregator = (
//   universe: Universe,
//   config?: Readonly<Partial<OneInchConfig>>
// ) => {
//   const chainIdToUse = numberToSupportedChainId(
//     config?.chainId ?? universe.chainId
//   )
//   const api = createV5Api(
//     config?.baseUrl ?? 'https://api.1inch.io',
//     chainIdToUse
//   )

//   const aggregatorName = `aggregator.1inch.${_id++}.${chainIdToUse}`

//   let queue: (() => Promise<void>)[] = []
//   let dequeing = false
//   const resolveQueue = async () => {
//     if (dequeing) {
//       return
//     }
//     dequeing = true
//     while (queue.length != 0) {
//       const task = queue.pop()!
//       try {
//         await task()
//         await wait(1000)
//       } catch (e) {}
//     }
//     dequeing = false
//   }
//   return new DexRouter(
//     aggregatorName,
//     async (user, destination, input, output, slippage) => {
//       const out = new Promise<SwapPath>((resolve, reject) => {
//         queue.push(async () => {
//           const resp = await api.swap(
//             user,
//             destination,
//             input,
//             output,
//             slippage
//           )
//           if (resp.error != null) {
//             reject(resp.error)
//           }
//           resolve(
//             await new SwapPlan(universe, [
//               OneInchAction.createAction(
//                 universe,
//                 input.token,
//                 output,
//                 resp.data,
//                 slippage
//               ),
//             ]).quote([input], destination)
//           )
//         })
//       })
//       resolveQueue()
//       return await out
//     }
//   )
// }
