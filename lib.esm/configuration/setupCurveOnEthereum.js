import { setupConvexEdges as setupConvexEdge } from '../action/Convex';
import { loadCurve } from '../action/Curve';
import { Address } from '../base/Address';
import { SwapPlan } from '../searcher/Swap';
import { BasketTokenSourcingRuleApplication, PostTradeAction } from '../searcher/BasketTokenSourcingRules';
export const initCurveOnEthereum = async (universe, convexBooster) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const curveApi = await loadCurve(universe, 
    // Some tokens only really have one way to be soured, like:
    // USDC/USDT -> MIN/eUSD LP
    // This will make UI applications snappier as they will not have to
    // to do any searching
    require('./data/ethereum/precomputed-curve-routes.json'));
    const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f'];
    const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f'];
    const _3CRV = universe.commonTokens['3CRV'];
    const WETH = universe.commonTokens.WETH;
    // We will not implement the full curve router,
    // But rather some predefined paths that are likely to be used
    // by users
    curveApi.createRouterEdge(USDC, USDT);
    curveApi.createRouterEdge(USDT, USDC);
    curveApi.createRouterEdge(FRAX, eUSD__FRAX_USDC);
    curveApi.createRouterEdge(MIM, eUSD__FRAX_USDC);
    curveApi.createRouterEdge(USDC, eUSD__FRAX_USDC);
    curveApi.createRouterEdge(USDT, eUSD__FRAX_USDC);
    curveApi.createRouterEdge(DAI, eUSD__FRAX_USDC);
    curveApi.createRouterEdge(FRAX, mim_3CRV);
    curveApi.createRouterEdge(MIM, mim_3CRV);
    curveApi.createRouterEdge(USDC, mim_3CRV);
    curveApi.createRouterEdge(USDT, mim_3CRV);
    curveApi.createRouterEdge(DAI, mim_3CRV);
    curveApi.createRouterEdge(FRAX, _3CRV);
    curveApi.createRouterEdge(MIM, _3CRV);
    curveApi.createRouterEdge(USDC, _3CRV);
    curveApi.createRouterEdge(USDT, _3CRV);
    curveApi.createRouterEdge(DAI, _3CRV);
    // Add convex edges
    const stkcvxeUSD3CRV = universe.commonTokens['stkcvxeUSD3CRV-f'];
    const stkcvxMIM3LP3CRV = universe.commonTokens['stkcvxMIM-3LP3CRV-f'];
    const stkcvx3Crv = universe.commonTokens['stkcvx3Crv'];
    const stables = new Set([DAI, MIM, FRAX, USDC, USDT]);
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
    const convexBoosterAddress = Address.from(convexBooster);
    const [eUSDConvex, mimConvex, threeCryptoConvex] = await Promise.all([
        setupConvexEdge(universe, stkcvxeUSD3CRV, convexBoosterAddress),
        setupConvexEdge(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        setupConvexEdge(universe, stkcvx3Crv, convexBoosterAddress)
    ]);
    universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxeUSD3CRV, makeStkConvexSourcingRule(eUSDConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxMIM3LP3CRV, makeStkConvexSourcingRule(mimConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.RSD, stkcvxeUSD3CRV, makeStkConvexSourcingRule(eUSDConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.iUSD, stkcvx3Crv, makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction));
    for (const stable of stables) {
        universe.tokenTradeSpecialCases.set(stable, async (input, dest) => {
            if (!stables.has(input.token)) {
                return null;
            }
            return await new SwapPlan(universe, [
                curveApi.createRouterEdge(input.token, stable),
            ]).quote([input], dest);
        });
    }
};
//# sourceMappingURL=setupCurveOnEthereum.js.map