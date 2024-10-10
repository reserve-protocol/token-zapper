"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BurnCometWrapperAction = exports.BurnCometAction = exports.MintCometWrapperAction = exports.MintCometAction = exports.BaseCometAction = void 0;
const Approval_1 = require("../base/Approval");
const Action_1 = require("./Action");
class BaseCometAction extends (0, Action_1.Action)('CompV3') {
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
exports.BaseCometAction = BaseCometAction;
class MintCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet.comet.address, comet, 'supply', {
            inputToken: [comet.borrowToken],
            outputToken: [comet.comet],
            interaction: Action_1.InteractionConvention.ApprovalRequired,
            destination: Action_1.DestinationOptions.Callee,
            approvals: [new Approval_1.Approval(comet.borrowToken, comet.comet.address)],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.supplyTo(destination.address, this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
exports.MintCometAction = MintCometAction;
class MintCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'deposit', {
            inputToken: [cometWrapper.cometToken],
            outputToken: [cometWrapper.wrapperToken],
            interaction: Action_1.InteractionConvention.ApprovalRequired,
            destination: Action_1.DestinationOptions.Callee,
            approvals: [
                new Approval_1.Approval(cometWrapper.cometToken, cometWrapper.wrapperToken.address),
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
exports.MintCometWrapperAction = MintCometWrapperAction;
class BurnCometAction extends BaseCometAction {
    constructor(comet) {
        super(comet.comet.address, comet, 'burn', {
            inputToken: [comet.comet],
            outputToken: [comet.borrowToken],
            interaction: Action_1.InteractionConvention.None,
            destination: Action_1.DestinationOptions.Callee,
            approvals: [],
        });
    }
    planAction(planner, destination, input, predicted) {
        planner.add(this.comet.cometLibrary.withdraw(this.comet.borrowToken.address.address, input ?? predicted.amount));
    }
}
exports.BurnCometAction = BurnCometAction;
class BurnCometWrapperAction extends BaseCometAction {
    cometWrapper;
    constructor(cometWrapper) {
        super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'withdraw', {
            inputToken: [cometWrapper.wrapperToken],
            outputToken: [cometWrapper.cometToken],
            interaction: Action_1.InteractionConvention.None,
            destination: Action_1.DestinationOptions.Callee,
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
exports.BurnCometWrapperAction = BurnCometWrapperAction;
//# sourceMappingURL=CompoundV3.js.map