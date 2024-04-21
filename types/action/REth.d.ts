import { type Universe } from '../Universe';
import { type Address } from '../base/Address';
import { ContractCall } from '../base/ContractCall';
import { IRETHRouter } from '../contracts/contracts/IRETHRouter';
import { type Token, type TokenQuantity } from '../entities/Token';
import { Planner, Value } from '../tx-gen/Planner';
import { Action } from './Action';
export declare class REthRouter {
    private readonly universe;
    readonly reth: Token;
    readonly routerAddress: Address;
    readonly routerInstance: IRETHRouter;
    constructor(universe: Universe, reth: Token, routerAddress: Address);
    gasEstimate(): bigint;
    optimiseToREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        params: readonly [import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, bigint];
        contractCall: ContractCall;
    }>;
    optimiseFromREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        params: readonly [import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, import("ethers").BigNumber, bigint];
        contractCall: ContractCall;
    }>;
}
type IRouter = Pick<InstanceType<typeof REthRouter>, 'optimiseToREth' | 'optimiseFromREth' | 'reth' | 'gasEstimate' | 'routerInstance'>;
export declare class ETHToRETH extends Action {
    readonly universe: Universe;
    readonly router: IRouter;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    encode([ethQty]: TokenQuantity[]): Promise<ContractCall>;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
export declare class RETHToETH extends Action {
    readonly universe: Universe;
    readonly router: IRouter;
    plan(planner: Planner, [input]: Value[], _: Address, [inputPrecomputed]: TokenQuantity[]): Promise<Value[]>;
    gasEstimate(): bigint;
    encode([rethQty]: TokenQuantity[]): Promise<ContractCall>;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
export {};
//# sourceMappingURL=REth.d.ts.map