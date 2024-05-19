import { TransactionRequest } from '@ethersproject/providers';
import { BaseAction } from '../action/Action';
import { Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ArbitrumUniverse } from '../configuration/arbitrum';
import { BaseUniverse } from '../configuration/base';
import { EthereumUniverse } from '../configuration/ethereum';
import { ZapERC20ParamsStruct, ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper';
import { type Token, type TokenQuantity } from '../entities/Token';
import { SwapPath, SwapPaths } from '../searcher/Swap';
import { Planner } from '../tx-gen/Planner';
import { ToTransactionArgs } from './ToTransactionArgs';
import { ZapTransaction } from './ZapTransaction';
import { SimulateParams } from '../configuration/ZapSimulation';
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
    readonly universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse;
    readonly userInput: TokenQuantity;
    swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    readonly startTime: number;
    readonly abortSignal: AbortSignal;
    protected readonly planner: Planner;
    readonly blockNumber: number;
    readonly commands: Step[];
    readonly potentialResidualTokens: Token[];
    readonly allApprovals: Approval[];
    readonly inputToken: Token;
    readonly inputIsNative: boolean;
    toId(): string;
    checkIfSearchIsAborted(): Promise<void>;
    constructor(universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    describe(): string[];
    valueOfDust(): Promise<TokenQuantity>;
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
    abstract toTransaction(options: ToTransactionArgs): Promise<ZapTransaction>;
    createZapTransaction(options: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class ZapViaATrade extends BaseSearcherResult {
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class RedeemZap extends BaseSearcherResult {
    readonly universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse;
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
    constructor(universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse, userInput: TokenQuantity, parts: {
        full: SwapPaths;
        rtokenRedemption: SwapPath;
        tokenBasketUnwrap: SwapPath[];
        tradesToOutput: SwapPath[];
    }, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class MintZap extends BaseSearcherResult {
    readonly universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse;
    readonly userInput: TokenQuantity;
    readonly parts: {
        trading: SwapPaths;
        minting: SwapPaths;
        rTokenMint: SwapPath;
        full: SwapPaths;
    };
    readonly signer: Address;
    readonly outputToken: Token;
    readonly startTime: number;
    readonly abortSignal: AbortSignal;
    constructor(universe: EthereumUniverse | BaseUniverse | ArbitrumUniverse, userInput: TokenQuantity, parts: {
        trading: SwapPaths;
        minting: SwapPaths;
        rTokenMint: SwapPath;
        full: SwapPaths;
    }, signer: Address, outputToken: Token, startTime: number, abortSignal: AbortSignal);
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export {};
