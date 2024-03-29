import { type Action } from '../action/Action'
import { setupConvexEdges as setupConvexEdge } from '../action/Convex'

import { loadCurve } from '../action/Curve'
import { Address } from '../base/Address'
import { Token } from '../entities/Token'
import { SwapPlan } from '../searcher/Swap'
import {
  BasketTokenSourcingRuleApplication,
  PostTradeAction,
} from '../searcher/BasketTokenSourcingRules'

import { type SourcingRule } from '../searcher/SourcingRule'
import { type EthereumUniverse } from './ethereum'
import { DexAggregator } from '..'

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
  convexBooster: string
) => {
  const MIM = universe.commonTokens.MIM
  const FRAX = universe.commonTokens.FRAX
  const USDT = universe.commonTokens.USDT
  const DAI = universe.commonTokens.DAI
  const USDC = universe.commonTokens.USDC

  const curveApi = await loadCurve(
    universe,
    // Some tokens only really have one way to be soured, like:
    // USDC/USDT -> MIN/eUSD LP
    // This will make UI applications snappier as they will not have to
    // to do any searching
    {}
    // (
    //   await import('./data/ethereum/precomputed-curve-routes.json', {
    //     assert: { type: 'json' },
    //   })
    // ).default as Record<string, IRoute>
  )
  const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f']
  const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f']
  const _3CRV = universe.commonTokens['3CRV']

  // We will not implement the full curve router,
  // But rather some predefined paths that are likely to be used
  // by users
  // curveApi.createRouterEdge(USDC, USDT);
  // curveApi.createRouterEdge(USDT, USDC);

  const setupLPTokenEdge = (tokenA: Token, tokenB: Token) => {
    curveApi.createRouterEdge(tokenA, tokenB)
    curveApi.createRouterEdge(tokenB, tokenA)
  }

  setupLPTokenEdge(universe.wrappedNativeToken, eUSD__FRAX_USDC)
  setupLPTokenEdge(FRAX, eUSD__FRAX_USDC)
  setupLPTokenEdge(MIM, eUSD__FRAX_USDC)
  setupLPTokenEdge(USDC, eUSD__FRAX_USDC)
  setupLPTokenEdge(USDT, eUSD__FRAX_USDC)
  setupLPTokenEdge(DAI, eUSD__FRAX_USDC)

  setupLPTokenEdge(FRAX, mim_3CRV)
  setupLPTokenEdge(MIM, mim_3CRV)
  setupLPTokenEdge(USDC, mim_3CRV)
  setupLPTokenEdge(USDT, mim_3CRV)
  setupLPTokenEdge(DAI, mim_3CRV)

  setupLPTokenEdge(FRAX, _3CRV)
  setupLPTokenEdge(MIM, _3CRV)
  setupLPTokenEdge(USDC, _3CRV)
  setupLPTokenEdge(USDT, _3CRV)
  setupLPTokenEdge(DAI, _3CRV)

  // Add convex edges
  // const stkcvxeUSD3CRV_OLD = universe.commonTokens['stkcvxeUSD3CRV-f']
  const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f2']
  const stkcvxMIM3LP3CRV = universe.commonTokens['stkcvxMIM-3LP3CRV-f']

  const stkcvx3Crv = universe.commonTokens['stkcvx3Crv']
  const stables = new Set([DAI, MIM, FRAX, USDC, USDT])
  const convexBoosterAddress = Address.from(convexBooster)

  // This is a sourcing rule, it can be used to define 'shortcuts' or better ways to perform a Zap.
  // The rule defined below instructs the zapper to not mint stkcvxeUSD3CRv/stkcvxMIM3LP3CRV tokens
  // from scratch and instead use the curve router via some stable coin.
  // If the user is zapping one of the above stable-coins into hyUSD then we will
  // even skip the initial trade and zap directly into the LP token / staked LP token.
  // Otherwise we try to trade the user input token into USDC first. It should ideally
  // reduce the number of trades needed to perform the zap.
  const makeStkConvexSourcingRule =
    (depositAndStake: Action): SourcingRule =>
    async (input, unitAmount) => {
      const lpTokenQty = unitAmount.into(depositAndStake.input[0])
      if (stables.has(input)) {
        return BasketTokenSourcingRuleApplication.singleBranch(
          [lpTokenQty],
          [PostTradeAction.fromAction(depositAndStake)]
        )
      }
      return BasketTokenSourcingRuleApplication.singleBranch(
        [unitAmount.into(USDC)],
        [
          PostTradeAction.fromAction(
            curveApi.createRouterEdge(USDC, lpTokenQty.token),
            true // Cause the Zapper to recalculate the inputs of the mints for the next step
          ),
          PostTradeAction.fromAction(depositAndStake),
        ]
      )
    }

  const [/*eUSDConvexOld,*/ eUSDConvexNew, mimConvex, threeCryptoConvex] =
    await Promise.all([
      // setupConvexEdge(universe, stkcvxeUSD3CRV_OLD, convexBoosterAddress),
      setupConvexEdge(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
      setupConvexEdge(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
      setupConvexEdge(universe, stkcvx3Crv, convexBoosterAddress),
    ])

  // universe.defineTokenSourcingRule(
  //   universe.rTokens.hyUSD,
  //   stkcvxeUSD3CRV_OLD,
  //   makeStkConvexSourcingRule(eUSDConvexOld.depositAndStakeAction)
  // )
  // universe.defineTokenSourcingRule(
  //   universe.rTokens.RSD,
  //   stkcvxeUSD3CRV_OLD,
  //   makeStkConvexSourcingRule(eUSDConvexOld.depositAndStakeAction)
  // )

  universe.defineTokenSourcingRule(
    universe.rTokens.hyUSD,
    stkcvxeUSD3CRV_NEW,
    makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction)
  )
  universe.defineTokenSourcingRule(
    universe.rTokens.RSD,
    stkcvxeUSD3CRV_NEW,
    makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction)
  )

  universe.defineTokenSourcingRule(
    universe.rTokens.hyUSD,
    stkcvxMIM3LP3CRV,
    makeStkConvexSourcingRule(mimConvex.depositAndStakeAction)
  )

  universe.defineTokenSourcingRule(
    universe.rTokens.iUSD,
    stkcvx3Crv,
    makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction)
  )

  universe.dexAggregators.push(
    new DexAggregator('Curve', async (_, destination, input, output, __) => {
      if (stables.has(input.token) && stables.has(output)) {
        return await new SwapPlan(universe, [
          curveApi.createRouterEdge(input.token, output),
        ]).quote([input], destination)
      }
      if (Object.values(universe.rTokens).includes(input.token)) {
        return await new SwapPlan(universe, [
          curveApi.createRouterEdge(input.token, output),
        ]).quote([input], destination)
      }
      throw new Error('Unsupported trade')
    })
  )

  return {
    stables,
    setupConvexEdge,
    makeStkConvexSourcingRule,
    convexBoosterAddress,
  }
}
