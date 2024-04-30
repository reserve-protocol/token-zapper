"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnRTokenAction = exports.MintRTokenAction = exports.RTokenDeployment = void 0;
const Address_1 = require("../base/Address");
const Action_1 = require("./Action");
const Approval_1 = require("../base/Approval");
const contracts_1 = require("../contracts");
class RTokenDeployment {
    universe;
    rToken;
    unitBasket_;
    contracts;
    mintEstimate;
    burnEstimate;
    burn;
    mint;
    block;
    async unitBasket() {
        if (Math.abs(this.block - this.universe.currentBlock) >
            this.universe.config.requoteTolerance) {
            this.unitBasket_ = await this.contracts.basketHandler
                .quote(this.rToken.scale, 0)
                .then(async ([basketTokens, amts]) => await Promise.all(basketTokens.map(async (addr, index) => await this.universe
                .getToken(Address_1.Address.from(addr))
                .then((basketToken) => basketToken.from(amts[index])))));
            this.block = this.universe.currentBlock;
        }
        return this.unitBasket_;
    }
    basket;
    constructor(universe, rToken, unitBasket_, contracts, mintEstimate, burnEstimate) {
        this.universe = universe;
        this.rToken = rToken;
        this.unitBasket_ = unitBasket_;
        this.contracts = contracts;
        this.mintEstimate = mintEstimate;
        this.burnEstimate = burnEstimate;
        this.block = universe.currentBlock;
        this.basket = this.unitBasket_.map((i) => i.token);
        this.burn = new BurnRTokenAction(this);
        this.mint = new MintRTokenAction(this);
    }
    static async load(uni, facadeAddress, rToken, mintEstimate = 1000000n, burnEstimate = 1000000n) {
        const rTokenInst = contracts_1.IRToken__factory.connect(rToken.address.address, uni.provider);
        const facade = contracts_1.IFacade__factory.connect(facadeAddress.address, uni.provider);
        const mainAddr = Address_1.Address.from(await rTokenInst.main());
        const mainInst = contracts_1.IMain__factory.connect(mainAddr.address, uni.provider);
        const [basketHandlerAddr, assetRegAddr] = await Promise.all([
            mainInst.basketHandler().then((i) => Address_1.Address.from(i)),
            mainInst.assetRegistry().then((i) => Address_1.Address.from(i)),
        ]);
        const basketHandlerInst = contracts_1.IBasketHandler__factory.connect(basketHandlerAddr.address, uni.provider);
        const uniBasket = await basketHandlerInst
            .quote(rToken.scale, 0)
            .then(async ([basketTokens, amts]) => await Promise.all(basketTokens.map(async (addr, index) => await uni
            .getToken(Address_1.Address.from(addr))
            .then((basketToken) => basketToken.from(amts[index])))));
        return new RTokenDeployment(uni, rToken, uniBasket, {
            facade,
            basketHandler: basketHandlerInst,
            main: mainInst,
            rToken: rTokenInst,
            rTokenLens: contracts_1.RTokenLens__factory.connect(uni.config.addresses.rtokenLens.address, uni.provider),
            assetRegistry: contracts_1.IAssetRegistry__factory.connect(assetRegAddr.address, uni.provider),
        }, mintEstimate, burnEstimate);
    }
}
exports.RTokenDeployment = RTokenDeployment;
class ReserveRTokenBase extends (0, Action_1.Action)('Reserve.RToken') {
    toString() {
        return `RToken(action=${this.action}, ${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')}`;
    }
}
class MintRTokenAction extends ReserveRTokenBase {
    rTokenDeployment;
    action = 'issue';
    async plan(planner, _, __) {
        planner.add(this.universe.weirollZapperExec.mintMaxRToken(this.universe.config.addresses.facadeAddress.address, this.address.address, this.universe.execAddress.address));
        return [this.generateOutputTokenBalance(this.universe, planner)];
    }
    get universe() {
        return this.rTokenDeployment.universe;
    }
    gasEstimate() {
        return this.rTokenDeployment.mintEstimate;
    }
    get outputSlippage() {
        return 1n;
    }
    async quote(amountsIn) {
        const out = await this.rTokenDeployment.contracts.facade.callStatic
            .maxIssuableByAmounts(this.address.address, amountsIn.map((i) => i.amount))
            .then((amt) => this.rTokenDeployment.rToken.from(amt));
        return [out];
    }
    get basket() {
        return this.rTokenDeployment.basket;
    }
    constructor(rTokenDeployment) {
        super(rTokenDeployment.rToken.address, rTokenDeployment.basket, [rTokenDeployment.rToken], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, rTokenDeployment.basket.map((input) => new Approval_1.Approval(input, rTokenDeployment.rToken.address)));
        this.rTokenDeployment = rTokenDeployment;
    }
}
exports.MintRTokenAction = MintRTokenAction;
class BurnRTokenAction extends ReserveRTokenBase {
    rTokenDeployment;
    action = 'redeem';
    async plan(planner, [input], __, [predictedInput]) {
        const rtokenContract = this.gen.Contract.createContract(this.rTokenDeployment.contracts.rToken);
        planner.add(rtokenContract.redeem(input ?? predictedInput.amount));
        return [this.generateOutputTokenBalance(this.universe, planner)];
    }
    get universe() {
        return this.rTokenDeployment.universe;
    }
    gasEstimate() {
        return this.rTokenDeployment.burnEstimate;
    }
    get outputSlippage() {
        return 1n;
    }
    async quote([amountIn]) {
        const basket = this.rTokenDeployment.basket;
        const out = await this.rTokenDeployment.contracts.rTokenLens.callStatic
            .redeem(this.rTokenDeployment.contracts.assetRegistry.address, this.rTokenDeployment.contracts.basketHandler.address, this.rTokenDeployment.rToken.address.address, amountIn.amount)
            .then(async ([ercs, amts]) => await Promise.all(amts.map(async (amt, index) => {
            const erc = await this.universe.getToken(Address_1.Address.from(ercs[index]));
            if (erc !== basket[index]) {
                throw new Error('rTokenLens.redeem produced different output tokens');
            }
            return basket[index].from(amt);
        })));
        return out;
    }
    get basket() {
        return this.rTokenDeployment.basket;
    }
    constructor(rTokenDeployment) {
        super(rTokenDeployment.rToken.address, [rTokenDeployment.rToken], rTokenDeployment.basket, Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.rTokenDeployment = rTokenDeployment;
    }
}
exports.BurnRTokenAction = BurnRTokenAction;
//# sourceMappingURL=RTokens.js.map