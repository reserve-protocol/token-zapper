import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { ZapperExecutor__factory } from '../contracts';
import { IWStETH__factory } from '../contracts/factories/contracts/IWStETH__factory';
import * as gen from '../tx-gen/Planner';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const wstETHInterface = IWStETH__factory.createInterface();
export class WStETHRateProvider {
    universe;
    steth;
    wsteth;
    get outputSlippage() {
        return 0n;
    }
    wstethInstance;
    constructor(universe, steth, wsteth) {
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.wstethInstance = IWStETH__factory.connect(wsteth.address.address, universe.provider);
    }
    async quoteMint(amountsIn) {
        const out = (await this.wstethInstance.callStatic.getWstETHByStETH(amountsIn.amount)).toBigInt();
        return this.wsteth.from(out);
    }
    async quoteBurn(amountsIn) {
        const out = await this.wstethInstance.callStatic.getStETHByWstETH(amountsIn.amount);
        return this.steth.from(out);
    }
}
export class MintWStETH extends Action {
    universe;
    steth;
    wsteth;
    rateProvider;
    get outputSlippage() {
        return 0n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('wrap', [
            amountsIn.amount,
        ]);
        return new ContractCall(parseHexStringIntoBuffer(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
    }
    async plan(planner, inputs) {
        const zapperLib = gen.Contract.createContract(ZapperExecutor__factory.connect(this.universe.config.addresses.executorAddress.address, this.universe.provider));
        const wsteth = gen.Contract.createContract(IWStETH__factory.connect(this.wsteth.address.address, this.universe.provider));
        const input = planner.add(zapperLib.add(inputs[0], 1n));
        const out = planner.add(wsteth.wrap(input));
        return [out];
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteMint(amountsIn)];
    }
    constructor(universe, steth, wsteth, rateProvider) {
        super(wsteth.address, [steth], [wsteth], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(steth, wsteth.address)]);
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return `WStETHMint(${this.wsteth.toString()})`;
    }
}
export class BurnWStETH extends Action {
    universe;
    steth;
    wsteth;
    rateProvider;
    get outputSlippage() {
        return 0n;
    }
    gasEstimate() {
        return BigInt(175000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('unwrap', [
            amountsIn.amount,
        ]);
        return new ContractCall(parseHexStringIntoBuffer(hexEncodedWrapCall), this.wsteth.address, 0n, this.gasEstimate(), 'Mint wstETH');
    }
    async plan(planner, inputs) {
        const wsteth = gen.Contract.createContract(IWStETH__factory.connect(this.wsteth.address.address, this.universe.provider));
        const out = planner.add(wsteth.unwrap(inputs[0]));
        return [out];
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteBurn(amountsIn)];
    }
    constructor(universe, steth, wsteth, rateProvider) {
        super(wsteth.address, [wsteth], [steth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.wsteth = wsteth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return `WStETHBurn(${this.wsteth.toString()})`;
    }
}
//# sourceMappingURL=WStEth.js.map