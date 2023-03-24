"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractCall = void 0;
class ContractCall {
    payload;
    to;
    value;
    gas;
    comment;
    constructor(payload, to, value, gas, comment) {
        this.payload = payload;
        this.to = to;
        this.value = value;
        this.gas = gas;
        this.comment = comment;
    }
    encode() {
        return {
            to: this.to.address,
            value: this.value,
            data: this.payload,
        };
    }
}
exports.ContractCall = ContractCall;
//# sourceMappingURL=ContractCall.js.map