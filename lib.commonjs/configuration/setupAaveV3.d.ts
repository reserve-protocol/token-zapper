import { Address } from '../base/Address';
import { TokenQuantity, type Token } from '../entities/Token';
import { IAToken, IPool } from '../contracts';
import { DataTypes } from '../contracts/contracts/AaveV3.sol/IPool';
import { Universe } from '../Universe';
import * as gen from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { Approval } from '../base/Approval';
declare const BaseAaveAction_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
    readonly supportsDynamicInput: boolean;
    readonly oneUsePrZap: boolean;
    readonly returnsOutput: boolean;
    readonly addressesInUse: Set<Address>;
    outputBalanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner): gen.Value[];
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
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[] | null>;
    planWithOutput(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
    combine(other: import("../action/Action").BaseAction): {
        new (universe: Universe<import("./ChainConfiguration").Config>): {
            readonly protocol: string;
            toString(): string;
            quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            readonly supportsDynamicInput: boolean;
            readonly oneUsePrZap: boolean;
            readonly addressesInUse: Set<Address>;
            readonly returnsOutput: boolean;
            readonly outputSlippage: bigint;
            gasEstimate(): bigint;
            plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predicted: TokenQuantity[]): Promise<gen.Value[] | null>;
            readonly universe: Universe<import("./ChainConfiguration").Config>;
            readonly gen: typeof gen;
            readonly genUtils: {
                planForwardERC20(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
                erc20: {
                    transfer(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
                    balanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
                };
            };
            outputBalanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner): gen.Value[];
            readonly address: Address;
            readonly inputToken: Token[];
            readonly outputToken: Token[];
            readonly interactionConvention: InteractionConvention;
            readonly proceedsOptions: DestinationOptions;
            readonly approvals: Approval[];
            quoteWithSlippage(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
            exchange(amountsIn: TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
            planWithOutput(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
            readonly addToGraph: boolean;
            combine(other: import("../action/Action").BaseAction): {
                new (universe: Universe<import("./ChainConfiguration").Config>): any;
            };
        };
    };
};
declare abstract class BaseAaveAction extends BaseAaveAction_base {
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
}
declare class AaveV3ActionSupply extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveReserve;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    constructor(universe: Universe, reserve: AaveReserve);
}
declare class AaveV3ActionWithdraw extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveReserve;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    plan(planner: gen.Planner, inputs: gen.Value[], _: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    constructor(universe: Universe, reserve: AaveReserve);
}
declare class AaveReserve {
    readonly aave: AaveV3Deployment;
    readonly reserveData: DataTypes.ReserveDataStruct;
    readonly reserveToken: Token;
    readonly aToken: Token;
    readonly aTokenInst: IAToken;
    readonly variableDebtToken: Token;
    readonly intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>;
    readonly supply: AaveV3ActionSupply;
    readonly withdraw: AaveV3ActionWithdraw;
    get universe(): Universe<import("./ChainConfiguration").Config>;
    get poolInst(): IPool;
    constructor(aave: AaveV3Deployment, reserveData: DataTypes.ReserveDataStruct, reserveToken: Token, aToken: Token, aTokenInst: IAToken, variableDebtToken: Token, intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>);
    toString(): string;
}
export declare class AaveV3Deployment {
    readonly poolInst: IPool;
    readonly universe: Universe;
    readonly reserves: AaveReserve[];
    readonly tokenToReserve: Map<Token, AaveReserve>;
    get addresss(): Address;
    addReserve(token: Token): Promise<AaveReserve>;
    private constructor();
    static from(poolInst: IPool, universe: Universe): Promise<AaveV3Deployment>;
    toString(): string;
    addWrapper(wrapper: Token): Promise<void>;
}
interface AaveV3Config {
    pool: string;
    wrappers: string[];
}
export declare const setupAaveV3: (universe: Universe, config: AaveV3Config) => Promise<AaveV3Deployment>;
export {};
