import { GAS_TOKEN_ADDRESS } from '../base/constants'
import { type EthereumUniverse } from './ethereum'
import {
  AlphaRouter,
  CurrencyAmount,
  SwapRoute,
  SwapType,
  routeAmountsToString,
  routeToString,
} from '@uniswap/smart-order-router'
import { DexAggregator } from '../aggregators/DexAggregator'
import { Token, TokenQuantity } from '../entities/Token'
import {
  Currency,
  Token as UniToken,
  Ether,
  TradeType,
  Percent,
} from '@uniswap/sdk-core'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Planner, Value } from '../tx-gen/Planner'
import { ZapperExecutor__factory } from '../contracts'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { SwapPlan } from '../searcher/Swap'

export class UniswapRouterAction extends Action {
  encode(
    amountsIn: TokenQuantity[],
    destination: Address,
    bytes?: Buffer | undefined
  ): Promise<ContractCall> {
    throw new Error('Deprecated')
  }
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
        this.route.methodParameters!.to,
        this.route.methodParameters!.value,
        this.route.methodParameters!.calldata
      ),
      `UniswapSmartRouter ${this.inputQty} => ${this.outputQty}`
    )
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.output[0],
      destination,
      'UniswapRouter,after swap',
      `bal_${this.output[0].symbol}_after`
    )
    return [out!]
  }
  constructor(
    public readonly route: SwapRoute,
    public readonly inputQty: TokenQuantity,
    public readonly outputQty: TokenQuantity,
    public readonly universe: Universe
  ) {
    super(
      Address.from(route.methodParameters!.to),
      [inputQty.token],
      [outputQty.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(inputQty.token, Address.from(route.methodParameters!.to))]
    )
  }
  toString() {
    return `Uniswap(${this.inputQty} => ${this.outputQty})`
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputQty]
  }
  gasEstimate(): bigint {
    return this.route.estimatedGasUsed.toBigInt()
  }
}

const ourTokenToUni = (universe: Universe, token: Token): Currency => {
  if (token.address.address === GAS_TOKEN_ADDRESS) {
    return Ether.onChain(universe.chainId)
  }
  return new UniToken(
    universe.chainId,
    token.address.address,
    token.decimals,
    token.symbol,
    token.name
  )
}
const tokenQtyToCurrencyAmt = (
  universe: Universe,
  qty: TokenQuantity
): CurrencyAmount => {
  const uniToken = ourTokenToUni(universe, qty.token)
  return CurrencyAmount.fromRawAmount(uniToken, qty.amount.toString())
}
export const setupUniswapRouter = async (universe: Universe) => {
  const router = new AlphaRouter({
    chainId: universe.chainId,
    provider: universe.provider,
  })

  universe.dexAggregators.push(
    new DexAggregator('uniswap', async (src, dst, input, output, slippage) => {
      const inp = tokenQtyToCurrencyAmt(universe, input)
      const outp = ourTokenToUni(universe, output)

      const route = await router.route(inp, outp, TradeType.EXACT_INPUT, {
        recipient: dst.address,
        slippageTolerance: new Percent(50, 10000),
        deadline: Math.floor(Date.now() / 1000 + 1800),
        type: SwapType.SWAP_ROUTER_02,
      })
      if (route == null || route.methodParameters == null) {
        throw new Error('Failed to find route')
      }
      const outputAmt = output.fromBigInt(
        BigInt(route.trade.outputAmount.quotient.toString())
      )

      // console.log(
      //   `Uniswap: ${input} -> ${outputAmt} via ${routeAmountsToString(route.route)}`
      // )

      return await new SwapPlan(universe, [
        new UniswapRouterAction(route, input, outputAmt, universe),
      ]).quote([input], dst)
    })
  )
}
