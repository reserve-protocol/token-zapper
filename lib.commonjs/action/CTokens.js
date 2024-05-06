"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCompV2Deployment = exports.BurnCTokenWrapperAction = exports.MintCTokenWrapperAction = exports.ReserveCTokenWrapper = exports.BurnCTokenAction = exports.MintCTokenAction = exports.CompoundV2Deployment = void 0;
const abi_1 = require("@ethersproject/abi");
const Address_1 = require("../base/Address");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
const CEther__factory_1 = require("../contracts/factories/contracts/ICToken.sol/CEther__factory");
const ICToken__factory_1 = require("../contracts/factories/contracts/ICToken.sol/ICToken__factory");
const Planner_1 = require("../tx-gen/Planner");
const Action_1 = require("./Action");
const ONEFP18 = 10n ** 18n;
class CompoundV2Market {
    deployment;
    cTokenInst;
    cToken;
    underlying;
    storagedRate;
    toString() {
        return `Market[${this.deployment.name}](${this.burn.input.one} = ${this.burn.quoteAction(this.storagedRate, this.burn.input.one)}, wrappers: [${this.wrappers_.join(', ')}]`;
    }
    mint;
    burn;
    instICToken;
    instCEther;
    instICTokenLib;
    instCEtherLib;
    wrappers_ = [];
    constructor(deployment, cTokenInst, cToken, underlying, storagedRate) {
        this.deployment = deployment;
        this.cTokenInst = cTokenInst;
        this.cToken = cToken;
        this.underlying = underlying;
        this.storagedRate = storagedRate;
        this.instICToken = ICToken__factory_1.ICToken__factory.connect(this.cToken.address.address, this.universe.provider);
        this.instICTokenLib = Planner_1.Contract.createContract(this.instICToken);
        this.instCEther = CEther__factory_1.CEther__factory.connect(this.cToken.address.address, this.universe.provider);
        this.instCEtherLib = Planner_1.Contract.createContract(this.instCEther);
        this.mint = new MintCTokenAction(this, underlying, cToken);
        this.burn = new BurnCTokenAction(this, cToken, underlying);
        deployment.universe.defineMintable(this.mint, this.burn, false);
    }
    createCTokenWrapper(wrapperToken) {
        const wrapper = ReserveCTokenWrapper.fromMarket(this, wrapperToken);
        this.wrappers_.push(wrapper);
        return wrapper;
    }
    async getCurrenRate() {
        return await this.deployment.getCurrentRate(this);
    }
    get universe() {
        return this.deployment.universe;
    }
    get rateScale() {
        return ONEFP18 * this.underlying.scale;
    }
    static async create(deployment, cToken) {
        const marketAddr = cToken.address;
        const universe = deployment.universe;
        let underlying;
        let tokenInst;
        try {
            const cTokenInst = ICToken__factory_1.ICToken__factory.connect(marketAddr.address, universe.provider);
            underlying = await cTokenInst.callStatic
                .underlying()
                .then(Address_1.Address.from)
                .then(async (a) => await universe.getToken(a));
            tokenInst = cTokenInst;
        }
        catch (e) {
            const cEther = CEther__factory_1.CEther__factory.connect(marketAddr.address, universe.provider);
            underlying = universe.nativeToken;
            tokenInst = cEther;
        }
        const initialRate = await tokenInst.callStatic
            .exchangeRateCurrent()
            .then((rate) => rate.toBigInt());
        return new CompoundV2Market(deployment, tokenInst, cToken, underlying, initialRate);
    }
}
class CompoundV2Deployment {
    universe;
    comptroller;
    name;
    markets_ = null;
    cTokenRateCache;
    constructor(universe, comptroller, name) {
        this.universe = universe;
        this.comptroller = comptroller;
        this.name = name;
        this.cTokenRateCache = universe.createCache(async (market) => {
            try {
                const out = await market.cTokenInst.callStatic
                    .exchangeRateCurrent()
                    .then((rate) => rate.toBigInt());
                return out;
            }
            catch (e) {
                return 0n;
            }
        }, universe.config.requoteTolerance);
    }
    async getCurrentRate(market) {
        return await this.cTokenRateCache.get(market);
    }
    async initialize() {
        const markets = await this.comptroller.instance.callStatic
            .getAllMarkets()
            .then((markets) => markets.map(Address_1.Address.from))
            .then((marketAddrs) => Promise.all(marketAddrs.map(async (marketAddr) => {
            const cToken = await this.universe.getToken(marketAddr);
            return await CompoundV2Market.create(this, cToken);
        })));
        this.markets_ = new Map(markets.map((market) => [market.cToken, market]));
        this.cTokens_ = markets.map((market) => market.cToken);
    }
    get markets() {
        if (!this.markets_) {
            throw new Error('Deployment not initialized');
        }
        return this.markets_;
    }
    async createCTokenWrapper(wrapperToken) {
        const wrapper = await ReserveCTokenWrapper.create(this, wrapperToken);
        return wrapper;
    }
    getMarket(token) {
        return this.markets.get(token);
    }
    cTokens_ = null;
    get cTokens() {
        if (!this.cTokens_) {
            throw new Error('Deployment not initialized');
        }
        return this.cTokens_;
    }
    static async create(universe, comptroller, name) {
        const compInstance = contracts_1.IComptroller__factory.connect(comptroller.address, universe.provider);
        const deployment = new CompoundV2Deployment(universe, {
            address: comptroller,
            instance: compInstance,
        }, name);
        await deployment.initialize();
        return deployment;
    }
    toString() {
        return `CompV2[${this.name}](${[...this.markets.values()].join(', ')})`;
    }
}
exports.CompoundV2Deployment = CompoundV2Deployment;
class CompV2Action extends (0, Action_1.Action)('CompV2') {
    market;
    input;
    output;
    get returnsOutput() {
        return false;
    }
    get outputSlippage() {
        return 1n;
    }
    async plan(planner, [input], _, [inputPredicted]) {
        planner.add(this.planAction(input ?? (0, Planner_1.encodeArg)(inputPredicted.amount, abi_1.ParamType.from('uint256'))));
        return null;
    }
    async quote([amountsIn]) {
        const rate = await this.market.getCurrenRate();
        return [this.quoteAction(rate, amountsIn)];
    }
    constructor(market, input, output) {
        super(market.cToken.address, [input], [output], input === market.universe.nativeToken
            ? Action_1.InteractionConvention.None
            : Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, input === market.universe.nativeToken
            ? []
            : [new Approval_1.Approval(input, output.address)]);
        this.market = market;
        this.input = input;
        this.output = output;
    }
}
class MintCTokenAction extends CompV2Action {
    market;
    gasEstimate() {
        return BigInt(150000n);
    }
    quoteAction(rate, amountsIn) {
        let out = (amountsIn.amount * this.market.rateScale) / rate / this.input.scale;
        return this.output.fromBigInt(out);
    }
    planAction(input) {
        if (this.market.cToken === this.market.universe.nativeToken) {
            return this.market.instCEtherLib.mint().withValue(input);
        }
        return this.market.instICTokenLib.mint(input);
    }
    constructor(market, input, output) {
        super(market, input, output);
        this.market = market;
    }
}
exports.MintCTokenAction = MintCTokenAction;
class BurnCTokenAction extends CompV2Action {
    market;
    get actionName() {
        return 'redeem';
    }
    gasEstimate() {
        return BigInt(150000n);
    }
    quoteAction(rate, amountsIn) {
        const out = (amountsIn.amount * rate * this.market.underlying.scale) /
            this.market.rateScale;
        return this.output.fromBigInt(out);
    }
    planAction(input) {
        if (this.market.underlying === this.market.universe.nativeToken) {
            return this.market.instCEtherLib.redeem(input);
        }
        return this.market.instICTokenLib.redeem(input);
    }
    constructor(market, input, output) {
        super(market, input, output);
        this.market = market;
    }
}
exports.BurnCTokenAction = BurnCTokenAction;
class ReserveCTokenWrapper {
    market;
    wrapperToken;
    contracts;
    mint;
    burn;
    constructor(market, wrapperToken, contracts) {
        this.market = market;
        this.wrapperToken = wrapperToken;
        this.contracts = contracts;
        this.mint = new MintCTokenWrapperAction(this);
        this.burn = new BurnCTokenWrapperAction(this);
        market.universe.defineMintable(this.mint, this.burn, false);
    }
    static fromMarket(market, wrapperToken) {
        const instWrapper = contracts_1.CTokenWrapper__factory.connect(wrapperToken.address.address, market.universe.provider);
        const weirollWrapper = Planner_1.Contract.createContract(instWrapper);
        return new ReserveCTokenWrapper(market, wrapperToken, {
            instWrapper,
            weirollWrapper,
        });
    }
    static async create(deployment, cTokenWrapperToken) {
        const instWrapper = contracts_1.CTokenWrapper__factory.connect(cTokenWrapperToken.address.address, deployment.universe.provider);
        const cToken = await instWrapper.callStatic
            .underlying()
            .then(Address_1.Address.from)
            .then(async (t) => await deployment.universe.getToken(t));
        const weirollWrapper = Planner_1.Contract.createContract(instWrapper);
        const market = deployment.getMarket(cToken);
        if (!market) {
            throw new Error('Market not found');
        }
        return new ReserveCTokenWrapper(market, cTokenWrapperToken, {
            instWrapper,
            weirollWrapper,
        });
    }
    toString() {
        return `CTokenWrapper(${this.wrapperToken}, proto=${this.market.deployment.name},token=${this.market.cToken})`;
    }
}
exports.ReserveCTokenWrapper = ReserveCTokenWrapper;
class CTokenWrapperAction extends (0, Action_1.Action)('Reserve.CTokenWrapper') {
    wrapper;
    input;
    output;
    toString() {
        return `CTokenWrapper.${this.actionName}(${this.input} => ${this.output})`;
    }
    get returnsOutput() {
        return true;
    }
    get outputSlippage() {
        return 50n;
    }
    async plan(planner, [input], _, [inputPredicted]) {
        const inp = input ?? (0, Planner_1.encodeArg)(inputPredicted.amount, abi_1.ParamType.from('uint256'));
        planner.add(this.planAction(inp));
        return [input];
    }
    async quote([amountsIn]) {
        return await Promise.resolve([this.quoteAction(amountsIn)]);
    }
    quoteAction(amountsIn) {
        return amountsIn.into(this.output);
    }
    constructor(wrapper, input, output) {
        super(wrapper.wrapperToken.address, [input], [output], input === wrapper.wrapperToken
            ? Action_1.InteractionConvention.None
            : Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, input === wrapper.wrapperToken
            ? []
            : [new Approval_1.Approval(input, output.address)]);
        this.wrapper = wrapper;
        this.input = input;
        this.output = output;
    }
}
class MintCTokenWrapperAction extends CTokenWrapperAction {
    wrapper;
    gasEstimate() {
        return BigInt(250000n);
    }
    planAction(input) {
        return this.wrapper.contracts.weirollWrapper.deposit(input, this.wrapper.market.universe.execAddress.address);
    }
    get actionName() {
        return 'deposit';
    }
    constructor(wrapper) {
        super(wrapper, wrapper.market.cToken, wrapper.wrapperToken);
        this.wrapper = wrapper;
    }
}
exports.MintCTokenWrapperAction = MintCTokenWrapperAction;
class BurnCTokenWrapperAction extends CTokenWrapperAction {
    wrapper;
    gasEstimate() {
        return BigInt(250000n);
    }
    planAction(input) {
        return this.wrapper.contracts.weirollWrapper.withdraw(input, this.wrapper.market.universe.execAddress.address);
    }
    get actionName() {
        return 'withdraw';
    }
    constructor(wrapper) {
        super(wrapper, wrapper.wrapperToken, wrapper.market.cToken);
        this.wrapper = wrapper;
    }
}
exports.BurnCTokenWrapperAction = BurnCTokenWrapperAction;
const loadCompV2Deployment = async (protocolName, universe, definition) => {
    const comptroller = Address_1.Address.from(definition.comptroller);
    const deployment = await CompoundV2Deployment.create(universe, comptroller, protocolName);
    await Promise.all(definition.wrappers.map(async (wrapper) => {
        const token = await universe.getToken(Address_1.Address.from(wrapper));
        await deployment.createCTokenWrapper(token);
    }));
    return deployment;
};
exports.loadCompV2Deployment = loadCompV2Deployment;
//# sourceMappingURL=CTokens.js.map