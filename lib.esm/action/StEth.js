import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { AddressZero } from '@ethersproject/constants';
import { parseHexStringIntoBuffer } from '../base/utils';
import { IStETH__factory } from '../contracts/factories/IStETH__factory';
const stETHInterface = IStETH__factory.createInterface();
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
export class MintStETH extends Action {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(200000n);
    }
    async encode([amountsIn]) {
        const hexEncodedWrapCall = stETHInterface.encodeFunctionData('submit', [
            AddressZero,
        ]);
        return new ContractCall(parseHexStringIntoBuffer(hexEncodedWrapCall), this.steth.address, amountsIn.amount, this.gasEstimate(), 'Mint stETH');
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
export class BurnStETH extends Action {
    universe;
    steth;
    rateProvider;
    gasEstimate() {
        return BigInt(0n);
    }
    async encode(_) {
        throw new Error('Not implemented');
    }
    async quote([amountsIn]) {
        return [await this.rateProvider.quoteBurn(amountsIn)];
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