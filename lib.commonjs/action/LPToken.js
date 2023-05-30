"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPTokenBurn = exports.LPTokenMint = exports.LPToken = void 0;
const _1 = require(".");
const base_1 = require("../base");
class LPToken {
    token;
    poolTokens;
    burn;
    mint;
    mintAction;
    burnAction;
    constructor(token, poolTokens, burn, mint) {
        this.token = token;
        this.poolTokens = poolTokens;
        this.burn = burn;
        this.mint = mint;
        this.mintAction = new LPTokenMint(this);
        this.burnAction = new LPTokenBurn(this);
    }
    toString() {
        return `LPToken(lp=${this.token},tokens=${this.poolTokens.join(',')})`;
    }
}
exports.LPToken = LPToken;
class LPTokenMint extends _1.Action {
    lpToken;
    toString() {
        return `MintLP(${this.lpToken})`;
    }
    async quote(amountsIn) {
        return [await this.lpToken.mint(amountsIn)];
    }
    gasEstimate() {
        return 200000n;
    }
    encode(amountsIn, destination, bytes) {
        throw new Error('Method not implemented.');
    }
    constructor(lpToken) {
        super(lpToken.token.address, lpToken.poolTokens, [lpToken.token], _1.InteractionConvention.ApprovalRequired, _1.DestinationOptions.Callee, lpToken.poolTokens.map((token) => new base_1.Approval(token, lpToken.token.address)));
        this.lpToken = lpToken;
    }
}
exports.LPTokenMint = LPTokenMint;
class LPTokenBurn extends _1.Action {
    lpToken;
    toString() {
        return `BurnLP(${this.lpToken})`;
    }
    async quote(amountsIn) {
        return await this.lpToken.burn(amountsIn[0]);
    }
    gasEstimate() {
        return 200000n;
    }
    encode(amountsIn, destination, bytes) {
        throw new Error('Method not implemented.');
    }
    constructor(lpToken) {
        super(lpToken.token.address, lpToken.poolTokens, [lpToken.token], _1.InteractionConvention.None, _1.DestinationOptions.Callee, []);
        this.lpToken = lpToken;
    }
}
exports.LPTokenBurn = LPTokenBurn;
//# sourceMappingURL=LPToken.js.map