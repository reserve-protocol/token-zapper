"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFrxETH = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const Action_1 = require("../action/Action");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const abi_1 = require("@ethersproject/abi");
const Approval_1 = require("../base/Approval");
class BaseFrxETH extends (0, Action_1.Action)('FrxETH') {
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
        return 0n;
    }
    async quote(amountsIn) {
        return amountsIn.map((tok, i) => tok.into(this.outputToken[i]));
    }
    toString() {
        return `FrxETH.${this.actionName}(${this.inputToken.join(',')} -> ${this.outputToken.join(',')})`;
    }
}
class FrxETHMint extends BaseFrxETH {
    universe;
    frxeth;
    minter;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, frxeth, minter) {
        super(frxeth.address, [universe.nativeToken], [frxeth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.frxeth = frxeth;
        this.minter = minter;
    }
    get actionName() {
        return 'FrxETH.mint';
    }
    get oneUsePrZap() {
        return false;
    }
    get returnsOutput() {
        return true;
    }
    async quote(amountsIn) {
        return [this.frxeth.from(amountsIn[0].amount)];
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.minter);
        const inp = inputs[0] ||
            gen.encodeArg(predictedInputs[0].amount, abi_1.ParamType.from('uint256'));
        planner.add(lib.submit().withValue(inp));
        return [inp];
    }
}
class SFrxETHMint extends BaseFrxETH {
    universe;
    frxeth;
    sfrxeth;
    vault;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, frxeth, sfrxeth, vault) {
        super(sfrxeth.address, [frxeth], [sfrxeth], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, [new Approval_1.Approval(frxeth, Address_1.Address.from(vault.address))]);
        this.universe = universe;
        this.frxeth = frxeth;
        this.sfrxeth = sfrxeth;
        this.vault = vault;
    }
    get actionName() {
        return 'SFrxETH.mint';
    }
    get returnsOutput() {
        return false;
    }
    get oneUsePrZap() {
        return false;
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.vault);
        const inp = inputs[0] ||
            gen.encodeArg(predictedInputs[0].amount, abi_1.ParamType.from('uint256'));
        planner.add(lib.deposit(inp, this.universe.execAddress.address));
        return null;
    }
    async quote(amountsIn) {
        return [
            this.outputToken[0].from(await this.vault.previewDeposit(amountsIn[0].amount)),
        ];
    }
}
class SFrxETHburn extends BaseFrxETH {
    universe;
    frxeth;
    sfrxeth;
    vault;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, frxeth, sfrxeth, vault) {
        super(sfrxeth.address, [sfrxeth], [frxeth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.frxeth = frxeth;
        this.sfrxeth = sfrxeth;
        this.vault = vault;
    }
    get actionName() {
        return 'FrxETH.burn';
    }
    get returnsOutput() {
        return false;
    }
    get oneUsePrZap() {
        return false;
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.vault);
        const inp = inputs[0] ||
            gen.encodeArg(predictedInputs[0].amount, abi_1.ParamType.from('uint256'));
        planner.add(lib.redeem(inp, this.universe.execAddress.address, this.universe.execAddress.address));
        return null;
    }
    async quote(amountsIn) {
        return [
            this.outputToken[0].from(await this.vault.previewRedeem(amountsIn[0].amount)),
        ];
    }
}
const setupFrxETH = async (universe, config) => {
    const poolInst = contracts_1.IfrxETHMinter__factory.connect(config.minter, universe.provider);
    const vaultInst = contracts_1.IERC4626__factory.connect(config.sfrxeth, universe.provider);
    const frxETH = await universe.getToken(Address_1.Address.from(config.frxeth));
    const sfrxETH = await universe.getToken(Address_1.Address.from(config.sfrxeth));
    const mintFrxETH = new FrxETHMint(universe, frxETH, poolInst);
    const burnSfrxETH = new SFrxETHburn(universe, frxETH, sfrxETH, vaultInst);
    const mintSfrxETH = new SFrxETHMint(universe, frxETH, sfrxETH, vaultInst);
    universe.defineMintable(mintSfrxETH, burnSfrxETH, true);
    universe.addAction(mintFrxETH);
    const oracle = contracts_1.IFrxEthFraxOracle__factory.connect(config.frxethOracle, universe.provider);
    const frxEthOracle = universe.addSingleTokenPriceSource({
        token: frxETH,
        priceFn: async () => {
            const [, low, high] = await oracle.getPrices();
            const weth = universe.nativeToken.fromBigInt((low.toBigInt() + high.toBigInt()) / 2n);
            const out = (await universe.fairPrice(weth)) ?? universe.usd.zero;
            return out;
        },
        priceToken: universe.usd,
    });
    universe.addSingleTokenPriceSource({
        token: sfrxETH,
        priceFn: async () => {
            const out = await burnSfrxETH.quote([sfrxETH.one]);
            const i = (await frxEthOracle.quote(out[0].token)) ?? universe.usd.zero;
            const res = out[0].into(universe.usd).mul(i);
            return res;
        },
        priceToken: universe.usd,
    });
};
exports.setupFrxETH = setupFrxETH;
//# sourceMappingURL=setupFrxETH.js.map