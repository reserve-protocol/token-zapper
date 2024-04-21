import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { parseHexStringIntoBuffer } from '../base/utils';
import { WrappedComet__factory } from '../contracts/factories/contracts/Compv3.sol/WrappedComet__factory';
import { Action, DestinationOptions, InteractionConvention } from './Action';
const iWrappedCometInterface = WrappedComet__factory.createInterface();
export class MintCometWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        planner.add(lib.deposit(inputs[0]));
        // const out = this.genUtils.erc20.balanceOf(
        //   this.universe,
        //   planner,
        //   this.output[0],
        //   destination
        // )
        return [inputs[0]];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        return new ContractCall(parseHexStringIntoBuffer(iWrappedCometInterface.encodeFunctionData('deposit', [amountsIn.amount])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper mint ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.receiptToken.from(await WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider).convertDynamicToStatic(amountsIn.amount)),
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
    get outputSlippage() {
        return 1000000n;
    }
}
export class BurnCometWrapperAction extends Action {
    universe;
    baseToken;
    receiptToken;
    getRate;
    async plan(planner, inputs, destination) {
        const lib = this.gen.Contract.createContract(WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider));
        const amount = planner.add(lib.convertStaticToDynamic(inputs[0]));
        planner.add(lib.withdrawTo(destination.address, amount));
        const out = this.genUtils.erc20.balanceOf(this.universe, planner, this.output[0], destination);
        return [out];
    }
    gasEstimate() {
        return BigInt(110000n);
    }
    async encode([amountsIn], dest) {
        const [withdrawalAmount] = await this.quote([amountsIn]);
        return new ContractCall(parseHexStringIntoBuffer(iWrappedCometInterface.encodeFunctionData('withdrawTo', [
            dest.address,
            withdrawalAmount.amount,
        ])), this.receiptToken.address, 0n, this.gasEstimate(), 'CompoundV3Wrapper burn ' + this.receiptToken.symbol);
    }
    async quote([amountsIn]) {
        return [
            this.baseToken.from(await WrappedComet__factory.connect(this.receiptToken.address.address, this.universe.provider).convertStaticToDynamic(amountsIn.amount)),
        ];
    }
    constructor(universe, baseToken, receiptToken, getRate) {
        super(receiptToken.address, [receiptToken], [baseToken], InteractionConvention.None, DestinationOptions.Callee, []);
        this.universe = universe;
        this.baseToken = baseToken;
        this.receiptToken = receiptToken;
        this.getRate = getRate;
    }
    toString() {
        return `CompoundV3Burn(${this.receiptToken.toString()})`;
    }
    get outputSlippage() {
        return 1500000n;
    }
}
//# sourceMappingURL=CometWrapper.js.map