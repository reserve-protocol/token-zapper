"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCurveOnEthereum = exports.PostTradeAction = exports.BasketTokenSourcingRuleApplication = void 0;
const Convex_1 = require("../action/Convex");
const Curve_1 = require("../action/Curve");
const Address_1 = require("../base/Address");
const Swap_1 = require("../searcher/Swap");
const BasketTokenSourcingRules_1 = require("../searcher/BasketTokenSourcingRules");
const __1 = require("..");
var BasketTokenSourcingRules_2 = require("../searcher/BasketTokenSourcingRules");
Object.defineProperty(exports, "BasketTokenSourcingRuleApplication", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.BasketTokenSourcingRuleApplication; } });
Object.defineProperty(exports, "PostTradeAction", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.PostTradeAction; } });
const initCurveOnEthereum = async (universe, convexBooster) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const pyUSD = universe.commonTokens.pyUSD;
    const curveApi = await (0, Curve_1.loadCurve)(universe, 
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
    const setupLPTokenEdge = (tokenA, tokenB) => {
        curveApi.createRouterEdge(tokenA, tokenB);
        curveApi.createRouterEdge(tokenB, tokenA);
    };
    setupLPTokenEdge(universe.wrappedNativeToken, eUSD__FRAX_USDC);
    setupLPTokenEdge(FRAX, eUSD__FRAX_USDC);
    setupLPTokenEdge(MIM, eUSD__FRAX_USDC);
    setupLPTokenEdge(USDC, eUSD__FRAX_USDC);
    setupLPTokenEdge(USDT, eUSD__FRAX_USDC);
    setupLPTokenEdge(DAI, eUSD__FRAX_USDC);
    setupLPTokenEdge(FRAX, mim_3CRV);
    setupLPTokenEdge(MIM, mim_3CRV);
    setupLPTokenEdge(USDC, mim_3CRV);
    setupLPTokenEdge(USDT, mim_3CRV);
    setupLPTokenEdge(DAI, mim_3CRV);
    setupLPTokenEdge(FRAX, _3CRV);
    setupLPTokenEdge(MIM, _3CRV);
    setupLPTokenEdge(USDC, _3CRV);
    setupLPTokenEdge(USDT, _3CRV);
    setupLPTokenEdge(DAI, _3CRV);
    // Add convex edges
    // const stkcvxeUSD3CRV_OLD = universe.commonTokens['stkcvxeUSD3CRV-f']
    const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f2'];
    const stkcvxMIM3LP3CRV = universe.commonTokens['stkcvxMIM-3LP3CRV-f'];
    const stkcvx3Crv = universe.commonTokens['stkcvx3Crv'];
    const stables = new Set([DAI, MIM, FRAX, USDC, USDT, pyUSD]);
    const convexBoosterAddress = Address_1.Address.from(convexBooster);
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
            return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([lpTokenQty], [BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake)]);
        }
        return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(USDC)], [
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(curveApi.createRouterEdge(USDC, lpTokenQty.token), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake),
        ]);
    };
    const [/*eUSDConvexOld,*/ eUSDConvexNew, mimConvex, threeCryptoConvex] = await Promise.all([
        // setupConvexEdge(universe, stkcvxeUSD3CRV_OLD, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvx3Crv, convexBoosterAddress),
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
    universe.defineTokenSourcingRule(universe.rTokens.RSD, stkcvxeUSD3CRV_NEW, makeStkConvexSourcingRule(eUSDConvexNew.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxMIM3LP3CRV, makeStkConvexSourcingRule(mimConvex.depositAndStakeAction));
    universe.defineTokenSourcingRule(universe.rTokens.iUSD, stkcvx3Crv, makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction));
    universe.dexAggregators.push(new __1.DexAggregator('Curve', async (_, destination, input, output, __) => {
        if (stables.has(input.token) && stables.has(output)) {
            return await new Swap_1.SwapPlan(universe, [
                curveApi.createRouterEdge(input.token, output),
            ]).quote([input], destination);
        }
        if (Object.values(universe.rTokens).includes(input.token)) {
            return await new Swap_1.SwapPlan(universe, [
                curveApi.createRouterEdge(input.token, output),
            ]).quote([input], destination);
        }
        throw new Error('Unsupported trade');
    }));
    return {
        stables,
        setupConvexEdge: Convex_1.setupConvexEdges,
        makeStkConvexSourcingRule,
        convexBoosterAddress,
    };
};
exports.initCurveOnEthereum = initCurveOnEthereum;
//# sourceMappingURL=setupCurveOnEthereum.js.map