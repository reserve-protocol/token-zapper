import { Address } from '../base/Address';
import { IERC4626__factory, IFrxEthFraxOracle__factory, IfrxETHMinter__factory } from '../contracts';
import { Action, DestinationOptions, InteractionConvention } from '../action/Action';
import * as gen from '../tx-gen/Planner';
import { Approval } from '../base/Approval';
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
class FrxETHMint extends BaseFrxETH {
    universe;
    frxeth;
    minter;
    gasEstimate() {
        return 100000n;
    }
    constructor(universe, frxeth, minter) {
        super(frxeth.address, [universe.nativeToken], [frxeth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.frxeth = frxeth;
        this.minter = minter;
    }
    get actionName() {
        return 'FrxETH.mint';
    }
    get outputSlippage() {
        return 0n;
    }
    get oneUsePrZap() {
        return false;
    }
    get returnsOutput() {
        return false;
    }
    async quote(amountsIn) {
        return [
            this.frxeth.from(amountsIn[0].amount)
        ];
    }
    async plan(planner, inputs, _, predictedInputs) {
        const lib = gen.Contract.createContract(this.minter);
        const inp = inputs[0] || predictedInputs[0].amount;
        planner.add(lib.submit(this.universe.execAddress.address).withValue(inp));
        return null;
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
    get outputSlippage() {
        return 0n;
    }
    constructor(universe, frxeth, sfrxeth, vault) {
        super(sfrxeth.address, [frxeth], [sfrxeth], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [
            new Approval(frxeth, Address.from(vault.address))
        ]);
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
        const inp = inputs[0] || predictedInputs[0].amount;
        planner.add(lib.deposit(inp, this.universe.execAddress.address));
        return null;
    }
    async quote(amountsIn) {
        return [
            this.outputToken[0].from(await this.vault.previewDeposit(amountsIn[0].amount))
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
    get outputSlippage() {
        return 0n;
    }
    constructor(universe, frxeth, sfrxeth, vault) {
        super(sfrxeth.address, [sfrxeth], [frxeth], InteractionConvention.None, DestinationOptions.Callee, []);
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
        const inp = inputs[0] || predictedInputs[0].amount;
        planner.add(lib.redeem(inp, this.universe.execAddress.address));
        return null;
    }
    async quote(amountsIn) {
        return [
            this.outputToken[0].from(await this.vault.previewRedeem(amountsIn[0].amount))
        ];
    }
}
export const setupFrxETH = async (universe, config) => {
    const poolInst = IfrxETHMinter__factory.connect(config.minter, universe.provider);
    const vaultInst = IERC4626__factory.connect(config.sfrxeth, universe.provider);
    const frxETH = await universe.getToken(Address.from(config.frxeth));
    const sfrxETH = await universe.getToken(Address.from(config.sfrxeth));
    const mintFrxETH = new FrxETHMint(universe, frxETH, poolInst);
    const burnSfrxETH = new SFrxETHburn(universe, frxETH, sfrxETH, vaultInst);
    const mintSfrxETH = new SFrxETHMint(universe, frxETH, sfrxETH, vaultInst);
    universe.defineMintable(mintSfrxETH, burnSfrxETH, true);
    universe.addAction(mintFrxETH);
    const oracle = IFrxEthFraxOracle__factory.connect(config.frxethOracle, universe.provider);
    const frxEthOracle = PriceOracle.createSingleTokenOracle(universe, frxETH, () => oracle
        .getPrices()
        .then(([, low, high]) => universe.wrappedNativeToken.fromBigInt((low.toBigInt() + high.toBigInt()) / 2n))
        .then((price) => universe.fairPrice(price).then((i) => i)));
    const sfrxEthOracle = PriceOracle.createSingleTokenOracle(universe, sfrxETH, () => burnSfrxETH
        .quote([sfrxETH.one])
        .then((o) => frxEthOracle
        .quote(o[0].token)
        .then((i) => o[0].into(universe.usd).mul(i))));
    universe.oracles.push(frxEthOracle);
    universe.oracles.push(sfrxEthOracle);
};
//# sourceMappingURL=setupFrxETH.js.map