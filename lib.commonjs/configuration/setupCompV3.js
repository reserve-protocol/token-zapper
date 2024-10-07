"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCompoundV3 = exports.CompoundV3Deployment = exports.Comet = exports.CometWrapper = void 0;
const CompoundV3_1 = require("../action/CompoundV3");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const Planner_1 = require("../tx-gen/Planner");
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
        const cometInst = contracts_1.IComet__factory.connect(comet.address.address, universe.provider);
        const { asset, priceFeed, scale, borrowCollateralFactor, liquidateCollateralFactor, liquidationFactor, supplyCap, } = await cometInst.getAssetInfo(index);
        return new CometAssetInfo(index, await universe.getToken(Address_1.Address.from(asset)), Address_1.Address.from(priceFeed), scale.toBigInt(), borrowCollateralFactor.toBigInt(), liquidateCollateralFactor.toBigInt(), liquidationFactor.toBigInt(), supplyCap.toBigInt());
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
        this.mintAction = new CompoundV3_1.MintCometWrapperAction(this);
        this.burnAction = new CompoundV3_1.BurnCometWrapperAction(this);
        this.cometWrapperLibrary = Planner_1.Contract.createContract(contracts_1.ICusdcV3Wrapper__factory.connect(this.wrapperToken.address.address, this.universe.provider));
    }
    toString() {
        return `CometWrapper(token=${this.wrapperToken},comet=${this.comet.comet})`;
    }
    static async load(compound, wrapperToken) {
        const cometWrapperInst = contracts_1.ICusdcV3Wrapper__factory.connect(wrapperToken.address.address, compound.universe.provider);
        const cometToken = await compound.universe.getToken(Address_1.Address.from(await cometWrapperInst.underlyingComet()));
        const comet = await compound.getComet(cometToken);
        return new CometWrapper(cometWrapperInst, comet, wrapperToken);
    }
}
exports.CometWrapper = CometWrapper;
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
        this.mintAction = new CompoundV3_1.MintCometAction(this);
        this.burnAction = new CompoundV3_1.BurnCometAction(this);
    }
    static async load(compound, poolToken) {
        const cometInst = contracts_1.IComet__factory.connect(poolToken.address.address, compound.universe.provider);
        const [baseToken, assetCount] = await Promise.all([
            compound.universe.getToken(Address_1.Address.from(await cometInst.baseToken())),
            await cometInst.numAssets(),
        ]);
        const collateralTokens = await Promise.all([...new Array(assetCount)].map(async (_, i) => {
            return await CometAssetInfo.load(compound.universe, poolToken, i);
        }));
        return new Comet(Planner_1.Contract.createContract(cometInst), compound, poolToken, baseToken, collateralTokens);
    }
    toString() {
        return `Comet(token=${this.comet},base=${this.borrowToken},collateral=${this.collateralTokens.map((i) => i.asset).join()}`;
    }
}
exports.Comet = Comet;
class CompoundV3Deployment {
    protocolName;
    universe;
    comets = [];
    cometWrappers = [];
    cometByBaseToken = new Map();
    cometByPoolToken = new Map();
    cometWrapperByWrapperToken = new Map();
    cometWrapperByCometToken = new Map();
    constructor(protocolName, universe) {
        this.protocolName = protocolName;
        this.universe = universe;
    }
    async getComet(poolToken) {
        if (this.cometByPoolToken.has(poolToken)) {
            return this.cometByPoolToken.get(poolToken);
        }
        const comet = await Comet.load(this, poolToken);
        this.universe.defineMintable(comet.mintAction, comet.burnAction, true);
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
        this.universe.defineMintable(wrapper.mintAction, wrapper.burnAction, true);
        this.cometWrappers.push(wrapper);
        this.cometWrapperByWrapperToken.set(wrapperToken, wrapper);
        this.cometWrapperByCometToken.set(wrapper.cometToken, wrapper);
        return wrapper;
    }
    static async load(protocolName, universe, config) {
        const compoundV3 = new CompoundV3Deployment(protocolName, universe);
        await Promise.all(config.comets.map(async (cometToken) => {
            await compoundV3.getComet(cometToken);
        }));
        await Promise.all(config.cTokenWrappers.map(async (wrapper) => {
            await compoundV3.getCometWrapper(wrapper);
        }));
        return compoundV3;
    }
    toString() {
        return `${this.protocolName}(markets=[${this.comets.join(', ')}],wrappers=[${this.cometWrappers.join(', ')}])`;
    }
}
exports.CompoundV3Deployment = CompoundV3Deployment;
const setupCompoundV3 = async (protocolName, universe, config) => {
    const [comets, wrappers] = await Promise.all([
        Promise.all(Object.values(config.comets).map((i) => universe.getToken(Address_1.Address.from(i)))),
        Promise.all(config.wrappers.map((i) => universe.getToken(Address_1.Address.from(i)))),
    ]);
    return await CompoundV3Deployment.load(protocolName, universe, {
        comets,
        cTokenWrappers: wrappers,
    });
};
exports.setupCompoundV3 = setupCompoundV3;
//# sourceMappingURL=setupCompV3.js.map