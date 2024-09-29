import { TransactionRequest } from '@ethersproject/providers';
import { BaseAction } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ZapERC20ParamsStruct, ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper';
import { PricedTokenQuantity, type Token, type TokenQuantity } from '../entities/Token';
import { SwapPath, SwapPaths } from '../searcher/Swap';
import { Planner } from '../tx-gen/Planner';
import { ToTransactionArgs } from './ToTransactionArgs';
import { ZapTransaction } from './ZapTransaction';
import { SimulateParams } from '../configuration/ZapSimulation';
import { Config } from '../configuration/ChainConfiguration';
import { Searcher, Universe } from '..';
declare class Step {
    readonly inputs: TokenQuantity[];
    readonly action: BaseAction;
    readonly destination: Address;
    readonly outputs: TokenQuantity[];
    constructor(inputs: TokenQuantity[], action: BaseAction, destination: Address, outputs: TokenQuantity[]);
}
export declare class ThirdPartyIssue extends Error {
    readonly msg: string;
    constructor(msg: string);
}
export declare abstract class BaseSearcherResult {
    readonly searcher: Searcher<Universe<Config>>;
    readonly userInput: TokenQuantity;
    swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    readonly startTime: number;
    readonly abortSignal: AbortSignal;
    readonly zapId: bigint;
    protected readonly planner: Planner;
    readonly blockNumber: number;
    readonly commands: Step[];
    readonly potentialResidualTokens: Token[];
    readonly allApprovals: Approval[];
    readonly inputToken: Token;
    readonly inputIsNative: boolean;
    tokenPrices: Map<Token, TokenQuantity>;
    priceQty(qty: TokenQuantity): Promise<PricedTokenQuantity>;
    fairPrice(qty: TokenQuantity): Promise<TokenQuantity | null>;
    identity(): string;
    checkIfSearchIsAborted(): Promise<void>;
    universe: Universe<Config>;
    constructor(searcher: Searcher<Universe<Config>>, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    describe(): string[];
    simulate(opts: SimulateParams): Promise<ZapperOutputStructOutput>;
    protected simulateAndParse(options: ToTransactionArgs, data: string): Promise<{
        gasUsed: bigint;
        simulatedOutputs: TokenQuantity[];
        totalValue: TokenQuantity;
        swaps: SwapPaths;
        dust: TokenQuantity[];
        dustValue: TokenQuantity;
        output: TokenQuantity;
    }>;
    protected setupApprovals(): Promise<void>;
    protected encodePayload(outputTokenOutput: TokenQuantity, options: ToTransactionArgs): ZapERC20ParamsStruct;
    protected get value(): bigint;
    protected encodeCall(options: ToTransactionArgs, payload: any): string;
    protected encodeTx(data: string, gasNeeded: bigint): TransactionRequest;
    abstract toTransaction(options: ToTransactionArgs): Promise<ZapTransaction | null>;
    createZapTransaction(options: ToTransactionArgs, fullyConsumed?: Set<Token>): Promise<ZapTransaction | null>;
}
export declare class ZapViaATrade extends BaseSearcherResult {
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction | null>;
}
export declare class RedeemZap extends BaseSearcherResult {
    readonly searcher: Searcher<Universe<Config>>;
    readonly userInput: TokenQuantity;
    readonly parts: {
        full: SwapPaths;
        rtokenRedemption: SwapPath;
        tokenBasketUnwrap: SwapPath[];
        tradesToOutput: SwapPath[];
    };
    readonly signer: Address;
    readonly outputToken: Token;
    readonly startTime: number;
    readonly abortSignal: AbortSignal;
    constructor(searcher: Searcher<Universe<Config>>, userInput: TokenQuantity, parts: {
        full: SwapPaths;
        rtokenRedemption: SwapPath;
        tokenBasketUnwrap: SwapPath[];
        tradesToOutput: SwapPath[];
    }, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction | null>;
}
export declare class MintZap extends BaseSearcherResult {
    readonly searcher: Searcher<Universe<Config>>;
    readonly userInput: TokenQuantity;
    readonly parts: {
        setup: SwapPath | null;
        trading: SwapPaths;
        minting: SwapPaths;
        outputMint: SwapPath;
        full: SwapPaths;
    };
    readonly signer: Address;
    readonly outputToken: Token;
    readonly startTime: number;
    readonly abortSignal: AbortSignal;
    constructor(searcher: Searcher<Universe<Config>>, userInput: TokenQuantity, parts: {
        setup: SwapPath | null;
        trading: SwapPaths;
        minting: SwapPaths;
        outputMint: SwapPath;
        full: SwapPaths;
    }, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction | null>;
}
export {};
//# sourceMappingURL=SearcherResult.d.ts.map