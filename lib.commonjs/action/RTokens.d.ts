import { type Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token, type TokenQuantity } from '../entities/Token';
import { DestinationOptions, InteractionConvention } from './Action';
import { Approval } from '../base/Approval';
import { IAssetRegistry, IBasketHandler, IFacade, IMain, IRToken, RTokenLens } from '../contracts';
import { Planner, Value } from '../tx-gen/Planner';
export declare class RTokenDeployment {
    readonly universe: Universe;
    readonly rToken: Token;
    private unitBasket_;
    readonly contracts: {
        facade: IFacade;
        basketHandler: IBasketHandler;
        main: IMain;
        rToken: IRToken;
        rTokenLens: RTokenLens;
        assetRegistry: IAssetRegistry;
    };
    readonly mintEstimate: bigint;
    readonly burnEstimate: bigint;
    readonly burn: BurnRTokenAction;
    readonly mint: MintRTokenAction;
    toString(): string;
    private block;
    unitBasket(): Promise<TokenQuantity[]>;
    readonly basket: Token[];
    private constructor();
    static load(uni: Universe, facadeAddress: Address, rToken: Token, mintEstimate?: bigint, burnEstimate?: bigint): Promise<RTokenDeployment>;
}
declare const ReserveRTokenBase_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof import("../tx-gen/Planner");
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("..").Config>, planner: Planner, token: Token, amount: Value, destination: Address): void;
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
                erc20: {
                    transfer(universe: Universe<import("..").Config>, planner: Planner, amount: Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("..").Config>, planner: Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): Value;
                };
            };
            outputBalanceOf(universe: Universe<import("..").Config>, planner: Planner): Value[];
            readonly address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
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
declare abstract class ReserveRTokenBase extends ReserveRTokenBase_base {
    abstract action: string;
    toString(): string;
}
export declare class MintRTokenAction extends ReserveRTokenBase {
    readonly rTokenDeployment: RTokenDeployment;
    action: string;
    plan(planner: Planner, _: Value[], destination: Address): Promise<Value[]>;
    get universe(): Universe<import("..").Config>;
    gasEstimate(): bigint;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    get basket(): Token[];
    constructor(rTokenDeployment: RTokenDeployment);
}
export declare class BurnRTokenAction extends ReserveRTokenBase {
    readonly rTokenDeployment: RTokenDeployment;
    action: string;
    plan(planner: Planner, [input]: Value[], __: Address, [predictedInput]: TokenQuantity[]): Promise<Value[]>;
    get universe(): Universe<import("..").Config>;
    gasEstimate(): bigint;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    quote_([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    get basket(): Token[];
    constructor(rTokenDeployment: RTokenDeployment);
}
export {};
