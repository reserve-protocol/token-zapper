"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Approval = void 0;
class Approval {
    token;
    spender;
    constructor(token, spender) {
        this.token = token;
        this.spender = spender;
    }
    toString() {
        return `Approval(token: ${this.token}, spender: ${this.spender})`;
    }
}
exports.Approval = Approval;
//# sourceMappingURL=Approval.js.map