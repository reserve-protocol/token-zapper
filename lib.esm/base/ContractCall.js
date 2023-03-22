export class ContractCall {
    payload;
    to;
    value;
    comment;
    constructor(payload, to, value, comment) {
        this.payload = payload;
        this.to = to;
        this.value = value;
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
//# sourceMappingURL=ContractCall.js.map