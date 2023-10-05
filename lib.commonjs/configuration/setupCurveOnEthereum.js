"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCurveOnEthereum = exports.PostTradeAction = exports.BasketTokenSourcingRuleApplication = void 0;
const Convex_1 = require("../action/Convex");
const Curve_1 = require("../action/Curve");
const Address_1 = require("../base/Address");
const Swap_1 = require("../searcher/Swap");
const BasketTokenSourcingRules_1 = require("../searcher/BasketTokenSourcingRules");
var BasketTokenSourcingRules_2 = require("../searcher/BasketTokenSourcingRules");
Object.defineProperty(exports, "BasketTokenSourcingRuleApplication", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.BasketTokenSourcingRuleApplication; } });
Object.defineProperty(exports, "PostTradeAction", { enumerable: true, get: function () { return BasketTokenSourcingRules_2.PostTradeAction; } });
const initCurveOnEthereum = async (universe, convexBooster) => {
    const MIM = universe.commonTokens.MIM;
    const FRAX = universe.commonTokens.FRAX;
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const curveApi = await (0, Curve_1.loadCurve)(universe, 
    // Some tokens only really have one way to be soured, like:
    // USDC/USDT -> MIN/eUSD LP
    // This will make UI applications snappier as they will not have to
    // to do any searching
    ((await Promise.resolve().then(() => __importStar(require('./data/ethereum/precomputed-curve-routes.json')))).default));
    const eUSD__FRAX_USDC = universe.commonTokens['eUSD3CRV-f'];
    const mim_3CRV = universe.commonTokens['MIM-3LP3CRV-f'];
    const _3CRV = universe.commonTokens['3CRV'];
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
    const [eUSDConvex, mimConvex, threeCryptoConvex,] = await Promise.all([
        (0, Convex_1.setupConvexEdges)(universe, stkcvxeUSD3CRV, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvxMIM3LP3CRV, convexBoosterAddress),
        (0, Convex_1.setupConvexEdges)(universe, stkcvx3Crv, convexBoosterAddress),
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
            return await new Swap_1.SwapPlan(universe, [
                curveApi.createRouterEdge(input.token, stable),
            ]).quote([input], dest);
        });
    }
    return {
        stables,
        setupConvexEdge: Convex_1.setupConvexEdges,
        makeStkConvexSourcingRule,
        convexBoosterAddress
    };
};
exports.initCurveOnEthereum = initCurveOnEthereum;
//# sourceMappingURL=setupCurveOnEthereum.js.map