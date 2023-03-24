import { CEther__factory, ICToken__factory } from '../contracts';
import { parseHexStringIntoBuffer } from '../base/utils';
import { InteractionConvention, DestinationOptions, Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Approval } from '../base/Approval';
const iCTokenInterface = ICToken__factory.createInterface();
const iCEtherInterface = CEther__factory.createInterface();
const ONEFP18 = 10n ** 18n;
export class MintCTokenAction extends Action {
    universe;
    underlying;
    cToken;
    rate;
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        if (this.underlying === this.universe.nativeToken) {
            return new ContractCall(parseHexStringIntoBuffer(iCEtherInterface.encodeFunctionData('mint')), this.cToken.address, amountsIn.amount, this.gasEstimate(), 'Mint CEther');
        }
        return new ContractCall(parseHexStringIntoBuffer(iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Mint ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.cToken.quantityFromBigInt((amountsIn.amount * this.rateScale) /
                this.rate.value /
                this.underlying.scale),
        ];
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [underlying], [cToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(underlying, cToken.address)]);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenMint(${this.cToken.toString()})`;
    }
}
export class BurnCTokenAction extends Action {
    universe;
    underlying;
    cToken;
    rate;
    gasEstimate() {
        return BigInt(175000n);
    }
    rateScale;
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])), this.cToken.address, 0n, this.gasEstimate(), 'Burn ' + this.cToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.underlying.quantityFromBigInt((amountsIn.amount * this.rate.value * this.underlying.scale) /
                this.rateScale),
        ];
    }
    constructor(universe, underlying, cToken, rate) {
        super(cToken.address, [cToken], [underlying], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.underlying = underlying;
        this.cToken = cToken;
        this.rate = rate;
        this.rateScale = ONEFP18 * underlying.scale;
    }
    toString() {
        return `CTokenBurn(${this.cToken.toString()})`;
    }
}
//# sourceMappingURL=CTokens.js.map