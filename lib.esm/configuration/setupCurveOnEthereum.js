import { setupConvexEdges as setupConvexEdge } from '../action/Convex';
import { loadCurve } from '../action/Curve';
import { Address } from '../base/Address';
import { BasketTokenSourcingRuleApplication, PostTradeAction, } from '../searcher/BasketTokenSourcingRules';
import { SwapPlan } from '../searcher/Swap';
import { DexRouter } from '../aggregators/DexAggregator';
import { setupCurveStableSwapNGPool } from '../action/CurveStableSwapNG';
export { BasketTokenSourcingRuleApplication, PostTradeAction, } from '../searcher/BasketTokenSourcingRules';
export const initCurveOnEthereum = async (universe, convexBooster, lpActionSlippage) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const pyUSD = universe.commonTokens.pyUSD;
    const curveApi = await loadCurve(universe);
    const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f'];
    const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f'];
    const _3CRV = universe.commonTokens['3CRV'];
    // We will not implement the full curve router,
    // But rather some predefined paths that are likely to be used
    // by users
    // curveApi.createRouterEdge(USDC, USDT);
    // curveApi.createRouterEdge(USDT, USDC);
    const setupBidirectionalEdge = (tokenA, tokenB, slippage) => {
        curveApi.createRouterEdge(tokenA, tokenB, slippage);
        curveApi.createRouterEdge(tokenB, tokenA, slippage);
    };
    setupBidirectionalEdge(universe.wrappedNativeToken, eUSD__FRAX_USDC, lpActionSlippage);
    setupBidirectionalEdge(FRAX, eUSD__FRAX_USDC, lpActionSlippage);
    setupBidirectionalEdge(MIM, eUSD__FRAX_USDC, lpActionSlippage);
    // setupBidirectionalEdge(USDC, eUSD__FRAX_USDC, lpActionSlippage)
    setupBidirectionalEdge(USDT, eUSD__FRAX_USDC, lpActionSlippage);
    setupBidirectionalEdge(DAI, eUSD__FRAX_USDC, lpActionSlippage);
    universe.defineMintable(curveApi.createRouterEdge(USDC, eUSD__FRAX_USDC, 100n), curveApi.createRouterEdge(eUSD__FRAX_USDC, USDC, 100n), true);
    setupBidirectionalEdge(FRAX, mim_3CRV, lpActionSlippage);
    setupBidirectionalEdge(MIM, mim_3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDC, mim_3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDT, mim_3CRV, lpActionSlippage);
    setupBidirectionalEdge(DAI, mim_3CRV, lpActionSlippage);
    setupBidirectionalEdge(FRAX, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(MIM, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDC, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDT, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(DAI, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(FRAX, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(MIM, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDC, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(USDT, _3CRV, lpActionSlippage);
    setupBidirectionalEdge(DAI, _3CRV, lpActionSlippage);
    // Add convex edges
    // const stkcvxeUSD3CRV_OLD = universe.commonTokens['stkcvxeUSD3CRV-f']
    // const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f2']
    const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f3'];
    const stkcvxMIM3LP3CRV = universe.commonTokens['stkcvxMIM-3LP3CRV-f'];
    const stkcvx3Crv = universe.commonTokens['stkcvx3Crv'];
    const stables = new Set([DAI, MIM, FRAX, USDC, USDT, pyUSD]);
    const convexBoosterAddress = Address.from(convexBooster);
    // This is a sourcing rule, it can be used to define 'shortcuts' or better ways to perform a Zap.
    // The rule defined below instructs the zapper to not mint stkcvxeUSD3CRv/stkcvxMIM3LP3CRV tokens
    // from scratch and instead use the curve router via some stable coin.
    // If the user is zapping one of the above stable-coins into hyUSD then we will
    // even skip the initial trade and zap directly into the LP token / staked LP token.
    // Otherwise we try to trade the user input token into USDC first. It should ideally
    // reduce the number of trades needed to perform the zap.
    const makeStkConvexSourcingRule = (depositAndStake) => async (input, unitAmount) => {
        const lpTokenQty = unitAmount.into(depositAndStake.inputToken[0]);
        if (stables.has(input)) {
            return BasketTokenSourcingRuleApplication.singleBranch([lpTokenQty], [PostTradeAction.fromAction(depositAndStake)]);
        }
        return BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(USDC)], [
            PostTradeAction.fromAction(curveApi.createRouterEdge(USDC, lpTokenQty.token, lpActionSlippage), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            PostTradeAction.fromAction(depositAndStake),
        ]);
    };
    const pyUSDCPool = await setupCurveStableSwapNGPool(universe, universe.commonTokens.PYUSDUSDC);
    const [
    /*eUSDConvexOld,*/ eUSDConvexNew, mimConvex, threeCryptoConvex, pyUSDCPoolConvex,] = await Promise.all([
        setupConvexEdge(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
        setupConvexEdge(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        setupConvexEdge(universe, stkcvx3Crv, convexBoosterAddress),
        setupConvexEdge(universe, universe.commonTokens.stkcvxPYUSDUSDC, convexBoosterAddress),
        // setupConvexEdge(universe, stkcvxeUSD3CRV_OLD, convexBoosterAddress),
    ]);
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
    universe.defineTokenSourcingRule(stkcvxeUSD3CRV_NEW, makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction));
    universe.defineTokenSourcingRule(stkcvxMIM3LP3CRV, makeStkConvexSourcingRule(mimConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(stkcvx3Crv, makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction));
    const whitelistedRouterSwaps = new Set([
        ...stables,
        universe.commonTokens.steth,
        universe.commonTokens.reth,
        universe.commonTokens.WBTC,
        eUSD__FRAX_USDC,
        mim_3CRV,
        _3CRV,
    ]);
    universe.dexAggregators.push(new DexRouter('Eth.Curve', async (abort, payer, recipient, input, output, slippage) => {
        return await new SwapPlan(universe, [
            curveApi.createRouterEdge(input.token, output, slippage),
        ]).quote([input], recipient);
    }, true, whitelistedRouterSwaps, whitelistedRouterSwaps));
    universe.defineTokenSourcingRule(universe.commonTokens.stkcvxPYUSDUSDC, async (input, unitAmount) => {
        const depositAndStake = pyUSDCPoolConvex.depositAndStakeAction;
        if (input === pyUSDCPool.pool) {
            return BasketTokenSourcingRuleApplication.singleBranch([unitAmount], [PostTradeAction.fromAction(depositAndStake)]);
        }
        const precursor = pyUSDCPool.underlying.includes(input) ? input : USDC;
        return BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(precursor)], [
            PostTradeAction.fromAction(pyUSDCPool.getAddLiquidityAction(input), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            PostTradeAction.fromAction(depositAndStake),
        ]);
    });
    return {
        stables,
        setupConvexEdge,
        makeStkConvexSourcingRule,
        convexBoosterAddress,
    };
};
//# sourceMappingURL=setupCurveOnEthereum.js.map