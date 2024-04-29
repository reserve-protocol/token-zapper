import { Action, DestinationOptions, InteractionConvention, } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { IComet__factory, ICusdcV3Wrapper__factory, } from '../contracts';
import { Contract } from '../tx-gen/Planner';
export class BaseCometAction extends Action('CompV3') {
    comet;
    actionName;
    toString() {
        return `${this.protocol}.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
    async quote([amountsIn]) {
        return [this.outputToken[0].from(amountsIn.amount)];
    }
    get receiptToken() {
        return this.outputToken[0];
    }
    get universe() {
        return this.comet.universe;
    }
    gasEstimate() {
        return BigInt(250000n);
    }
    constructor(comet, actionName, opts) {
        super(comet.comet.address, opts.inputToken, opts.outputToken, opts.interaction, opts.destination, opts.approvals);
        this.comet = comet;
        this.actionName = actionName;
    }
    async plan(planner, [input], destination, [predicted]) {
        this.planAction(planner, destination, input, predicted);
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.outputToken[0], destination);
        return [out];
    }
}
class MintCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet, 'supply', {
            inputToken: [comet.borrowToken],
            outputToken: [comet.comet],
            interaction: InteractionConvention.ApprovalRequired,
            destination: DestinationOptions.Callee,
            approvals: [new Approval(comet.borrowToken, comet.comet.address)],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.supplyTo(destination.address, this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
class MintCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.comet, 'deposit', {
            inputToken: [cometWrapper.cometToken],
            outputToken: [cometWrapper.wrapperToken],
            interaction: InteractionConvention.ApprovalRequired,
            destination: DestinationOptions.Callee,
            approvals: [
                new Approval(cometWrapper.cometToken, cometWrapper.wrapperToken.address),
            ],
        });
        this.cometWrapper = cometWrapper;
    }
    toString() {
        return `[reserve-wrapper]${this.cometWrapper.wrapperToken.toString()})`;
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(await this.cometWrapper.cometWrapperInst.convertDynamicToStatic(amountsIn.amount)),
        ];
    }
    planAction(planner, _, input, predicted) {
        planner.add(this.cometWrapper.cometWrapperLibrary.deposit(input ?? predicted.amount));
    }
}
class BurnCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet, 'burn', {
            inputToken: [comet.comet],
            outputToken: [comet.borrowToken],
            interaction: InteractionConvention.None,
            destination: DestinationOptions.Callee,
            approvals: [],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.withdraw(this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
class BurnCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.comet, 'withdraw', {
            inputToken: [cometWrapper.wrapperToken],
            outputToken: [cometWrapper.cometToken],
            interaction: InteractionConvention.None,
            destination: DestinationOptions.Callee,
            approvals: [],
        });
        this.cometWrapper = cometWrapper;
    }
    async quote([amountsIn]) {
        return [
            this.cometWrapper.cometToken.from(await this.cometWrapper.cometWrapperInst.convertStaticToDynamic(amountsIn.amount)),
        ];
    }
    planAction(planner, _, input, predicted) {
        const amt = planner.add(this.cometWrapper.cometWrapperLibrary.convertStaticToDynamic(input ?? predicted.amount));
        planner.add(this.cometWrapper.cometWrapperLibrary.withdraw(amt));
    }
}
class CometAssetInfo {
    offset;
    asset;
    priceFeed;
    scale;
    borrowCollateralFactor;
    liquidateCollateralFactor;
    liquidationFactor;
    supplyCap;
    constructor(offset, asset, priceFeed, scale, borrowCollateralFactor, liquidateCollateralFactor, liquidationFactor, supplyCap) {
        this.offset = offset;
        this.asset = asset;
        this.priceFeed = priceFeed;
        this.scale = scale;
        this.borrowCollateralFactor = borrowCollateralFactor;
        this.liquidateCollateralFactor = liquidateCollateralFactor;
        this.liquidationFactor = liquidationFactor;
        this.supplyCap = supplyCap;
    }
    static async load(universe, comet, index) {
        const cometInst = IComet__factory.connect(comet.address.address, universe.provider);
        const { asset, priceFeed, scale, borrowCollateralFactor, liquidateCollateralFactor, liquidationFactor, supplyCap, } = await cometInst.getAssetInfo(index);
        return new CometAssetInfo(index, await universe.getToken(Address.from(asset)), Address.from(priceFeed), scale.toBigInt(), borrowCollateralFactor.toBigInt(), liquidateCollateralFactor.toBigInt(), liquidationFactor.toBigInt(), supplyCap.toBigInt());
    }
    toString() {
        return `CometAssetInfo(${this.asset},priceFeed:${this.priceFeed})`;
    }
}
class CometWrapper {
    cometWrapperInst;
    comet;
    wrapperToken;
    mintAction;
    burnAction;
    cometWrapperLibrary;
    get universe() {
        return this.comet.compound.universe;
    }
    get cometToken() {
        return this.comet.comet;
    }
    constructor(cometWrapperInst, comet, wrapperToken) {
        this.cometWrapperInst = cometWrapperInst;
        this.comet = comet;
        this.wrapperToken = wrapperToken;
        this.mintAction = new MintCometWrapperAction(this);
        this.burnAction = new BurnCometWrapperAction(this);
        this.cometWrapperLibrary = Contract.createContract(ICusdcV3Wrapper__factory.connect(this.wrapperToken.address.address, this.universe.provider));
    }
    toString() {
        return `CometWrapper(token=${this.wrapperToken},comet=${this.comet.comet})`;
    }
    static async load(compound, wrapperToken) {
        const cometWrapperInst = ICusdcV3Wrapper__factory.connect(wrapperToken.address.address, compound.universe.provider);
        const cometToken = await compound.universe.getToken(Address.from(await cometWrapperInst.underlyingComet()));
        const comet = await compound.getComet(cometToken);
        return new CometWrapper(cometWrapperInst, comet, wrapperToken);
    }
}
class Comet {
    cometLibrary;
    compound;
    comet;
    borrowToken;
    collateralTokens;
    get universe() {
        return this.compound.universe;
    }
    mintAction;
    burnAction;
    constructor(cometLibrary, compound, comet, borrowToken, collateralTokens) {
        this.cometLibrary = cometLibrary;
        this.compound = compound;
        this.comet = comet;
        this.borrowToken = borrowToken;
        this.collateralTokens = collateralTokens;
        this.mintAction = new MintCometAction(this);
        this.burnAction = new BurnCometAction(this);
    }
    static async load(compound, poolToken) {
        const cometInst = IComet__factory.connect(poolToken.address.address, compound.universe.provider);
        const [baseToken, assetCount] = await Promise.all([
            compound.universe.getToken(Address.from(await cometInst.baseToken())),
            await cometInst.numAssets(),
        ]);
        const collateralTokens = await Promise.all([...new Array(assetCount)].map(async (_, i) => {
            return await CometAssetInfo.load(compound.universe, poolToken, i);
        }));
        return new Comet(Contract.createContract(cometInst), compound, poolToken, baseToken, collateralTokens);
    }
    toString() {
        return `Comet(token=${this.comet},base=${this.borrowToken},collateral=${this.collateralTokens.map((i) => i.asset).join()}`;
    }
}
class CompoundV3 {
    universe;
    comets = [];
    cometWrappers = [];
    cometByBaseToken = new Map();
    cometByPoolToken = new Map();
    cometWrapperByWrapperToken = new Map();
    cometWrapperByCometToken = new Map();
    constructor(universe) {
        this.universe = universe;
    }
    async getComet(poolToken) {
        if (this.cometByPoolToken.has(poolToken)) {
            return this.cometByPoolToken.get(poolToken);
        }
        const comet = await Comet.load(this, poolToken);
        this.universe.defineMintable(comet.mintAction, comet.burnAction, false);
        this.comets.push(comet);
        this.cometByBaseToken.set(comet.borrowToken, comet);
        this.cometByPoolToken.set(poolToken, comet);
        return comet;
    }
    async getCometWrapper(wrapperToken) {
        if (this.cometWrapperByWrapperToken.has(wrapperToken)) {
            return this.cometWrapperByWrapperToken.get(wrapperToken);
        }
        const wrapper = await CometWrapper.load(this, wrapperToken);
        this.universe.defineMintable(wrapper.mintAction, wrapper.burnAction, false);
        this.cometWrappers.push(wrapper);
        this.cometWrapperByWrapperToken.set(wrapperToken, wrapper);
        this.cometWrapperByCometToken.set(wrapper.cometToken, wrapper);
        return wrapper;
    }
    static async load(universe, config) {
        const compoundV3 = new CompoundV3(universe);
        await Promise.all(config.comets.map(async (cometToken) => {
            await compoundV3.getComet(cometToken);
        }));
        await Promise.all(config.cTokenWrappers.map(async (wrapper) => {
            await compoundV3.getCometWrapper(wrapper);
        }));
        return compoundV3;
    }
    toString() {
        return `CompoundV3(comets=[${this.comets.join(', ')}], wrappers=[${this.cometWrappers.join(', ')}])`;
    }
}
export const setupCompoundV3 = async (universe, config) => {
    return await CompoundV3.load(universe, config);
};
//# sourceMappingURL=setupCompV3.js.map