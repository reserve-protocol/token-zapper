"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConvexStakingWrappers = exports.ReserveConvex = void 0;
const abi_1 = require("@ethersproject/abi");
const Action_1 = require("../action/Action");
const CurveStableSwapNG_1 = require("../action/CurveStableSwapNG");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const BasketTokenSourcingRules_1 = require("../searcher/BasketTokenSourcingRules");
const Planner_1 = require("../tx-gen/Planner");
class BaseConvexStakingWrapper extends (0, Action_1.Action)('ConvexStakingWrapper') {
    toString() {
        return `ConvexStakingWrapper.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
    get supportsDynamicInput() {
        return true;
    }
    get oneUsePrZap() {
        return false;
    }
    get returnsOutput() {
        return false;
    }
    get outputSlippage() {
        return 1n;
    }
    async quote(amountsIn) {
        return amountsIn.map((tok, i) => tok.into(this.outputToken[i]));
    }
    async plan(planner, [input], _, [inputPredicted]) {
        planner.add(this.planAction(input ?? (0, Planner_1.encodeArg)(inputPredicted.amount, abi_1.ParamType.from('uint256'))));
        return null;
    }
}
class CurveLpToWrapper extends BaseConvexStakingWrapper {
    universe;
    wrapper;
    planAction(input) {
        return this.wrapper.contracts.weiroll.wrapperToken.deposit(input, this.universe.execAddress.address);
    }
    get actionName() {
        return 'deposit';
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, wrapper) {
        super(wrapper.wrapperToken.address, [wrapper.curveToken], [wrapper.wrapperToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(wrapper.curveToken, wrapper.wrapperToken.address)]);
        this.universe = universe;
        this.wrapper = wrapper;
    }
}
class ConvexDepositToWrapper extends BaseConvexStakingWrapper {
    universe;
    wrapper;
    planAction(input) {
        return this.wrapper.contracts.weiroll.wrapperToken.stake(input, this.universe.execAddress.address);
    }
    get actionName() {
        return 'stake';
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, wrapper) {
        super(wrapper.wrapperToken.address, [wrapper.convexToken], [wrapper.wrapperToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(wrapper.convexToken, wrapper.wrapperToken.address)]);
        this.universe = universe;
        this.wrapper = wrapper;
    }
}
class WrapperToCurveLp extends BaseConvexStakingWrapper {
    universe;
    wrapper;
    planAction(input) {
        return this.wrapper.contracts.weiroll.wrapperToken.withdrawAndUnwrap(input);
    }
    get actionName() {
        return 'withdrawAndUnwrap';
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, wrapper) {
        super(wrapper.wrapperToken.address, [wrapper.wrapperToken], [wrapper.curveToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrapper = wrapper;
    }
}
class WrapperToConvexDeposit extends BaseConvexStakingWrapper {
    universe;
    wrapper;
    planAction(input) {
        return this.wrapper.contracts.weiroll.wrapperToken.withdraw(input);
    }
    get actionName() {
        return 'withdraw';
    }
    gasEstimate() {
        return 250000n;
    }
    constructor(universe, wrapper) {
        super(wrapper.wrapperToken.address, [wrapper.wrapperToken], [wrapper.convexToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.wrapper = wrapper;
    }
}
class ConvexStakingWrapper {
    curve;
    wrapperToken;
    curveToken;
    convexToken;
    convexPoolAddress;
    curvePool;
    convexPoolId;
    contracts;
    toString() {
        return `ConvexStakingWrapper(${this.curvePool.lpToken}(${this.curvePool.lpToken.address}) => ${this.wrapperToken}(${this.wrapperToken.address}))`;
    }
    curveLpToWrapper;
    convexDepositToWrapper;
    unwrapToCurveLp;
    unwrapToConvexDeposit;
    get universe() {
        return this.curve.universe;
    }
    constructor(curve, wrapperToken, curveToken, convexToken, convexPoolAddress, curvePool, convexPoolId, contracts) {
        this.curve = curve;
        this.wrapperToken = wrapperToken;
        this.curveToken = curveToken;
        this.convexToken = convexToken;
        this.convexPoolAddress = convexPoolAddress;
        this.curvePool = curvePool;
        this.convexPoolId = convexPoolId;
        this.contracts = contracts;
        this.curveLpToWrapper = new CurveLpToWrapper(this.universe, this);
        this.convexDepositToWrapper = new ConvexDepositToWrapper(this.universe, this);
        this.unwrapToCurveLp = new WrapperToCurveLp(this.universe, this);
        this.unwrapToConvexDeposit = new WrapperToConvexDeposit(this.universe, this);
    }
    async attachToUniverse() {
        const curvePool = this.curvePool;
        this.universe.defineMintable(this.curveLpToWrapper, this.unwrapToCurveLp);
        // Define token sourcing rule for the curve pool
        const curveLpToken = curvePool.lpToken;
        const convexDepositToken = this.convexToken;
        const handlers = new Map();
        handlers.set(curveLpToken, async (unit) => BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unit.into(curveLpToken)], [BasketTokenSourcingRules_1.PostTradeAction.fromAction(this.curveLpToWrapper)]));
        handlers.set(convexDepositToken, async (unit) => BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unit.into(this.convexToken)], [BasketTokenSourcingRules_1.PostTradeAction.fromAction(this.convexDepositToWrapper)]));
        for (const token of curvePool.allPoolTokens) {
            if (token == curveLpToken) {
                continue;
            }
            handlers.set(token, async (unit) => BasketTokenSourcingRules_1.BasketTokenSourcingRuleApplication.singleBranch([unit.into(token)], [
                BasketTokenSourcingRules_1.PostTradeAction.fromAction(await this.curve.findDepositAction(unit.into(token), curveLpToken), true),
                BasketTokenSourcingRules_1.PostTradeAction.fromAction(this.curveLpToWrapper, true),
            ]));
        }
        this.universe.defineTokenSourcingRule(this.wrapperToken, async (token, unit) => {
            const handler = handlers.get(token);
            if (handler == null) {
                if (this.curvePool instanceof CurveStableSwapNG_1.CurveStableSwapNGPool) {
                    const randInput = [...this.curvePool.underlying][0];
                    return await handlers.get(randInput)(unit);
                }
                else {
                    const randInput = [...this.curvePool.assetType.bestInputTokens][0];
                    return await handlers.get(randInput)(unit);
                }
            }
            return await handler(unit);
        });
        for (const baseTok of this.curvePool.allPoolTokens) {
            try {
                if (this.universe.wrappedTokens.has(baseTok)) {
                    continue;
                }
                const acts = await this.universe.createTradeEdge(curveLpToken, baseTok);
                for (const act of acts) {
                    // console.log('Adding action', act.toString())
                    this.universe.addAction(act);
                }
            }
            catch (e) { }
        }
    }
    static async fromConfigAddress(curveIntegration, boosterInst, { wrapperAddress, name, }) {
        const wrapperTokenInst = contracts_1.ConvexStakingWrapper__factory.connect(wrapperAddress, curveIntegration.universe.provider);
        const [wrapperToken, curveToken, convexToken, convexPoolId, convexPoolAddress,] = await Promise.all([
            curveIntegration.universe.getToken(Address_1.Address.from(wrapperAddress)),
            wrapperTokenInst.callStatic
                .curveToken()
                .then(Address_1.Address.from)
                .then(async (a) => await curveIntegration.universe.getToken(a)),
            wrapperTokenInst.callStatic
                .convexToken()
                .then(Address_1.Address.from)
                .then(async (a) => await curveIntegration.universe.getToken(a)),
            wrapperTokenInst.callStatic.convexPoolId().then(Number),
            wrapperTokenInst.callStatic.convexPool().then(Address_1.Address.from),
        ]);
        const poolInfo = await boosterInst.callStatic.poolInfo(convexPoolId);
        const lpToken = await curveIntegration.universe.getToken(Address_1.Address.from(poolInfo.lptoken));
        const stdPool = curveIntegration.curvePools.poolByLPToken.get(lpToken) ??
            curveIntegration.curvePools.poolByPoolAddress.get(lpToken.address);
        const ngPool = curveIntegration.ngCurvePools.poolByLPToken.get(lpToken) ??
            curveIntegration.ngCurvePools.poolByPoolAddress.get(lpToken.address);
        if (stdPool == null && ngPool == null) {
            throw new Error(`Could not find curve pool for token ${wrapperToken} ${curveToken} ${curveToken.address} ${convexPoolAddress} ${convexPoolId}`);
        }
        const out = new ConvexStakingWrapper(curveIntegration, wrapperToken, curveToken, convexToken, convexPoolAddress, stdPool ?? ngPool, convexPoolId, {
            contracts: {
                wrapperTokenInst: wrapperTokenInst,
                boosterInst: boosterInst,
            },
            weiroll: {
                wrapperToken: Planner_1.Contract.createContract(wrapperTokenInst),
                boosterInst: Planner_1.Contract.createContract(boosterInst),
            },
        });
        await out.attachToUniverse();
        return out;
    }
}
class ReserveConvex {
    wrapperTokens;
    constructor(wrapperTokens) {
        this.wrapperTokens = wrapperTokens;
    }
    toString() {
        return `ReserveConvex(${this.wrapperTokens.join(', ')})`;
    }
}
exports.ReserveConvex = ReserveConvex;
const setupConvexStakingWrappers = async (universe, curveIntegration, config) => {
    const boosterAddress = Address_1.Address.from(config.boosterAddress);
    const boosterInst = contracts_1.IBooster__factory.connect(boosterAddress.address, universe.provider);
    // Load all the convex wrapper tokens
    const convexWrappers = await Promise.all(Object.entries(config.wrappers).map(async ([name, wrapperAddress]) => await ConvexStakingWrapper.fromConfigAddress(curveIntegration, boosterInst, {
        name,
        wrapperAddress,
    }).catch((e) => {
        console.log(e);
        return null;
    })));
    return new ReserveConvex(convexWrappers.filter((x) => x != null));
};
exports.setupConvexStakingWrappers = setupConvexStakingWrappers;
//# sourceMappingURL=setupConvexStakingWrappers.js.map