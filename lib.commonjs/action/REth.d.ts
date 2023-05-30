import { type Token, type TokenQuantity } from '../entities/Token';
import { type Universe } from '../Universe';
import { Action } from './Action';
import { ContractCall } from '../base/ContractCall';
import { Address } from '../base';
export declare class REthRouter {
    private readonly universe;
    readonly reth: Token;
    readonly routerAddress: Address;
    private readonly routerInstance;
    constructor(universe: Universe, reth: Token, routerAddress: Address);
    gasEstimate(): bigint;
    optimiseToREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        contractCall: ContractCall;
    }>;
    optimiseFromREth(qtyETH: TokenQuantity): Promise<{
        portions: [import("ethers").BigNumber, import("ethers").BigNumber];
        amountOut: TokenQuantity;
        contractCall: ContractCall;
    }>;
}
type IRouter = Pick<InstanceType<typeof REthRouter>, 'optimiseToREth' | 'optimiseFromREth' | 'reth' | 'gasEstimate'>;
export declare class ETHToRETH extends Action {
    readonly universe: Universe;
    readonly router: IRouter;
    gasEstimate(): bigint;
    encode([ethQty]: TokenQuantity[]): Promise<ContractCall>;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
export declare class RETHToETH extends Action {
    readonly universe: Universe;
    readonly router: IRouter;
    gasEstimate(): bigint;
    encode([rethQty]: TokenQuantity[]): Promise<ContractCall>;
    quote([ethQty]: TokenQuantity[]): Promise<TokenQuantity[]>;
    constructor(universe: Universe, router: IRouter);
    toString(): string;
}
export {};
