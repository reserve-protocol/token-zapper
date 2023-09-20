import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Comet__factory } from '../contracts/factories/Compv3.sol/Comet__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const iCometInterface = Comet__factory.createInterface();
export class MintCometAction extends Action {
    universe;
    baseToken;
    receiptToken;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn]) {
        return new ContractCall(parseHexStringIntoBuffer(iCometInterface.encodeFunctionData('supply', [
            this.baseToken.address.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3 mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(amountsIn.amount)
        ];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [baseToken], [receiptToken], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, [new Approval(baseToken, receiptToken.address)]);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CompoundV3Mint(${this.receiptToken.toString()})`;
    }
}
export class BurnCometAction extends Action {
    universe;
    baseToken;
    receiptToken;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            this.baseToken.address.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3 burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.baseToken.from(amountsIn.amount)
        ];
    }
    constructor(universe, baseToken, receiptToken) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Recipient, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
    }
    toString() {
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
}
//# sourceMappingURL=Comet.js.map