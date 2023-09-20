import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { Action, DestinationOptions, InteractionConvention } from './Action';
import { WrappedComet__factory } from '../contracts/factories/Compv3.sol/WrappedComet__factory';
const iWrappedCometInterface = WrappedComet__factory.createInterface();
export class MintCometWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iWrappedCometInterface.encodeFunctionData('deposit', [
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const amountOut = (amountsIn.amount * amountsIn.token.one.amount) / rate;
        return [
            this.receiptToken.from(amountOut)
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
        return `CompoundV3WrapperMint(${this.receiptToken.toString()})`;
    }
}
export class BurnCometWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iWrappedCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            amountsIn.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        const rate = await this.getRate();
        const amountOut = (amountsIn.amount * rate) / amountsIn.token.one.amount;
        return [
            this.baseToken.from(amountOut)
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
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
}
//# sourceMappingURL=CometWrapper.js.map