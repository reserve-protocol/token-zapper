import { loadCurve } from '../action/Curve'
import { SwapPlan } from '../searcher/Swap'

import { RouterAction } from '../action/RouterAction'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { type EthereumUniverse } from './ethereum'
import { Token } from '../entities/Token'
import {
  ConvexStakingWrapper,
  ConvexStakingWrapperInterface,
} from '../contracts/contracts/Convex.sol/ConvexStakingWrapper'
import { ReserveConvex } from './setupConvexStakingWrappers'
import { commify } from 'ethers/lib/utils'

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

export const initCurveOnEthereum = async (
  universe: EthereumUniverse,
  convex: ReserveConvex
) => {
  const curveApi = await loadCurve(universe)

  let standardTrader = DexRouter.builder(
    'curve-lp-handler',
    async (abort, input, output, slippage) => {
      return await new SwapPlan(universe, [
        await curveApi.createRouterEdge2(input.token, output, slippage),
      ]).quote([input], universe.execAddress)
    },
    {
      dynamicInput: true,
      returnsOutput: true,
      onePrZap: true,
    }
  )

  const stables = [
    universe.commonTokens.USDC,
    universe.commonTokens.USDT,
    universe.commonTokens.DAI,
    universe.commonTokens.FRAX,
    universe.commonTokens.MIM,
  ]
  standardTrader.addManyToMany(stables, stables, true)

  for (const pool of curveApi.pools) {
    const lp = pool.lpToken
    const metaTokens = pool.underlyingTokens
    const baseTokens = pool.tokens

    if (pool.underlyingTokens.some(i => stables.includes(i))) {
      for (const base of baseTokens) {
        standardTrader = standardTrader.addPair(base, lp, true)
      }
    }

    if (pool.meta) {
      for (const base of metaTokens) {
        standardTrader = standardTrader.addPair(base, lp, true)
      }
    } else {
      for (const base of baseTokens) {
        standardTrader = standardTrader.addPair(base, lp, true)
      }
    }
  }
  

  const dex = standardTrader.build()

  return {
    venue: new TradingVenue(
      universe,
      dex,
      async (input, output) => {
        return await curveApi.createRouterEdge2(
          input,
          output,
          universe.config.defaultInternalTradeSlippage
        )
      },
      () => universe.currentBlock
    ),
    curveApi,
  }
}
