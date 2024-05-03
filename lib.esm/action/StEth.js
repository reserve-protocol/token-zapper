import { Action, DestinationOptions, InteractionConvention } from './Action';
import { constants } from 'ethers';
import { IStETH__factory } from '../contracts/factories/contracts/IStETH__factory';
export class StETHRateProvider {
    universe;
    steth;
    constructor(universe, steth) {
        this.universe = universe;
        this.steth = steth;
    }
    async quoteMint(amountsIn) {
        return this.steth.from(amountsIn.amount);
    }
    async quoteBurn(amountsIn) {
        return this.universe.nativeToken.from(amountsIn.amount);
    }
}
export class MintStETH extends Action('Lido') {
    universe;
    steth;
    rateProvider;
    async plan(planner, inputs) {
        const wsteth = this.gen.Contract.createContract(IStETH__factory.connect(this.steth.address.address, this.universe.provider));
        planner.add(wsteth.submit(constants.AddressZero).withValue(inputs[0]));
        return this.outputBalanceOf(this.universe, planner);
    }
    gasEstimate() {
        return BigInt(200000n);
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteMint(amountsIn)];
    }
    constructor(universe, steth, rateProvider) {
        super(steth.address, [universe.nativeToken], [steth], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return 'StETHMint()';
    }
}
export class BurnStETH extends Action('Lido') {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(500000n);
    }
    async plan(planner, inputs) {
        throw new Error('Not implemented');
    }
    async quote([qty]) {
        return [await this.rateProvider.quoteBurn(qty)];
    }
    constructor(universe, steth, rateProvider) {
        super(steth.address, [steth], [universe.nativeToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.steth = steth;
        this.rateProvider = rateProvider;
    }
    toString() {
        return 'BurnStETH()';
    }
    /**
     * Prevents this edge of being picked up by the graph searcher, but it can still be used
     * by the zapper.
     */
    get addToGraph() {
        return false;
    }
}
//# sourceMappingURL=StEth.js.map