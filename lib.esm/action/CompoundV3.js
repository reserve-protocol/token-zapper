import { Approval } from "../base/Approval";
import { Action, InteractionConvention, DestinationOptions } from "./Action";
export class BaseCometAction extends Action('CompV3') {
    mainAddress;
    comet;
    actionName;
    get outputSlippage() {
        return 0n;
    }
    get returnsOutput() {
        return false;
    }
    toString() {
        return `${this.protocol}.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
    async quote([amountsIn]) {
        return [
            this.outputToken[0].from(amountsIn.into(this.outputToken[0]).amount - 1n),
        ];
    }
    get receiptToken() {
        return this.outputToken[0];
    }
    get universe() {
        return this.comet.universe;
    }
    gasEstimate() {
        return BigInt(250000n);
    }
    constructor(mainAddress, comet, actionName, opts) {
        super(mainAddress, opts.inputToken, opts.outputToken, opts.interaction, opts.destination, opts.approvals);
        this.mainAddress = mainAddress;
        this.comet = comet;
        this.actionName = actionName;
    }
    async plan(planner, [input], destination, [predicted]) {
        this.planAction(planner, destination, input, predicted);
        return null;
    }
}
export class MintCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet.comet.address, comet, 'supply', {
            inputToken: [comet.borrowToken],
            outputToken: [comet.comet],
            interaction: InteractionConvention.ApprovalRequired,
            destination: DestinationOptions.Callee,
            approvals: [new Approval(comet.borrowToken, comet.comet.address)],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.supplyTo(destination.address, this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
export class MintCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'deposit', {
            inputToken: [cometWrapper.cometToken],
            outputToken: [cometWrapper.wrapperToken],
            interaction: InteractionConvention.ApprovalRequired,
            destination: DestinationOptions.Callee,
            approvals: [
                new Approval(cometWrapper.cometToken, cometWrapper.wrapperToken.address),
            ],
        });
        this.cometWrapper = cometWrapper;
    }
    toString() {
        return `CometWrapper.${this.actionName}(${this.inputToken.join(', ')} -> ${this.outputToken.join(', ')})`;
    }
    async quote([amountsIn]) {
        return [
            this.outputToken[0].from(await this.cometWrapper.cometWrapperInst.convertDynamicToStatic(amountsIn.amount)),
        ];
    }
    planAction(planner, _, input, predicted) {
        planner.add(this.cometWrapper.cometWrapperLibrary.deposit(input ?? predicted.amount));
    }
}
export class BurnCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet.comet.address, comet, 'burn', {
            inputToken: [comet.comet],
            outputToken: [comet.borrowToken],
            interaction: InteractionConvention.None,
            destination: DestinationOptions.Callee,
            approvals: [],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.withdraw(this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
export class BurnCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'withdraw', {
            inputToken: [cometWrapper.wrapperToken],
            outputToken: [cometWrapper.cometToken],
            interaction: InteractionConvention.None,
            destination: DestinationOptions.Callee,
            approvals: [],
        });
        this.cometWrapper = cometWrapper;
    }
    async quote([amountsIn]) {
        return [
            this.outputToken[0].from(await this.cometWrapper.cometWrapperInst.convertStaticToDynamic(amountsIn.amount)),
        ];
    }
    planAction(planner, _, input, predicted) {
        const amt = planner.add(this.cometWrapper.cometWrapperLibrary.convertStaticToDynamic(input ?? predicted.amount));
        planner.add(this.cometWrapper.cometWrapperLibrary.withdraw(amt));
    }
}
//# sourceMappingURL=CompoundV3.js.map