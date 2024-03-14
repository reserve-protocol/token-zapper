import { type Action } from '../action/Action';
import { type TokenQuantity } from '../entities/Token';
export declare class PostTradeAction {
    readonly inputAsFractionOfCurrentBalance: TokenQuantity[];
    readonly action?: Action | undefined;
    readonly postTradeActions?: PostTradeAction[] | undefined;
    readonly updateBalances: boolean;
    constructor(inputAsFractionOfCurrentBalance: TokenQuantity[], action?: Action | undefined, postTradeActions?: PostTradeAction[] | undefined, updateBalances?: boolean);
    describe(): string[];
    static fromAction(action: Action, update?: boolean): PostTradeAction;
    static from(action: Action, postTradeActions?: PostTradeAction[], update?: boolean): PostTradeAction;
    static create(input: TokenQuantity[], action: Action, postTradeActions?: PostTradeAction[]): PostTradeAction;
}
export declare class BasketTokenSourcingRuleApplication {
    readonly precursorToTradeFor: TokenQuantity[];
    readonly postTradeActions: PostTradeAction[];
    constructor(precursorToTradeFor: TokenQuantity[], postTradeActions: PostTradeAction[]);
    describe(): string[];
    static create(precursorToTradeFor: TokenQuantity[], postTradeActions?: PostTradeAction): BasketTokenSourcingRuleApplication;
    static fromBranches(branches: BasketTokenSourcingRuleApplication[], action?: Action): BasketTokenSourcingRuleApplication;
    static fromActionWithDependencies(action: Action, branches: BasketTokenSourcingRuleApplication[]): BasketTokenSourcingRuleApplication;
    static singleBranch(precursorToTradeFor: TokenQuantity[], postTradeActions: PostTradeAction[]): BasketTokenSourcingRuleApplication;
    static noAction(precursorToTradeFor: TokenQuantity[]): BasketTokenSourcingRuleApplication;
}
//# sourceMappingURL=BasketTokenSourcingRules.d.ts.map