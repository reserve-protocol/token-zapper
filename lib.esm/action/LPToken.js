import { Approval } from '../base/Approval';
import { Action, DestinationOptions, InteractionConvention } from './Action';
export class LPToken {
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
export class LPTokenMint extends Action {
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
        super(lpToken.token.address, lpToken.poolTokens, [lpToken.token], InteractionConvention.ApprovalRequired, DestinationOptions.Callee, lpToken.poolTokens.map((token) => new Approval(token, lpToken.token.address)));
        this.lpToken = lpToken;
    }
}
export class LPTokenBurn extends Action {
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
        super(lpToken.token.address, [lpToken.token], lpToken.poolTokens, InteractionConvention.None, DestinationOptions.Callee, []);
        this.lpToken = lpToken;
    }
}
//# sourceMappingURL=LPToken.js.map