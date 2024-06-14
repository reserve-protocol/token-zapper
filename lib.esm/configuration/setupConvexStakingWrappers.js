import { ParamType } from '@ethersproject/abi';
import { Action, DestinationOptions, InteractionConvention, isMultiChoiceEdge, } from '../action/Action';
import { CurveStableSwapNGPool } from '../action/CurveStableSwapNG';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ConvexStakingWrapper__factory, IBooster__factory, } from '../contracts';
import { BasketTokenSourcingRuleApplication, PostTradeAction, } from '../searcher/BasketTokenSourcingRules';
import { Contract, encodeArg, } from '../tx-gen/Planner';
import { PriceOracle } from '../oracles/PriceOracle';
class BaseConvexStakingWrapper extends Action('ConvexStakingWrapper') {
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
        planner.add(this.planAction(input ?? encodeArg(inputPredicted.amount, ParamType.from('uint256'))));
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
        super(wrapper.wrapperToken.address, [wrapper.curveToken], [wrapper.wrapperToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(wrapper.curveToken, wrapper.wrapperToken.address)]);
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
        super(wrapper.wrapperToken.address, [wrapper.convexToken], [wrapper.wrapperToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(wrapper.convexToken, wrapper.wrapperToken.address)]);
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
        super(wrapper.wrapperToken.address, [wrapper.wrapperToken], [wrapper.curveToken], InteractionConvention.None, DestinationOptions.Callee, []);
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
        super(wrapper.wrapperToken.address, [wrapper.wrapperToken], [wrapper.convexToken], InteractionConvention.None, DestinationOptions.Callee, []);
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
        handlers.set(curveLpToken, async (unit) => BasketTokenSourcingRuleApplication.singleBranch([unit.into(curveLpToken)], [PostTradeAction.fromAction(this.curveLpToWrapper)]));
        handlers.set(convexDepositToken, async (unit) => BasketTokenSourcingRuleApplication.singleBranch([unit.into(this.convexToken)], [PostTradeAction.fromAction(this.convexDepositToWrapper)]));
        for (const token of curvePool.allPoolTokens) {
            if (token == curveLpToken) {
                continue;
            }
            handlers.set(token, async (unit) => {
                const edge = await this.curve.findDepositAction(token.one, curveLpToken);
                const out = await edge.quote([token.one]);
                const inputQty = unit.div(out[0]).into(token);
                return BasketTokenSourcingRuleApplication.singleBranch([inputQty], [
                    PostTradeAction.fromAction(edge, true),
                    PostTradeAction.fromAction(this.curveLpToWrapper, true),
                ]);
            });
        }
        const oracle = PriceOracle.createSingleTokenOracle(this.universe, this.wrapperToken, async () => (await this.universe.fairPrice(this.curvePool.lpToken.one)) ??
            this.universe.usd.zero);
        this.universe.oracles.push(oracle);
        this.universe.defineTokenSourcingRule(this.wrapperToken, async (token, unit) => {
            const handler = handlers.get(token);
            if (handler == null) {
                if (this.curvePool instanceof CurveStableSwapNGPool) {
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
                const act = await this.universe.createTradeEdge(curveLpToken, baseTok);
                if (isMultiChoiceEdge(act)) {
                    for (const a of act.choices) {
                        this.universe.addAction(a);
                    }
                }
                else {
                    this.universe.addAction(act);
                }
            }
            catch (e) { }
        }
    }
    static async fromConfigAddress(curveIntegration, boosterInst, { wrapperAddress, name, }) {
        const wrapperTokenInst = ConvexStakingWrapper__factory.connect(wrapperAddress, curveIntegration.universe.provider);
        const [wrapperToken, curveToken, convexToken, convexPoolId, convexPoolAddress,] = await Promise.all([
            curveIntegration.universe.getToken(Address.from(wrapperAddress)),
            wrapperTokenInst.callStatic
                .curveToken()
                .then(Address.from)
                .then(async (a) => await curveIntegration.universe.getToken(a)),
            wrapperTokenInst.callStatic
                .convexToken()
                .then(Address.from)
                .then(async (a) => await curveIntegration.universe.getToken(a)),
            wrapperTokenInst.callStatic.convexPoolId().then(Number),
            wrapperTokenInst.callStatic.convexPool().then(Address.from),
        ]);
        const poolInfo = await boosterInst.callStatic.poolInfo(convexPoolId);
        const lpToken = await curveIntegration.universe.getToken(Address.from(poolInfo.lptoken));
        const stdPool = curveIntegration.curvePools.poolByLPToken.get(lpToken) ??
            curveIntegration.curvePools.poolByPoolAddress.get(lpToken.address);
        const ngPool = curveIntegration.specialCasePools.poolByLPToken.get(lpToken) ??
            curveIntegration.specialCasePools.poolByPoolAddress.get(lpToken.address);
        if (stdPool == null && ngPool == null) {
            throw new Error(`Could not find curve pool for token ${wrapperToken} ${curveToken} ${curveToken.address} ${convexPoolAddress} ${convexPoolId}`);
        }
        const out = new ConvexStakingWrapper(curveIntegration, wrapperToken, curveToken, convexToken, convexPoolAddress, stdPool ?? ngPool, convexPoolId, {
            contracts: {
                wrapperTokenInst: wrapperTokenInst,
                boosterInst: boosterInst,
            },
            weiroll: {
                wrapperToken: Contract.createContract(wrapperTokenInst),
                boosterInst: Contract.createContract(boosterInst),
            },
        });
        await out.attachToUniverse();
        return out;
    }
}
export class ReserveConvex {
    wrapperTokens;
    constructor(wrapperTokens) {
        this.wrapperTokens = wrapperTokens;
    }
    toString() {
        return `ReserveConvex(${this.wrapperTokens.join(', ')})`;
    }
}
export const setupConvexStakingWrappers = async (universe, curveIntegration, config) => {
    const boosterAddress = Address.from(config.boosterAddress);
    const boosterInst = IBooster__factory.connect(boosterAddress.address, universe.provider);
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
//# sourceMappingURL=setupConvexStakingWrappers.js.map