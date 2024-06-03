import { Address } from '../base/Address';
import { IFrxEthFraxOracle__factory, IWrappedNative__factory, IfrxETHMinter__factory, } from '../contracts';
import * as gen from '../tx-gen/Planner';
import { Action, DestinationOptions, InteractionConvention, isMultiChoiceEdge, } from '../action/Action';
import { setupERC4626 } from './setupERC4626';
import { PriceOracle } from '../oracles/PriceOracle';
class BaseFrxETH extends Action('FrxETH') {
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
        super(frxeth.address, [universe.wrappedNativeToken], [frxeth], InteractionConvention.None, DestinationOptions.Callee, []);
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
        const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
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
        super(sfrxeth.shareToken.address, [universe.wrappedNativeToken], [sfrxeth.shareToken], InteractionConvention.None, DestinationOptions.Callee, []);
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
        const wethlib = gen.Contract.createContract(IWrappedNative__factory.connect(this.universe.wrappedNativeToken.address.address, this.universe.provider));
        planner.add(wethlib.withdraw(inp));
        planner.add(lib.submitAndDeposit(this.universe.execAddress.address).withValue(inp));
        return null;
    }
}
export const setupFrxETH = async (universe, config) => {
    const poolInst = IfrxETHMinter__factory.connect(config.minter, universe.provider);
    const frxETH = await universe.getToken(Address.from(config.frxeth));
    const sfrxeth = await setupERC4626(universe, {
        protocol: 'FraxETH',
        vaultAddress: config.sfrxeth,
        slippage: 0n,
    });
    const oracle = IFrxEthFraxOracle__factory.connect(config.frxethOracle, universe.provider);
    const frxEthOracle = PriceOracle.createSingleTokenOracle(universe, frxETH, () => oracle
        .getPrices()
        .then(([, low, high]) => universe.wrappedNativeToken.fromBigInt((low.toBigInt() + high.toBigInt()) / 2n))
        .then((price) => universe.fairPrice(price).then((i) => i)));
    universe.oracles.push(frxEthOracle);
    const sfrxEthOracle = PriceOracle.createSingleTokenOracle(universe, sfrxeth.shareToken, () => sfrxeth.burn
        .quote([sfrxeth.shareToken.one])
        .then((o) => frxEthOracle
        .quote(o[0].token)
        .then((i) => o[0].into(universe.usd).mul(i))));
    universe.oracles.push(sfrxEthOracle);
    const frxETHToETH = await universe.createTradeEdge(frxETH, universe.wrappedNativeToken);
    if (isMultiChoiceEdge(frxETHToETH)) {
        for (const edge of frxETHToETH.choices) {
            universe.addAction(edge);
        }
    }
    else {
        universe.addAction(frxETHToETH);
    }
};
//# sourceMappingURL=setupFrxETH.js.map