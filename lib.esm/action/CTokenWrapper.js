import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { CTokenWrapper__factory } from '../contracts/factories/ICToken.sol/CTokenWrapper__factory';
const iCTokenWrapper = CTokenWrapper__factory.createInterface();
export class MintCTokenWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iCTokenWrapper.encodeFunctionData('deposit', [
            amountsIn.amount,
            dest.address
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV2Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(amountsIn.amount)
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [baseToken], [receiptToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV2WrapperMint(${this.receiptToken.toString()})`;
    }
}
export class BurnCTokenWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iCTokenWrapper.encodeFunctionData('withdraw', [
            amountsIn.amount,
            dest.address,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV2Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.baseToken.from(amountsIn.amount)
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV2WrapperBurn(${this.receiptToken.toString()})`;
    }
}
//# sourceMappingURL=CTokenWrapper.js.map