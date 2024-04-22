import { setupConvexEdges as setupConvexEdge } from '../action/Convex';
import { loadCurve } from '../action/Curve';
import { Address } from '../base/Address';
import { SwapPlan } from '../searcher/Swap';
import { BasketTokenSourcingRuleApplication, PostTradeAction, } from '../searcher/BasketTokenSourcingRules';
import { DexAggregator } from '..';
export { BasketTokenSourcingRuleApplication, PostTradeAction, } from '../searcher/BasketTokenSourcingRules';
export const initCurveOnEthereum = async (universe, convexBooster) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const pyUSD = universe.commonTokens.pyUSD;
    const steth = universe.commonTokens.steth;
    const curveApi = await loadCurve(universe, 
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
    );
    const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f'];
    const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f'];
    const _3CRV = universe.commonTokens['3CRV'];
    // We will not implement the full curve router,
    // But rather some predefined paths that are likely to be used
    // by users
    // curveApi.createRouterEdge(USDC, USDT);
    // curveApi.createRouterEdge(USDT, USDC);
    const setupBidirectionalEdge = (tokenA, tokenB) => {
        curveApi.createRouterEdge(tokenA, tokenB);
        curveApi.createRouterEdge(tokenB, tokenA);
    };
    setupBidirectionalEdge(universe.wrappedNativeToken, eUSD__FRAX_USDC);
    setupBidirectionalEdge(FRAX, eUSD__FRAX_USDC);
    setupBidirectionalEdge(MIM, eUSD__FRAX_USDC);
    setupBidirectionalEdge(USDC, eUSD__FRAX_USDC);
    setupBidirectionalEdge(USDT, eUSD__FRAX_USDC);
    setupBidirectionalEdge(DAI, eUSD__FRAX_USDC);
    setupBidirectionalEdge(FRAX, mim_3CRV);
    setupBidirectionalEdge(MIM, mim_3CRV);
    setupBidirectionalEdge(USDC, mim_3CRV);
    setupBidirectionalEdge(USDT, mim_3CRV);
    setupBidirectionalEdge(DAI, mim_3CRV);
    setupBidirectionalEdge(FRAX, _3CRV);
    setupBidirectionalEdge(MIM, _3CRV);
    setupBidirectionalEdge(USDC, _3CRV);
    setupBidirectionalEdge(USDT, _3CRV);
    setupBidirectionalEdge(DAI, _3CRV);
    setupBidirectionalEdge(FRAX, _3CRV);
    setupBidirectionalEdge(MIM, _3CRV);
    setupBidirectionalEdge(USDC, _3CRV);
    setupBidirectionalEdge(USDT, _3CRV);
    setupBidirectionalEdge(DAI, _3CRV);
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
        const lpTokenQty = unitAmount.into(depositAndStake.input[0]);
        if (stables.has(input)) {
            return BasketTokenSourcingRuleApplication.singleBranch([lpTokenQty], [PostTradeAction.fromAction(depositAndStake)]);
        }
        return BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(USDC)], [
            PostTradeAction.fromAction(curveApi.createRouterEdge(USDC, lpTokenQty.token), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            PostTradeAction.fromAction(depositAndStake),
        ]);
    };
    const [/*eUSDConvexOld,*/ eUSDConvexNew, mimConvex, threeCryptoConvex] = await Promise.all([
        setupConvexEdge(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
        setupConvexEdge(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        setupConvexEdge(universe, stkcvx3Crv, convexBoosterAddress),
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
    universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxeUSD3CRV_NEW, makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxMIM3LP3CRV, makeStkConvexSourcingRule(mimConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.iUSD, stkcvx3Crv, makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction));
    const whitelistedRouterOutputs = new Set([...stables, ...Object.values(universe.rTokens), steth]);
    universe.dexAggregators.push(new DexAggregator('Curve', async (_, destination, input, output, __) => {
        if (stables.has(input.token) && whitelistedRouterOutputs.has(output)) {
            return await new SwapPlan(universe, [
                curveApi.createRouterEdge(input.token, output),
            ]).quote([input], destination);
        }
        throw new Error('Unsupported trade');
    }));
    return {
        stables,
        setupConvexEdge,
        makeStkConvexSourcingRule,
        convexBoosterAddress,
    };
};
//# sourceMappingURL=setupCurveOnEthereum.js.map