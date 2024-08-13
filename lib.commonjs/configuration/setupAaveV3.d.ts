import { Address } from '../base/Address';
import { IAToken, IPool } from '../contracts';
import { TokenQuantity, type Token } from '../entities/Token';
import { DataTypes } from '../contracts/contracts/AaveV3.sol/IPool';
import { Universe } from '../Universe';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { AaveV3Wrapper } from '../action/SAV3Tokens';
import { Approval } from '../base/Approval';
import * as gen from '../tx-gen/Planner';
declare const BaseAaveAction_base: abstract new (_address: Address, inputToken: Token[], outputToken: Token[], _interactionConvention: InteractionConvention, _proceedsOptions: DestinationOptions, _approvals: Approval[]) => {
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
    intoSwapPath(universe: Universe<import("./ChainConfiguration").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
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
            intoSwapPath(universe: Universe<import("./ChainConfiguration").Config>, qty: TokenQuantity): Promise<import("../searcher/Swap").SwapPath>;
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
    get outToken(): Token;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    get supportsDynamicInput(): boolean;
    get oneUsePrZap(): boolean;
    get returnsOutput(): boolean;
    get outputSlippage(): bigint;
    abstract get actionName(): string;
    toString(): string;
}
declare class AaveV3ActionSupply extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveV3Reserve;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    get actionName(): string;
    constructor(universe: Universe, reserve: AaveV3Reserve);
}
declare class AaveV3ActionWithdraw extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveV3Reserve;
    gasEstimate(): bigint;
    get actionName(): string;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    plan(planner: gen.Planner, inputs: gen.Value[], _: Address, predictedInputs: TokenQuantity[]): Promise<null>;
    constructor(universe: Universe, reserve: AaveV3Reserve);
}
export declare class AaveV3Reserve {
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
    queryRate(): Promise<bigint>;
    constructor(aave: AaveV3Deployment, reserveData: DataTypes.ReserveDataStruct, reserveToken: Token, aToken: Token, aTokenInst: IAToken, variableDebtToken: Token, intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>);
    toString(): string;
}
export declare class AaveV3Deployment {
    readonly poolInst: IPool;
    readonly universe: Universe;
    readonly reserves: AaveV3Reserve[];
    readonly tokenToReserve: Map<Token, AaveV3Reserve>;
    get addresss(): Address;
    addReserve(token: Token): Promise<AaveV3Reserve>;
    private readonly rateCache;
    getRateForReserve(reserve: AaveV3Reserve): Promise<bigint>;
    private constructor();
    getRateForAToken(aToken: Token): Promise<bigint>;
    static from(poolInst: IPool, universe: Universe): Promise<AaveV3Deployment>;
    toString(): string;
    private wrappers;
    private wrapperTokens;
    addWrapper(wrapper: Token): Promise<AaveV3Wrapper>;
    describe(): string[];
}
interface AaveV3Config {
    pool: string;
    wrappers: string[];
}
export declare const setupAaveV3: (universe: Universe, config: AaveV3Config) => Promise<AaveV3Deployment>;
export {};
