import { Address, Token, TokenQuantity } from '..'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { SwapPlan } from '../searcher/Swap'
import { DexRouter, TradingVenue } from './DexAggregator'

import { Approval } from '../base/Approval'
import { ZapperExecutor__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'
import { ChainIds } from '../configuration/ReserveAddresses'
import { hexlify, hexZeroPad } from 'ethers/lib/utils'
import { parseHexStringIntoBuffer } from '../base/utils'
import { createDisabledParisTable } from './createDisabledParisTable'

export interface GetRoute {
  code: number
  message: string
  requestId: string
  data: {
    routeSummary: {
      tokenIn: string
      amountIn: string
      amountInUsd: string
      tokenInMarketPriceAvailable: boolean
      tokenOut: string
      amountOut: string
      amountOutUsd: string
      tokenOutMarketPriceAvailable: boolean
      gas: string
      gasPrice: string
      gasUsd: string
      extraFee: {
        feeAmount: string
        chargeFeeBy: string
        isInBps: boolean
        feeReceiver: string
      }
      route: Array<{
        pool: string
        tokenIn: string
        tokenOut: string
        limitReturnAmount: string
        swapAmount: string
        amountOut: string
        exchange: string
        poolLength: number
        poolType: string
        poolExtra: null
        extra: any
      }>[]
    }
    routerAddress: string
  }
}

export interface SwapResult {
  data: {
    amountIn: string
    amountInUsd: string
    amountOut: string
    amountOutUsd: string
    gas: string
    gasUsd: string
    outputChange: {
      amount: string
      percent: number
      level: number
    }
    data: string
    routerAddress: string
  }
}

export interface KyberswapAggregatorResult {
  block: number
  req: GetRoute
  quantityIn: TokenQuantity
  output: Token
  swap: SwapResult
  slippage: bigint
  addresesInUse: Set<Address>
}

const idToSlug: Record<number, string> = {
  [ChainIds.Mainnet]: 'ethereum',
  [ChainIds.Base]: 'base',
  [ChainIds.Arbitrum]: 'arbitrum',
}

const fetchRoute = async (
  abort: AbortSignal,
  universe: Universe,
  quantityIn: TokenQuantity,
  tokenOut: Token
) => {
  const GET_ROUTE_SWAP = `https://aggregator-api.kyberswap.com/${
    idToSlug[universe.chainId]
  }/api/v1/routes`
  const url = `${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`

  return fetch(url, {
    method: 'GET',
    signal: abort,
    headers: {
      'x-client-id': 'register',
    },
  }).then((res) => res.json()) as Promise<GetRoute>
}
const fetchSwap = async (
  abort: AbortSignal,
  universe: Universe,
  req: GetRoute,
  recipient: Address,
  slippage: bigint
) => {
  const POST_GET_SWAP = `https://aggregator-api.kyberswap.com/${
    idToSlug[universe.chainId]
  }/api/v1/route/build`

  return fetch(`${POST_GET_SWAP}?source=register`, {
    method: 'POST',
    signal: abort,
    body: JSON.stringify({
      ...req.data,
      sender: universe.execAddress.address,
      recipient: recipient.address,
      skipSimulateTx: true,
      slippageTolerance: Number(slippage),
      source: 'register',
    }),
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': 'register',
    },
  }).then((res) => res.json() as Promise<SwapResult>)
}

const getQuoteAndSwap = async (
  abort: AbortSignal,
  universe: Universe,
  quantityIn: TokenQuantity,
  tokenOut: Token,
  _: Address,
  slippage: bigint
): Promise<KyberswapAggregatorResult> => {
  const dest = universe.execAddress

  const req = await fetchRoute(abort, universe, quantityIn, tokenOut)
  const swap = await fetchSwap(abort, universe, req, dest, slippage * 10n)

  if (req.data.routeSummary == null) {
    console.log(req.data)
    throw new Error('Kyberswap: Failed to fetch route')
  }
  const addrs = new Set(
    req.data.routeSummary.route
      .map((i) => {
        const out = i.map((ii) => {
          try {
            if (!ii.pool.startsWith('0x')) {
              const tok1 = Address.from(ii.tokenIn)
              const tok2 = Address.from(ii.tokenOut)

              const [a, b] = tok1.gt(tok2) ? [tok1, tok2] : [tok2, tok1]
              const mix = parseHexStringIntoBuffer(
                hexZeroPad(
                  '0x' + (a.integer ^ b.integer).toString(16),
                  20
                ).toLowerCase()
              )
              const custom = Address.from(mix)
              return custom
            }
            return Address.from(ii.pool.toLowerCase())
          } catch (e) {
            console.log(e)
            console.log(ii.pool)
            return universe.wrappedNativeToken.address
          }
        })

        return out
      })
      .flat()
      .filter((i) => {
        const tok = universe.tokens.get(i)
        if (!tok) {
          return true
        }
        return universe.lpTokens.has(tok)
      })
  )
  return {
    block: universe.currentBlock,
    quantityIn,
    output: tokenOut,
    swap,
    req,
    addresesInUse: addrs,
    slippage,
  }
}

