import { DexAggregator } from './DexAggregator'
import { SwapPlan } from '../searcher/Swap'
import { Universe } from '../Universe'
import { Address, Token, TokenQuantity } from '..'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { parseHexStringIntoBuffer } from '../base/utils'

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
      }>
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
  req: GetRoute
  quantityIn: TokenQuantity
  output: Token
  swap: SwapResult
}

const idToSlug: Record<number, string> = {
  1: 'ethereum',
  8453: 'base',
}

class KyberAction extends Action {
  constructor(
    public readonly request: KyberswapAggregatorResult,
    public readonly universe: Universe
  ) {
    super(
      Address.from(request.req.data.routerAddress),
      [request.quantityIn.token],
      [request.output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [
        new Approval(
          request.quantityIn.token,
          Address.from(request.req.data.routerAddress)
        ),
      ]
    )
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = this.output[0].from(BigInt(this.request.swap.data.amountOut))
    return [out]
  }
  gasEstimate(): bigint {
    return 200_000n
  }
  async encode(
    inputs: TokenQuantity[],
    __: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(this.request.swap.data.data),
      Address.from(this.request.req.data.routerAddress),
      0n,
      this.gasEstimate(),
      `Kyberswap(${this.address}) (${inputs.join(",")}) -> (${await this.quote(inputs)})`
    )
  }
}

export const createKyberswap = (aggregatorName: string, universe: Universe, slippage: number) => {
  if (idToSlug[universe.chainId] == null) {
    throw new Error('Kyberswap: Unsupported chain')
  }
  const GET_ROUTE_SWAP = `https://aggregator-api.kyberswap.com/${
    idToSlug[universe.chainId]
  }/api/v1/routes`
  const POST_GET_SWAP = `https://aggregator-api.kyberswap.com/${
    idToSlug[universe.chainId]
  }/api/v1/route/build`

  const fetchRoute = async (quantityIn: TokenQuantity, tokenOut: Token) => {
    return fetch(
      `${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`,
      {
        method: 'GET',
        headers: {
          'x-client-id': 'register',
        },
      }
    ).then((res) => res.json()) as Promise<GetRoute>
  }
  const fetchSwap = async (req: GetRoute, recipient: Address) => {
    return fetch(`${POST_GET_SWAP}?source=register`, {
      method: 'POST',
      body: JSON.stringify({
        ...req.data,
        recipient: recipient.address,
        slippageTolerance: slippage,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': 'register',
      },
    }).then((res) => res.json() as Promise<SwapResult>)
  }

  const getQuoteAndSwap = async (
    quantityIn: TokenQuantity,
    tokenOut: Token,
    recipient: Address
  ): Promise<KyberswapAggregatorResult> => {
    const req = await fetchRoute(quantityIn, tokenOut)
    const swap = await fetchSwap(req, recipient)

    return {
      quantityIn,
      output: tokenOut,
      swap,
      req,
    }
  }

  return new DexAggregator(
    aggregatorName,
    async (_, destination, input, output, slippage) => {
      const req = await getQuoteAndSwap(input, output, destination)
      return await new SwapPlan(universe, [
        new KyberAction(req, universe),
      ]).quote([input], destination)
    }
  )
}
