import { loadCurve } from '../action/Curve'
import { SwapPlan } from '../searcher/Swap'

import { RouterAction } from '../action/RouterAction'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { type EthereumUniverse } from './ethereum'
import { Token } from '../entities/Token'

export {
  BasketTokenSourcingRuleApplication,
  PostTradeAction,
} from '../searcher/BasketTokenSourcingRules'

export interface IRouteStep {
  poolId: string
  poolAddress: string
  inputCoinAddress: string
  outputCoinAddress: string
  i: number
  j: number
  swapType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
  swapAddress: string
}
export type IRoute = IRouteStep[]

export const initCurveOnEthereum = async (universe: EthereumUniverse) => {
  const curveApi = await loadCurve(universe)

  const whitelist = new Set<Token>([
    universe.commonTokens.USDC,
    universe.commonTokens.USDT,
    universe.commonTokens.DAI,
    universe.commonTokens.pyUSD,
    universe.commonTokens.MIM,
    universe.commonTokens.WETH,
    universe.commonTokens.WBTC,
    universe.commonTokens.PYUSDUSDC,
    universe.commonTokens.FRAX,
    universe.commonTokens['eUSD3CRV-f'],
  ])
  const dex = new DexRouter(
    'Eth.Curve',
    async (abort, input, output, slippage) => {
      return await new SwapPlan(universe, [
        await curveApi.createRouterEdge(input, output, slippage),
      ]).quote([input], universe.execAddress)
    },
    true,
    whitelist,
    whitelist
  )

  return {
    venue: new TradingVenue(universe, dex, async (input, output) => {
      return new RouterAction(
        dex,
        universe,
        curveApi.routerAddress,
        input,
        output,
        universe.config.defaultInternalTradeSlippage
      )
    }),
    curveApi,
  }
}