class KyberAction extends Action('Kyberswap') {
  public get oneUsePrZap() {
    return true
  }
  public get returnsOutput() {
    return false
  }
  public get addressesInUse() {
    return this.request.addresesInUse
  }
  get outputSlippage() {
    return 30n
  }

  async plan(
    planner: Planner,
    _: Value[],
    __: Address,
    predicted: TokenQuantity[]
  ) {
    try {
      const zapperLib = this.universe.weirollZapperExecContract
      const minOut = await this.quoteWithSlippage(predicted)
      planner.add(
        zapperLib.rawCall(
          this.request.req.data.routerAddress,
          0,
          this.request.swap.data.data
        ),

        `kyberswap,router=${
          this.request.swap.data.routerAddress
        },swap=${predicted.join(', ')} -> ${minOut.join(', ')},pools=${[
          ...this.request.addresesInUse,
        ].join(', ')}`
      )
      return null
    } catch (e: any) {
      console.log(e.stack)
      throw e
    }
  }
  constructor(
    public readonly request: KyberswapAggregatorResult,
    public readonly universe: Universe
  ) {
    super(
      Address.from(request.req.data.routerAddress),
      [request.quantityIn.token],
      [request.output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          request.quantityIn.token,
          Address.from(request.req.data.routerAddress)
        ),
      ]
    )
  }
  public get supportsDynamicInput() {
    return false
  }
  get outputQty() {
    return this.request.output.from(
      BigInt(this.request.req.data.routeSummary.amountOut)
    )
  }
  toString() {
    return `Kyberswap(${this.request.quantityIn} => ${this.outputQty})`
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQty]
  }
  gasEstimate(): bigint {
    return BigInt(this.request.req.data.routeSummary.gas)
  }
}

const disabledPairs = createDisabledParisTable()

disabledPairs.define(
  1,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xdac17f958d2ee523a2206206994597c13d831ec7'
)
disabledPairs.define(
  1,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
)
disabledPairs.define(
  1,
  '0x6b175474e89094c44da98b954eedeac495271d0f',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
)
disabledPairs.define(
  1,
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6'
)
disabledPairs.define(
  1,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xdac17f958d2ee523a2206206994597c13d831ec7'
)

export const createKyberswap = (aggregatorName: string, universe: Universe) => {
  if (idToSlug[universe.chainId] == null) {
    throw new Error('Kyberswap: Unsupported chain')
  }

  const dex = new DexRouter(
    aggregatorName,
    async (abort, input, output, slippage) => {
      if (universe.rTokensInfo.tokens.has(output)) {
        throw new Error('Kyberswap: Output token is RToken')
      }
      if (universe.rTokensInfo.tokens.has(input.token)) {
        throw new Error('Kyberswap: Input token is RToken')
      }

      if (disabledPairs.isDisabled(universe.chainId, input, output)) {
        throw new Error('Kyberswap: Pair disabled')
      }
      const req = await getQuoteAndSwap(
        abort,
        universe,
        input,
        output,
        universe.execAddress,
        slippage
      )
      if (req.swap.data == null || req.swap.data.data == null) {
        throw new Error('Kyberswap: No swap data')
      }
      return await new SwapPlan(universe, [
        new KyberAction(req, universe),
      ]).quote([input], universe.execAddress)
    },
    false
  ).withMaxConcurrency(10)

  return new TradingVenue(universe, dex)
}
