"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCurveOnEthereum = exports.PostTradeAction = exports.BasketTokenSourcingRuleApplication = void 0;
const Convex_1 = require("../action/Convex");
const Curve_1 = require("../action/Curve");
const Address_1 = require("../base/Address");
const BasketTokenSourcingRules_1 = require("../searcher/BasketTokenSourcingRules");
const Swap_1 = require("../searcher/Swap");
const CurveStableSwapNG_1 = require("../action/CurveStableSwapNG");
const RouterAction_1 = require("../action/RouterAction");
const DexAggregator_1 = require("../aggregators/DexAggregator");
var BasketTokenSourcingRules_2 = require("../searcher/BasketTokenSourcingRules");
Object.defineProperty(exports, "BasketTokenSourcingRuleApplication", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.BasketTokenSourcingRuleApplication; } });
Object.defineProperty(exports, "PostTradeAction", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.PostTradeAction; } });
const initCurveOnEthereum = async (universe, convexBooster, lpActionSlippage) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const pyUSD = universe.commonTokens.pyUSD;
    const curveApi = await (0, Curve_1.loadCurve)(universe);
    const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f'];
    const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f'];
    const _3CRV = universe.commonTokens['3CRV'];
    // We will not implement the full curve router,
    // But rather some predefined paths that are likely to be used
    // by users
    // curveApi.createRouterEdge(USDC, USDT);
    // curveApi.createRouterEdge(USDT, USDC);
    const setupBidirectionalEdge = async (tokenA, tokenB, slippage) => {
        curveApi.createRouterEdge(tokenA, tokenB.token, slippage);
        curveApi.createRouterEdge(tokenB, tokenA.token, slippage);
    };
    await setupBidirectionalEdge(universe.wrappedNativeToken.from(10), eUSD__FRAX_USDC.from(1000), lpActionSlippage);
    await setupBidirectionalEdge(FRAX.from(1000), eUSD__FRAX_USDC.from(1000), lpActionSlippage);
    await setupBidirectionalEdge(MIM.from(1000), eUSD__FRAX_USDC.from(1000), lpActionSlippage);
    await setupBidirectionalEdge(USDT.from(1000), eUSD__FRAX_USDC.from(1000), lpActionSlippage);
    await setupBidirectionalEdge(DAI.from(1000), eUSD__FRAX_USDC.from(1000), lpActionSlippage);
    universe.defineMintable(await curveApi.createRouterEdge(USDC.from(10000.0), eUSD__FRAX_USDC, 100n), await curveApi.createRouterEdge(eUSD__FRAX_USDC.from(10000.0), USDC, 100n), true);
    await setupBidirectionalEdge(FRAX.from(1000), mim_3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(MIM.from(1000), mim_3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDC.from(1000), mim_3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDT.from(1000), mim_3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(DAI.from(1000), mim_3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(FRAX.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(MIM.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDC.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDT.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(DAI.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(FRAX.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(MIM.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDC.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(USDT.from(1000), _3CRV.from(10000), lpActionSlippage);
    await setupBidirectionalEdge(DAI.from(1000), _3CRV.from(10000), lpActionSlippage);
    // Add convex edges
    // const stkcvxeUSD3CRV_OLD = universe.commonTokens['stkcvxeUSD3CRV-f']
    // const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f2']
    const stkcvxeUSD3CRV_NEW = universe.commonTokens['stkcvxeUSD3CRV-f3'];
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
        const lpTokenQty = unitAmount.into(depositAndStake.inputToken[0]);
        if (stables.has(input)) {
            return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([lpTokenQty], [BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake)]);
        }
        return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(USDC)], [
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(await curveApi.createRouterEdge(unitAmount.into(USDC), lpTokenQty.token, lpActionSlippage), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake),
        ]);
    };
    const pyUSDCPool = await (0, CurveStableSwapNG_1.setupCurveStableSwapNGPool)(universe, universe.commonTokens.PYUSDUSDC);
    const [
    /*eUSDConvexOld,*/ eUSDConvexNew, mimConvex, threeCryptoConvex, pyUSDCPoolConvex,] = await Promise.all([
        (0, Convex_1.setupConvexEdges)(universe, stkcvxeUSD3CRV_NEW, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvx3Crv, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, universe.commonTokens.stkcvxPYUSDUSDC, convexBoosterAddress),
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
    universe.defineTokenSourcingRule(universe.commonTokens.stkcvxPYUSDUSDC, async (input, unitAmount) => {
        const depositAndStake = pyUSDCPoolConvex.depositAndStakeAction;
        if (input === pyUSDCPool.pool) {
            return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unitAmount], [BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake)]);
        }
        const precursor = pyUSDCPool.underlying.includes(input) ? input : USDC;
        return BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(precursor)], [
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(pyUSDCPool.getAddLiquidityAction(input), true // Cause the Zapper to recalculate the inputs of the mints for the next step
            ),
            BasketTokenSourcingRules_1.PostTradeAction.fromAction(depositAndStake),
        ]);
    });
    const dex = new DexAggregator_1.DexRouter('Eth.Curve', async (abort, input, output, slippage) => {
        return await new Swap_1.SwapPlan(universe, [
            await curveApi.createRouterEdge(input, output, slippage),
        ]).quote([input], universe.execAddress);
    }, true, whitelistedRouterSwaps, whitelistedRouterSwaps);
    return {
        stables,
        setupConvexEdge: Convex_1.setupConvexEdges,
        makeStkConvexSourcingRule,
        convexBoosterAddress,
        venue: new DexAggregator_1.TradingVenue(universe, dex, async (input, output) => {
            return new RouterAction_1.RouterAction(dex, universe, curveApi.routerAddress, input, output, universe.config.defaultInternalTradeSlippage);
        }),
    };
};
exports.initCurveOnEthereum = initCurveOnEthereum;
//# sourceMappingURL=setupCurveOnEthereum.js.map