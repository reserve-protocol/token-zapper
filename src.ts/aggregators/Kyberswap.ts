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
import { Planner, Value } from '../tx-gen/Planner'
import { ZapperExecutor__factory } from '../contracts'

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
  async plan(
    planner: Planner,
    _: Value[],
    destination: Address
  ): Promise<Value[]> {
    const zapperLib = this.gen.Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.executorAddress.address,
        this.universe.provider
      )
    )
    planner.add(
      zapperLib.rawCall(
        this.request.req.data.routerAddress,
        0,
        this.request.swap.data.data
      ),
      `kyberswap,router=${this.request.swap.data.routerAddress},swap=${
        this.request.quantityIn
      } -> ${
        this.outputQuantity
      },route=${this.request.req.data.routeSummary.route
        .flat()
        .map((i) => `(${i.poolType})`)
        .join(' -> ')},destination=${destination}`
    )
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination,
      'kyberswap,after swap',
      `bal_${this.output[0].symbol}_after`
    )
    return [out!]
  }
  public outputQuantity: TokenQuantity[] = []
  constructor(
    public readonly request: KyberswapAggregatorResult,
    public readonly universe: Universe,
    public readonly slippage: number
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

    const amount = BigInt(this.request.swap.data.amountOut)
    const minOut = amount - (amount / 10000n) * BigInt(this.slippage)
    const out = this.output[0].from(minOut)
    this.outputQuantity = [out]
  }
  toString() {
    return `Kyberswap(${this.request.quantityIn} => ${this.request.output})`
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return this.outputQuantity
  }
  gasEstimate(): bigint {
    return BigInt(this.request.req.data.routeSummary.gas)
  }
  async encode(inputs: TokenQuantity[], __: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(this.request.swap.data.data),
      Address.from(this.request.req.data.routerAddress),
      0n,
      this.gasEstimate(),
      `Kyberswap(${this.address}) (${inputs.join(',')}) -> (${
        this.outputQuantity
      })`
    )
  }
}

export const createKyberswap = (
  aggregatorName: string,
  universe: Universe,
  slippage: number
) => {
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
    const url = `${GET_ROUTE_SWAP}?source=register&amountIn=${quantityIn.amount}&tokenIn=${quantityIn.token.address.address}&tokenOut=${tokenOut.address.address}`
    return fetch(url, {
      method: 'GET',
      headers: {
        'x-client-id': 'register',
      },
    }).then((res) => res.json()) as Promise<GetRoute>
  }
  const fetchSwap = async (req: GetRoute, recipient: Address) => {
    return fetch(`${POST_GET_SWAP}?source=register`, {
      method: 'POST',
      body: JSON.stringify({
        ...req.data,
        sender: universe.config.addresses.executorAddress.address,
        recipient: recipient.address,
        skipSimulateTx: true,
        slippageTolerance: slippage,
        source: 'register',
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
    async (_, destination, input, output, __) => {
      const req = await getQuoteAndSwap(input, output, destination)
      return await new SwapPlan(universe, [
        new KyberAction(req, universe, slippage),
      ]).quote([input], destination)
    }
  )
}
