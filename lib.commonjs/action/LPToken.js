"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPTokenBurn = exports.LPTokenMint = exports.LPToken = void 0;
const Approval_1 = require("../base/Approval");
const Action_1 = require("./Action");
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
class LPTokenMint extends Action_1.Action {
    lpToken;
    async plan(planner, inputs, destination) {
        throw new Error('Method not implemented.');
    }
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
        super(lpToken.token.address, lpToken.poolTokens, [lpToken.token], Action_1.InteractionConvention.ApprovalRequired, Action_1.DestinationOptions.Callee, lpToken.poolTokens.map((token) => new Approval_1.Approval(token, lpToken.token.address)));
        this.lpToken = lpToken;
    }
}
exports.LPTokenMint = LPTokenMint;
class LPTokenBurn extends Action_1.Action {
    lpToken;
    async plan(planner, inputs, destination) {
        throw new Error('Method not implemented.');
    }
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
        super(lpToken.token.address, [lpToken.token], lpToken.poolTokens, Action_1.InteractionConvention.None, Action_1.DestinationOptions.Callee, []);
        this.lpToken = lpToken;
    }
}
exports.LPTokenBurn = LPTokenBurn;
//# sourceMappingURL=LPToken.js.map