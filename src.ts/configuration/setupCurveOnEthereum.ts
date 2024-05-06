import { BaseAction } from '../action/Action'
import { setupConvexEdges as setupConvexEdge } from '../action/Convex'

import { loadCurve } from '../action/Curve'
import { Address } from '../base/Address'
import { TokenQuantity } from '../entities/Token'
import {
  BasketTokenSourcingRuleApplication,
  PostTradeAction,
} from '../searcher/BasketTokenSourcingRules'
import { SwapPlan } from '../searcher/Swap'

import { setupCurveStableSwapNGPool } from '../action/CurveStableSwapNG'
import { RouterAction } from '../action/RouterAction'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { type SourcingRule } from '../searcher/SourcingRule'
import { type EthereumUniverse } from './ethereum'

export {
  BasketTokenSourcingRuleApplication,
  PostTradeAction
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
  convexBooster: string,
  lpActionSlippage: bigint
) => {
  const MIM = universe.commonTokens.MIM
  const FRAX = universe.commonTokens.FRAX
  const USDT = universe.commonTokens.USDT
  const DAI = universe.commonTokens.DAI
  const USDC = universe.commonTokens.USDC
  const pyUSD = universe.commonTokens.pyUSD

  const curveApi = await loadCurve(universe)
  const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f']
  const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f']
  const _3CRV = universe.commonTokens['3CRV']

  // We will not implement the full curve router,
  // But rather some predefined paths that are likely to be used
  // by users
  // curveApi.createRouterEdge(USDC, USDT);
  // curveApi.createRouterEdge(USDT, USDC);

  const setupBidirectionalEdge = async (
    tokenA: TokenQuantity,
    tokenB: TokenQuantity,
    slippage: bigint
  ) => {
    curveApi.createRouterEdge(tokenA, tokenB.token, slippage)
    curveApi.createRouterEdge(tokenB, tokenA.token, slippage)
  }

  await setupBidirectionalEdge(
    universe.wrappedNativeToken.from(10),
    eUSD__FRAX_USDC.from(1000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    FRAX.from(1000),
    eUSD__FRAX_USDC.from(1000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    MIM.from(1000),
    eUSD__FRAX_USDC.from(1000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDT.from(1000),
    eUSD__FRAX_USDC.from(1000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    DAI.from(1000),
    eUSD__FRAX_USDC.from(1000),
    lpActionSlippage
  )

  universe.defineMintable(
    await curveApi.createRouterEdge(USDC.from(10000.0), eUSD__FRAX_USDC, 100n),
    await curveApi.createRouterEdge(eUSD__FRAX_USDC.from(10000.0), USDC, 100n),
    true
  )

  await setupBidirectionalEdge(
    FRAX.from(1000),
    mim_3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    MIM.from(1000),
    mim_3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDC.from(1000),
    mim_3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDT.from(1000),
    mim_3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    DAI.from(1000),
    mim_3CRV.from(10000),
    lpActionSlippage
  )

  await setupBidirectionalEdge(
    FRAX.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    MIM.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDC.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDT.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    DAI.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )

  await setupBidirectionalEdge(
    FRAX.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    MIM.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDC.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    USDT.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )
  await setupBidirectionalEdge(
    DAI.from(1000),
    _3CRV.from(10000),
    lpActionSlippage
  )

  // Add convex edges
  // const stkcvxeUSD3CRV_OLD = universe.commonTokens['stkcvxeUSD3CRV-f']
  // const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f2']
  const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f3']
  const stkcvxMIM3LP3CRV = universe.commonTokens['stkcvxMIM-3LP3CRV-f']

  const stkcvx3Crv = universe.commonTokens['stkcvx3Crv']
  const stables = new Set([DAI, MIM, FRAX, USDC, USDT, pyUSD])
  const convexBoosterAddress = Address.from(convexBooster)

  // This is a sourcing rule, it can be used to define 'shortcuts' or better ways to perform a Zap.
  // The rule defined below instructs the zapper to not mint stkcvxeUSD3CRv/stkcvxMIM3LP3CRV tokens
  // from scratch and instead use the curve router via some stable coin.
  // If the user is zapping one of the above stable-coins into hyUSD then we will
  // even skip the initial trade and zap directly into the LP token / staked LP token.
  // Otherwise we try to trade the user input token into USDC first. It should ideally
  // reduce the number of trades needed to perform the zap.
  const makeStkConvexSourcingRule =
    (depositAndStake: BaseAction): SourcingRule =>
    async (input, unitAmount) => {
      const lpTokenQty = unitAmount.into(depositAndStake.inputToken[0])
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
            await curveApi.createRouterEdge(
              unitAmount.into(USDC),
              lpTokenQty.token,
              lpActionSlippage
            ),
            true // Cause the Zapper to recalculate the inputs of the mints for the next step
          ),
          PostTradeAction.fromAction(depositAndStake),
        ]
      )
    }

  const pyUSDCPool = await setupCurveStableSwapNGPool(
    universe,
    universe.commonTokens.PYUSDUSDC
  )

  const [
    /*eUSDConvexOld,*/ eUSDConvexNew,
    mimConvex,
    threeCryptoConvex,
    pyUSDCPoolConvex,
  ] = await Promise.all([
    setupConvexEdge(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
    setupConvexEdge(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
    setupConvexEdge(universe, stkcvx3Crv, convexBoosterAddress),
    setupConvexEdge(
      universe,
      universe.commonTokens.stkcvxPYUSDUSDC,
      convexBoosterAddress
    ),

    // setupConvexEdge(universe, stkcvxeUSD3CRV_OLD, convexBoosterAddress),
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
    stkcvxeUSD3CRV_NEW,
    makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction)
  )

  universe.defineTokenSourcingRule(
    stkcvxMIM3LP3CRV,
    makeStkConvexSourcingRule(mimConvex.depositAndStakeAction)
  )

  universe.defineTokenSourcingRule(
    stkcvx3Crv,
    makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction)
  )

  const whitelistedRouterSwaps = new Set([
    ...stables,
    universe.commonTokens.steth,
    universe.commonTokens.reth,
    universe.commonTokens.WBTC,
    eUSD__FRAX_USDC,
    mim_3CRV,
    _3CRV,
  ])

  universe.defineTokenSourcingRule(
    universe.commonTokens.stkcvxPYUSDUSDC,
    async (input, unitAmount) => {
      const depositAndStake = pyUSDCPoolConvex.depositAndStakeAction
      if (input === pyUSDCPool.pool) {
        return BasketTokenSourcingRuleApplication.singleBranch(
          [unitAmount],
          [PostTradeAction.fromAction(depositAndStake)]
        )
      }
      const precursor = pyUSDCPool.underlying.includes(input) ? input : USDC
      return BasketTokenSourcingRuleApplication.singleBranch(
        [unitAmount.into(precursor)],
        [
          PostTradeAction.fromAction(
            pyUSDCPool.getAddLiquidityAction(input),
            true // Cause the Zapper to recalculate the inputs of the mints for the next step
          ),
          PostTradeAction.fromAction(depositAndStake),
        ]
      )
    }
  )

  const dex = new DexRouter(
    'Eth.Curve',
    async (abort, input, output, slippage) => {
      return await new SwapPlan(universe, [
        await curveApi.createRouterEdge(input, output, slippage),
      ]).quote([input], universe.execAddress)
    },
    true,
    whitelistedRouterSwaps,
    whitelistedRouterSwaps
  )

  return {
    stables,
    setupConvexEdge,
    makeStkConvexSourcingRule,
    convexBoosterAddress,

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
  }
}
