import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { CEther, CTokenWrapper, ICToken, IComptroller } from '../contracts';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Contract, FunctionCall, Planner, Value } from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from './Action';
declare class CompoundV2Market {
    readonly deployment: CompoundV2Deployment;
    readonly cTokenInst: ICToken | CEther;
    readonly cToken: Token;
    readonly underlying: Token;
    private storagedRate;
    toString(): string;
    mint: MintCTokenAction;
    burn: BurnCTokenAction;
    readonly instICToken: ICToken;
    readonly instCEther: CEther;
    readonly instICTokenLib: Contract;
    readonly instCEtherLib: Contract;
    private readonly wrappers_;
    private constructor();
    createCTokenWrapper(wrapperToken: Token): ReserveCTokenWrapper;
    getCurrenRate(): Promise<bigint>;
    get universe(): Universe<import("..").Config>;
    get rateScale(): bigint;
    static create(deployment: CompoundV2Deployment, cToken: Token): Promise<CompoundV2Market>;
}
export declare class CompoundV2Deployment {
    readonly universe: Universe;
    readonly comptroller: {
        address: Address;
        instance: IComptroller;
    };
    readonly name: string;
    private markets_;
    private cTokenRateCache;
    private constructor();
    getCurrentRate(market: CompoundV2Market): Promise<bigint>;
    private initialize;
    get markets(): Map<Token, CompoundV2Market>;
    createCTokenWrapper(wrapperToken: Token): Promise<ReserveCTokenWrapper>;
    getMarket(token: Token): CompoundV2Market | undefined;
    private cTokens_;
    get cTokens(): Token[];
    static create(universe: Universe, comptroller: Address, name: string): Promise<CompoundV2Deployment>;
    toString(): string;
}
declare const CompV2Action_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
        sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    readonly address: Address;
    _address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    _interactionConvention: InteractionConvention;
    _proceedsOptions: DestinationOptions;
    _approvals: Approval[];
    intoSwapPath(universe: Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("./Action").BaseAction): {
        new (universe: Universe<import("..").Config>): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[] | null>;
            readonly universe: Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
                sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            readonly address: Address;
            _address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            _interactionConvention: InteractionConvention;
            _proceedsOptions: DestinationOptions;
            _approvals: Approval[];
            intoSwapPath(universe: Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("./Action").BaseAction): {
                new (universe: Universe<import("..").Config>): any;
            };
        };
    };
};
declare abstract class CompV2Action extends CompV2Action_base {
    readonly market: CompoundV2Market;
    readonly input: Token;
    readonly output: Token;
    get returnsOutput(): boolean;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPredicted]: TokenQuantity[]): Promise<null>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    abstract quoteAction(rate: bigint, amountsIn: TokenQuantity): TokenQuantity;
    abstract planAction(input: Value): FunctionCall;
    constructor(market: CompoundV2Market, input: Token, output: Token);
}
export declare class MintCTokenAction extends CompV2Action {
    readonly market: CompoundV2Market;
    gasEstimate(): bigint;
    quoteAction(rate: bigint, amountsIn: TokenQuantity): TokenQuantity;
    planAction(input: Value): FunctionCall;
    constructor(market: CompoundV2Market, input: Token, output: Token);
}
export declare class BurnCTokenAction extends CompV2Action {
    readonly market: CompoundV2Market;
    get actionName(): string;
    gasEstimate(): bigint;
    quoteAction(rate: bigint, amountsIn: TokenQuantity): TokenQuantity;
    planAction(input: Value): FunctionCall;
    constructor(market: CompoundV2Market, input: Token, output: Token);
}
export declare class ReserveCTokenWrapper {
    readonly market: CompoundV2Market;
    readonly wrapperToken: Token;
    readonly contracts: {
        instWrapper: CTokenWrapper;
        weirollWrapper: Contract;
    };
    readonly mint: MintCTokenWrapperAction;
    readonly burn: BurnCTokenWrapperAction;
    private constructor();
    static fromMarket(market: CompoundV2Market, wrapperToken: Token): ReserveCTokenWrapper;
    static create(deployment: CompoundV2Deployment, cTokenWrapperToken: Token): Promise<ReserveCTokenWrapper>;
    toString(): string;
}
declare const CTokenWrapperAction_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
        fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
        sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
        erc20: {
            transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
    readonly interactionConvention: InteractionConvention;
    readonly proceedsOptions: DestinationOptions;
    readonly approvals: Approval[];
    readonly address: Address;
    _address: Address;
    readonly inputToken: Token[];
    readonly outputToken: Token[];
    _interactionConvention: InteractionConvention;
    _proceedsOptions: DestinationOptions;
    _approvals: Approval[];
    intoSwapPath(universe: Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
    plan(planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[] | null>;
    planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("./Action").BaseAction): {
        new (universe: Universe<import("..").Config>): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: Planner, inputs: Value[], destination: Address, predicted: TokenQuantity[]): Promise<Value[] | null>;
            readonly universe: Universe<import("..").Config>;
            readonly gen: typeof import("../tx-gen/Planner");
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
                fraction: (uni: Universe<import("..").Config>, planner: Planner, input: Value, fraction: bigint, comment: string, name?: string | undefined) => Value | import("../tx-gen/Planner").ReturnValue;
                sub: (uni: Universe<import("..").Config>, planner: Planner, a: bigint | Value, b: bigint | Value, comment: string, name?: string | undefined) => import("../tx-gen/Planner").ReturnValue;
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            readonly address: Address;
            _address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            _interactionConvention: InteractionConvention;
            _proceedsOptions: DestinationOptions;
            _approvals: Approval[];
            intoSwapPath(universe: Universe<import("..").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("..").Config>, planner: Planner, inputs: Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("./Action").BaseAction): {
                new (universe: Universe<import("..").Config>): any;
            };
        };
    };
};
declare abstract class CTokenWrapperAction extends CTokenWrapperAction_base {
    readonly wrapper: ReserveCTokenWrapper;
    readonly input: Token;
    readonly output: Token;
    abstract get actionName(): string;
    toString(): string;
    get outputSlippage(): bigint;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPredicted]: TokenQuantity[]): Promise<null>;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    quoteAction(amountsIn: TokenQuantity): TokenQuantity;
    abstract planAction(input: Value): FunctionCall;
    constructor(wrapper: ReserveCTokenWrapper, input: Token, output: Token);
}
export declare class MintCTokenWrapperAction extends CTokenWrapperAction {
    readonly wrapper: ReserveCTokenWrapper;
    gasEstimate(): bigint;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    constructor(wrapper: ReserveCTokenWrapper);
}
export declare class BurnCTokenWrapperAction extends CTokenWrapperAction {
    readonly wrapper: ReserveCTokenWrapper;
    gasEstimate(): bigint;
    planAction(input: Value): FunctionCall;
    get actionName(): string;
    constructor(wrapper: ReserveCTokenWrapper);
}
export interface ConfigDefinition {
    comptroller: string;
    wrappers: string[];
}
export declare const loadCompV2Deployment: (protocolName: string, universe: Universe, definition: ConfigDefinition) => Promise<CompoundV2Deployment>;
export {};
//# sourceMappingURL=CTokens.d.ts.map