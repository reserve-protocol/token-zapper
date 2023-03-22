export var InteractionConvention;
(function (InteractionConvention) {
    InteractionConvention[InteractionConvention["PayBeforeCall"] = 0] = "PayBeforeCall";
    InteractionConvention[InteractionConvention["CallbackBased"] = 1] = "CallbackBased";
    InteractionConvention[InteractionConvention["ApprovalRequired"] = 2] = "ApprovalRequired";
    InteractionConvention[InteractionConvention["None"] = 3] = "None";
})(InteractionConvention || (InteractionConvention = {}));
export var DestinationOptions;
(function (DestinationOptions) {
    DestinationOptions[DestinationOptions["Recipient"] = 0] = "Recipient";
    DestinationOptions[DestinationOptions["Callee"] = 1] = "Callee";
})(DestinationOptions || (DestinationOptions = {}));
export class Action {
    address;
    input;
    output;
    interactionConvention;
    proceedsOptions;
    approvals;
    constructor(address, input, output, interactionConvention, proceedsOptions, approvals) {
        this.address = address;
        this.input = input;
        this.output = output;
        this.interactionConvention = interactionConvention;
        this.proceedsOptions = proceedsOptions;
        this.approvals = approvals;
    }
    async exchange(amountsIn, balances) {
        const outputs = await this.quote(amountsIn);
        balances.exchange(amountsIn, outputs);
    }
    toString() {
        return 'Action';
    }
}
//# sourceMappingURL=Action.js.map