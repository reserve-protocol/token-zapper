import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ICusdcV3Wrapper } from '../contracts';
import { TokenQuantity, type Token } from '../entities/Token';
import { Contract, Planner, Value } from '../tx-gen/Planner';
declare const BaseCometAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    outputBalanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner): Value[];
    readonly address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    generateOutputTokenBalance(universe: Universe<import("./ChainConfiguration").Config>, planner: Planner, comment?: string | undefined): Value;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
export declare abstract class BaseCometAction extends BaseCometAction_base {
    readonly comet: Comet;
    readonly actionName: string;
    toString(): string;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get receiptToken(): Token;
    get universe(): Universe<import("./ChainConfiguration").Config>;
    gasEstimate(): bigint;
    constructor(comet: Comet, actionName: string, opts: {
        inputToken: Token[];
        outputToken: Token[];
        interaction: InteractionConvention;
        destination: DestinationOptions;
        approvals: Approval[];
    });
    plan(planner: Planner, [input]: Value[], destination: Address, [predicted]: TokenQuantity[]): Promise<Value[]>;
    abstract planAction(planner: Planner, destination: Address, input: Value, predicted: TokenQuantity): void;
}
declare class MintCometAction extends BaseCometAction {
    constructor(comet: Comet);
    planAction(planner: Planner, destination: Address, input: Value | null, predicted: TokenQuantity): void;
}
declare class MintCometWrapperAction extends BaseCometAction {
    readonly cometWrapper: CometWrapper;
    constructor(cometWrapper: CometWrapper);
    toString(): string;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    planAction(planner: Planner, _: Address, input: Value | null, predicted: TokenQuantity): void;
}
declare class BurnCometAction extends BaseCometAction {
    constructor(comet: Comet);
    planAction(planner: Planner, destination: Address, input: Value | null, predicted: TokenQuantity): void;
}
declare class BurnCometWrapperAction extends BaseCometAction {
    readonly cometWrapper: CometWrapper;
    constructor(cometWrapper: CometWrapper);
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    planAction(planner: Planner, _: Address, input: Value | null, predicted: TokenQuantity): void;
}
declare class CometAssetInfo {
    readonly offset: number;
    readonly asset: Token;
    readonly priceFeed: Address;
    readonly scale: bigint;
    readonly borrowCollateralFactor: bigint;
    readonly liquidateCollateralFactor: bigint;
    readonly liquidationFactor: bigint;
    readonly supplyCap: bigint;
    constructor(offset: number, asset: Token, priceFeed: Address, scale: bigint, borrowCollateralFactor: bigint, liquidateCollateralFactor: bigint, liquidationFactor: bigint, supplyCap: bigint);
    static load(universe: Universe, comet: Token, index: number): Promise<CometAssetInfo>;
    toString(): string;
}
declare class CometWrapper {
    readonly cometWrapperInst: ICusdcV3Wrapper;
    readonly comet: Comet;
    readonly wrapperToken: Token;
    readonly mintAction: MintCometWrapperAction;
    readonly burnAction: BurnCometWrapperAction;
    readonly cometWrapperLibrary: Contract;
    get universe(): Universe<import("./ChainConfiguration").Config>;
    get cometToken(): Token;
    constructor(cometWrapperInst: ICusdcV3Wrapper, comet: Comet, wrapperToken: Token);
    toString(): string;
    static load(compound: CompoundV3, wrapperToken: Token): Promise<CometWrapper>;
}
declare class Comet {
    readonly cometLibrary: Contract;
    readonly compound: CompoundV3;
    readonly comet: Token;
    readonly borrowToken: Token;
    readonly collateralTokens: CometAssetInfo[];
    get universe(): Universe<import("./ChainConfiguration").Config>;
    readonly mintAction: MintCometAction;
    readonly burnAction: BurnCometAction;
    constructor(cometLibrary: Contract, compound: CompoundV3, comet: Token, borrowToken: Token, collateralTokens: CometAssetInfo[]);
    static load(compound: CompoundV3, poolToken: Token): Promise<Comet>;
    toString(): string;
}
declare class CompoundV3 {
    readonly universe: Universe;
    readonly comets: Comet[];
    readonly cometWrappers: CometWrapper[];
    readonly cometByBaseToken: Map<Token, Comet>;
    readonly cometByPoolToken: Map<Token, Comet>;
    readonly cometWrapperByWrapperToken: Map<Token, CometWrapper>;
    readonly cometWrapperByCometToken: Map<Token, CometWrapper>;
    constructor(universe: Universe);
    getComet(poolToken: Token): Promise<Comet>;
    getCometWrapper(wrapperToken: Token): Promise<CometWrapper>;
    static load(universe: Universe, config: {
        comets: Token[];
        cTokenWrappers: Token[];
    }): Promise<CompoundV3>;
    toString(): string;
}
export declare const setupCompoundV3: (universe: Universe, config: {
    comets: Token[];
    cTokenWrappers: Token[];
}) => Promise<CompoundV3>;
export {};
//# sourceMappingURL=setupCompV3.d.ts.map