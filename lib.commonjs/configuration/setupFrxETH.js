"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFrxETH = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const gen = tslib_1.__importStar(require("../tx-gen/Planner"));
const Action_1 = require("../action/Action");
const setupERC4626_1 = require("./setupERC4626");
const PriceOracle_1 = require("../oracles/PriceOracle");
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
class FrxETH extends BaseFrxETH {
    universe;
    frxeth;
    minter;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, frxeth, minter) {
        super(frxeth.address, [universe.wrappedNativeToken], [frxeth], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.frxeth = frxeth;
        this.minter = minter;
    }
    get actionName() {
        return 'FrxETH.mint';
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.minter);
        const inp = inputs[0] || predictedInputs[0].amount;
        const wethlib = gen.Contract.createContract(contracts_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inp));
        planner.add(lib.submit(this.universe.execAddress.address).withValue(inp));
        return null;
    }
}
class SFrxETHMint extends BaseFrxETH {
    universe;
    sfrxeth;
    minter;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, sfrxeth, minter) {
        super(sfrxeth.shareToken.address, [universe.wrappedNativeToken], [sfrxeth.shareToken], Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.universe = universe;
        this.sfrxeth = sfrxeth;
        this.minter = minter;
    }
    get actionName() {
        return 'FrxETH.mint';
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.minter);
        const inp = inputs[0] || predictedInputs[0].amount;
        const wethlib = gen.Contract.createContract(contracts_1.IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inp));
        planner.add(lib.submitAndDeposit(this.universe.execAddress.address).withValue(inp));
        return null;
    }
}
const setupFrxETH = async (universe, config) => {
    const poolInst = contracts_1.IfrxETHMinter__factory.connect(config.minter, universe.provider);
    const frxETH = await universe.getToken(Address_1.Address.from(config.frxeth));
    const sfrxeth = await (0, setupERC4626_1.setupERC4626)(universe, {
        protocol: 'FraxETh',
        vaultAddress: config.sfrxeth,
        slippage: 0n,
    });
    const oracle = contracts_1.IFrxEthFraxOracle__factory.connect(config.frxethOracle, universe.provider);
    const frxEthOracle = PriceOracle_1.PriceOracle.createSingleTokenOracle(universe, frxETH, () => oracle
        .getPrices()
        .then(([, low, high]) => universe.wrappedNativeToken.fromBigInt((low.toBigInt() + high.toBigInt()) / 2n))
        .then((price) => universe.fairPrice(price).then((i) => i)));
    universe.oracles.push(frxEthOracle);
    const sfrxEthOracle = PriceOracle_1.PriceOracle.createSingleTokenOracle(universe, sfrxeth.shareToken, () => sfrxeth.burn
        .quote([sfrxeth.shareToken.one])
        .then((o) => frxEthOracle
        .quote(o[0].token)
        .then((i) => o[0].into(universe.usd).mul(i))));
    universe.oracles.push(sfrxEthOracle);
    const frxETHToETH = await universe.createTradeEdge(frxETH, universe.wrappedNativeToken);
    if ((0, Action_1.isMultiChoiceEdge)(frxETHToETH)) {
        for (const edge of frxETHToETH.choices) {
            universe.addAction(edge);
        }
    }
    else {
        universe.addAction(frxETHToETH);
    }
};
exports.setupFrxETH = setupFrxETH;
//# sourceMappingURL=setupFrxETH.js.map