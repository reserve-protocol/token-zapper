import { constructSimpleSDK, SwapSide, TransactionParams } from '@paraswap/sdk'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Planner, Value } from '../tx-gen/Planner'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { ZapperExecutor__factory } from '../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory'
import { Approval } from '../base/Approval'
import { DexRouter, TradingVenue } from './DexAggregator'
import { OptimalRate } from 'paraswap-core'
import { SwapPlan } from '../searcher/Swap'

interface ParaswapAggregatorResult {
  addresesInUse: Set<Address>
  quantityIn: TokenQuantity
  quantityOut: TokenQuantity
  output: Token
  request: {
    rate: OptimalRate
    tx: TransactionParams
  }
}

class ParaswapAction extends Action('Kyberswap') {
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
    return 1n
  }

  async plan(
    planner: Planner,
    _: Value[],
    __: Address,
    predicted: TokenQuantity[]
  ) {
    try {
      const zapperLib = this.gen.Contract.createLibrary(
        ZapperExecutor__factory.connect(
          this.universe.config.addresses.executorAddress.address,
          this.universe.provider
        )
      )
      const minOut = await this.quoteWithSlippage(predicted)
      planner.add(
        zapperLib.rawCall(
          this.request.request.tx.to,
          0,
          this.request.request.tx.data
        ),

        `paraswap,router=${this.request.request.tx.to},swap=${predicted.join(
          ', '
        )} -> ${minOut.join(', ')},pools=${[...this.request.addresesInUse].join(
          ', '
        )}`
      )
      return null
    } catch (e: any) {
      console.log(e.stack)
      throw e
    }
  }
  constructor(
    public readonly request: ParaswapAggregatorResult,
    public readonly universe: Universe
  ) {
    super(
      Address.from(request.request.tx.to),
      [request.quantityIn.token],
      [request.output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          request.quantityIn.token,
          Address.from(request.request.tx.to)
        ),
      ]
    )
  }
  public get supportsDynamicInput() {
    return false
  }
  get outputQty() {
    return this.request.quantityOut
  }
  toString() {
    return `Kyberswap(${this.request.quantityIn} => ${this.outputQty})`
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQty]
  }
  gasEstimate(): bigint {
    return BigInt(this.request.request.rate.gasCost)
  }
}

export const createParaswap = (aggregatorName: string, universe: Universe) => {
  const client = constructSimpleSDK({
    chainId: universe.chainId,
    fetch: fetch,
    version: '5',
  })

  const router = new DexRouter(
    aggregatorName,
    async (abort, input, output, slippage) => {
      let rate = await client.swap.getRate(
        {
          userAddress: universe.execAddress.address,
          srcDecimals: input.token.decimals,
          destDecimals: output.decimals,
          srcToken: input.token.address.address,
          destToken: output.address.address,
          amount: input.amount.toString(),
          side: SwapSide.SELL,
        },
        abort
      )

      const tx = await client.swap.buildTx(
        {
          srcToken: input.token.address.address,
          destToken: output.address.address,
          destAmount: rate.destAmount,
          srcAmount: input.amount.toString(),
          priceRoute: rate,
          userAddress: universe.execAddress.address,
        },
        {
          ignoreAllowance: true,
          ignoreGasEstimate: true,
          ignoreChecks: true,
        }
      )

      const addrs = new Set<Address>()
      for (const route of rate.bestRoute) {
        for (const swap of route.swaps) {
          for (const exchange of swap.swapExchanges) {
            for (const addr of exchange.poolAddresses?.map(Address.from) ??
              []) {
              if (universe.tokens.has(addr)) {
                continue
              }
              addrs.add(addr)
            }
          }
        }
      }


      const out = await new SwapPlan(universe, [
        new ParaswapAction(
          {
            addresesInUse: addrs,
            quantityIn: input,
            quantityOut: output.from(BigInt(rate.destAmount)),
            output: output,
            request: {
              rate,
              tx: tx,
            },
          },
          universe
        ),
      ]).quote([input], universe.execAddress)


      return out
    },
    false
  ).withMaxConcurrency(8)

  return new TradingVenue(universe, router)
}
