import { Address } from '../base/Address';
import { TokenQuantity, type Token } from '../entities/Token';
import { Universe } from '../Universe';
import * as gen from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { Approval } from '../base/Approval';
import { ILendingPool, ReserveDataStruct } from '../contracts/contracts/AaveV2.sol/ILendingPool';
import { IAToken } from '../contracts/contracts/AaveV2.sol/IAToken';
declare const BaseAaveV2Action_base: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
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
declare abstract class BaseAaveV2Action extends BaseAaveV2Action_base {
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
}
declare class AaveV2ActionSupply extends BaseAaveV2Action {
    readonly universe: Universe;
    readonly reserve: AaveV2Reserve;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    constructor(universe: Universe, reserve: AaveV2Reserve);
}
declare class AaveV2ActionWithdraw extends BaseAaveV2Action {
    readonly universe: Universe;
    readonly reserve: AaveV2Reserve;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    constructor(universe: Universe, reserve: AaveV2Reserve);
}
declare class AaveV2Reserve {
    readonly aave: AaveV2Deployment;
    readonly reserveData: ReserveDataStruct;
    readonly reserveToken: Token;
    readonly aToken: Token;
    readonly aTokenInst: IAToken;
    readonly variableDebtToken: Token;
    readonly intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>;
    readonly supply: AaveV2ActionSupply;
    readonly withdraw: AaveV2ActionWithdraw;
    get universe(): Universe<import("./ChainConfiguration").Config>;
    get poolInst(): ILendingPool;
    constructor(aave: AaveV2Deployment, reserveData: ReserveDataStruct, reserveToken: Token, aToken: Token, aTokenInst: IAToken, variableDebtToken: Token, intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>);
    toString(): string;
}
export declare class AaveV2Deployment {
    readonly poolInst: ILendingPool;
    readonly universe: Universe;
    readonly reserves: AaveV2Reserve[];
    readonly tokenToReserve: Map<Token, AaveV2Reserve>;
    get addresss(): Address;
    addReserve(token: Token): Promise<AaveV2Reserve>;
    private constructor();
    static from(poolInst: ILendingPool, universe: Universe): Promise<AaveV2Deployment>;
    toString(): string;
    addWrapper(wrapper: Token): Promise<void>;
}
interface AaveV2Config {
    pool: string;
    wrappers: string[];
}
export declare const setupAaveV2: (universe: Universe, config: AaveV2Config) => Promise<AaveV2Deployment>;
export {};
