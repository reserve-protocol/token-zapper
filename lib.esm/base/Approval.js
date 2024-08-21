export class Approval {
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
//# sourceMappingURL=Approval.js.map