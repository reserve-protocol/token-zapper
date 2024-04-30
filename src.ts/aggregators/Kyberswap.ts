import { Address, Token, TokenQuantity } from '..'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { SwapPlan } from '../searcher/Swap'
import { DexRouter } from './DexAggregator'

import { Approval } from '../base/Approval'
import { ZapperExecutor__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'
import { ChainIds } from '../configuration/ReserveAddresses'

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
  recipient: Address
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
      slippageTolerance: Number(universe.config.defaultInternalTradeSlippage),
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
  recipient: Address,
  slippage: bigint
): Promise<KyberswapAggregatorResult> => {
  const req = await fetchRoute(abort, universe, quantityIn, tokenOut)
  const swap = await fetchSwap(abort, universe, req, recipient)

  return {
    block: universe.currentBlock,
    quantityIn,
    output: tokenOut,
    swap,
    req,
    slippage,
  }
}

class KyberAction extends Action('Kyberswap') {
  get outputSlippage() {
    return BigInt(this.request.slippage)
  }
  async plan(
    planner: Planner,
    _: Value[],
    __: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    try {
      const zapperLib = this.gen.Contract.createContract(
        ZapperExecutor__factory.connect(
          this.universe.config.addresses.executorAddress.address,
          this.universe.provider
        )
      )
      const minOut = await this.quoteWithSlippage(predicted)
      planner.add(
        zapperLib.rawCall(
          this.request.req.data.routerAddress,
          0,
          this.request.swap.data.data
        ),

        `kyberswap,router=${
          this.request.swap.data.routerAddress
        },swap=${predicted.join(', ')} -> ${minOut.join(
          ', '
        )},route=${this.request.req.data.routeSummary.route
          .flat()
          .map((i) => `(${i.poolType})`)
          .join(' -> ')}`
      )
      return this.outputBalanceOf(this.universe, planner)
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
  toString() {
    return `Kyberswap(${this.request.quantityIn} => ${this.request.output})`
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.request.output.from(this.request.req.data.routeSummary.amountOut),
    ]
  }
  gasEstimate(): bigint {
    return BigInt(this.request.req.data.routeSummary.gas)
  }
}

export const createKyberswap = (aggregatorName: string, universe: Universe) => {
  if (idToSlug[universe.chainId] == null) {
    throw new Error('Kyberswap: Unsupported chain')
  }

  return new DexRouter(
    aggregatorName,
    async (abort, _, destination, input, output, slippage) => {
      const req = await getQuoteAndSwap(
        abort,
        universe,
        input,
        output,
        destination,
        slippage
      )
      if (req?.swap?.data?.data == null) {
        throw new Error('Failed')
      }
      return await new SwapPlan(universe, [
        new KyberAction(req, universe),
      ]).quote([input], destination)
    },
    false
  )
}
