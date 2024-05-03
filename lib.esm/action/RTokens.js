import { Address } from '../base/Address';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IAssetRegistry__factory, IBasketHandler__factory, IFacade__factory, IMain__factory, IRToken__factory, RTokenLens__factory, } from '../contracts';
export class RTokenDeployment {
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
                .getToken(Address.from(addr))
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
        const rTokenInst = IRToken__factory.connect(rToken.address.address, uni.provider);
        const facade = IFacade__factory.connect(facadeAddress.address, uni.provider);
        const mainAddr = Address.from(await rTokenInst.main());
        const mainInst = IMain__factory.connect(mainAddr.address, uni.provider);
        const [basketHandlerAddr, assetRegAddr] = await Promise.all([
            mainInst.basketHandler().then((i) => Address.from(i)),
            mainInst.assetRegistry().then((i) => Address.from(i)),
        ]);
        const basketHandlerInst = IBasketHandler__factory.connect(basketHandlerAddr.address, uni.provider);
        const uniBasket = await basketHandlerInst
            .quote(rToken.scale, 0)
            .then(async ([basketTokens, amts]) => await Promise.all(basketTokens.map(async (addr, index) => await uni
            .getToken(Address.from(addr))
            .then((basketToken) => basketToken.from(amts[index])))));
        return new RTokenDeployment(uni, rToken, uniBasket, {
            facade,
            basketHandler: basketHandlerInst,
            main: mainInst,
            rToken: rTokenInst,
            rTokenLens: RTokenLens__factory.connect(uni.config.addresses.rtokenLens.address, uni.provider),
            assetRegistry: IAssetRegistry__factory.connect(assetRegAddr.address, uni.provider),
        }, mintEstimate, burnEstimate);
    }
}
class ReserveRTokenBase extends Action('Reserve.RToken') {
    toString() {
        return `RToken(action=${this.action}, ${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')}`;
    }
}
export class MintRTokenAction extends ReserveRTokenBase {
    rTokenDeployment;
    action = 'issue';
    async plan(planner, _, __) {
        planner.add(this.universe.weirollZapperExec.mintMaxRToken(this.universe.config.addresses.oldFacadeAddress.address, this.address.address, this.universe.execAddress.address));
        return this.outputBalanceOf(this.universe, planner);
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
        if (this.universe.config.addresses.facadeAddress !== Address.ZERO) {
            const out = await this.rTokenDeployment.contracts.facade.callStatic
                .maxIssuableByAmounts(this.address.address, amountsIn.map((i) => i.amount))
                .then((amt) => this.rTokenDeployment.rToken.from(amt));
            return [out];
        }
        else {
            const unit = await this.rTokenDeployment.unitBasket();
            let out = this.outputToken[0].zero;
            unit.map((unit, index) => {
                const thisOut = amountsIn[index].div(unit).into(this.outputToken[0]);
                if (thisOut.gt(out)) {
                    out = thisOut;
                }
            });
            return [out];
        }
    }
    get basket() {
        return this.rTokenDeployment.basket;
    }
    constructor(rTokenDeployment) {
        super(rTokenDeployment.rToken.address, rTokenDeployment.basket, [rTokenDeployment.rToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, rTokenDeployment.basket.map((input) => new Approval(input, rTokenDeployment.rToken.address)));
        this.rTokenDeployment = rTokenDeployment;
    }
}
export class BurnRTokenAction extends ReserveRTokenBase {
    rTokenDeployment;
    action = 'redeem';
    async plan(planner, [input], __, [predictedInput]) {
        const rtokenContract = this.gen.Contract.createContract(this.rTokenDeployment.contracts.rToken);
        planner.add(rtokenContract.redeem(input ?? predictedInput.amount));
        return this.outputBalanceOf(this.universe, planner);
    }
    get universe() {
        return this.rTokenDeployment.universe;
    }
    gasEstimate() {
        return this.rTokenDeployment.burnEstimate;
    }
    get outputSlippage() {
        return 30n;
    }
    async quote([amountIn]) {
        const basket = this.rTokenDeployment.basket;
        const out = await this.rTokenDeployment.contracts.rTokenLens.callStatic
            .redeem(this.rTokenDeployment.contracts.assetRegistry.address, this.rTokenDeployment.contracts.basketHandler.address, this.rTokenDeployment.rToken.address.address, amountIn.amount)
            .then(async ([ercs, amts]) => await Promise.all(amts.map(async (amt, index) => {
            const erc = await this.universe.getToken(Address.from(ercs[index]));
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
        super(rTokenDeployment.rToken.address, [rTokenDeployment.rToken], rTokenDeployment.basket, InteractionConvention.None, DestinationOptions.Callee, []);
        this.rTokenDeployment = rTokenDeployment;
    }
}
//# sourceMappingURL=RTokens.js.map