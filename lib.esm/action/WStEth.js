import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { IWStETH__factory } from '../contracts/factories/contracts/IWStETH__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const wstETHInterface = IWStETH__factory.createInterface();
export class WStETHRateProvider {
    universe;
    steth;
    wsteth;
    get outputSlippage() {
        return 3000000n;
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
        const out = (await this.wstethInstance.callStatic.getStETHByWstETH(amountsIn.amount));
        return this.steth.from(out);
    }
}
export class MintWStETH extends Action {
    universe;
    steth;
    wsteth;
    rateProvider;
    get outputSlippage() {
        return 3000000n;
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
        return 3000000n;
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