import { Address } from '../base/Address';
import { TokenQuantity, type Token } from '../entities/Token';
import { IAToken, IPool } from '../contracts';
import { DataTypes } from '../contracts/contracts/AaveV3.sol/IPool';
import { Universe } from '../Universe';
import * as gen from '../tx-gen/Planner';
import { DestinationOptions, InteractionConvention } from '../action/Action';
import { Approval } from '../base/Approval';
declare const BaseAaveAction: abstract new (address: Address, inputToken: Token[], outputToken: Token[], interactionConvention: InteractionConvention, proceedsOptions: DestinationOptions, approvals: Approval[]) => {
    readonly protocol: string;
    readonly gen: typeof gen;
    readonly genUtils: {
        planForwardERC20(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, amount: gen.Value, destination: Address): void;
        erc20: {
            transfer(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, amount: gen.Value, token: Token, destination: Address): void;
            balanceOf(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): gen.Value;
        };
    };
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
    generateOutputTokenBalance(universe: Universe<import("./ChainConfiguration").Config>, planner: gen.Planner, comment?: string | undefined): gen.Value;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[], outputNotUsed?: boolean | undefined): Promise<gen.Value[]>;
    toString(): string;
    readonly addToGraph: boolean;
    readonly outputSlippage: bigint;
};
declare class AaveV3ActionSupply extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveReserve;
    get outputSlippage(): bigint;
    quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]>;
    gasEstimate(): bigint;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    constructor(universe: Universe, reserve: AaveReserve);
}
declare class AaveV3ActionWithdraw extends BaseAaveAction {
    readonly universe: Universe;
    readonly reserve: AaveReserve;
    get outputSlippage(): bigint;
    gasEstimate(): bigint;
    quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]>;
    plan(planner: gen.Planner, inputs: gen.Value[], destination: Address, predictedInputs: TokenQuantity[]): Promise<gen.Value[]>;
    constructor(universe: Universe, reserve: AaveReserve);
}
declare class AaveReserve {
    readonly aave: AaveV3;
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
    constructor(aave: AaveV3, reserveData: DataTypes.ReserveDataStruct, reserveToken: Token, aToken: Token, aTokenInst: IAToken, variableDebtToken: Token, intoAssets: (shares: TokenQuantity) => Promise<TokenQuantity>);
    toString(): string;
}
declare class AaveV3 {
    readonly poolInst: IPool;
    readonly universe: Universe;
    readonly reserves: AaveReserve[];
    readonly tokenToReserve: Map<Token, AaveReserve>;
    get addresss(): Address;
    addReserve(token: Token): Promise<AaveReserve>;
    private constructor();
    static from(poolInst: IPool, universe: Universe): Promise<AaveV3>;
    toString(): string;
    addWrapper(wrapper: Token): Promise<void>;
}
export declare const setupAaveV3: (universe: Universe, poolAddress: Address, wrappers: Token[]) => Promise<AaveV3>;
export {};
