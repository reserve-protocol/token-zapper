import { TransactionRequest } from '@ethersproject/providers';
import { type PermitTransferFrom } from '@uniswap/permit2-sdk';
import { type Action } from '../action/Action';
import { type Address } from '../base/Address';
import { Approval } from '../base/Approval';
import { ContractCall } from '../base/ContractCall';
import { ZapperOutputStructOutput } from '../contracts/contracts/Zapper.sol/Zapper';
import { type Token, type TokenQuantity } from '../entities/Token';
import { SwapPaths } from '../searcher/Swap';
import { TransactionBuilder } from './TransactionBuilder';
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined';
import { ZapTransaction } from './ZapTransaction';
interface SimulateParams {
    data: string;
    value: bigint;
    quantity: bigint;
    inputToken: Token;
    gasLimit?: number;
}
declare class Step {
    readonly inputs: TokenQuantity[];
    readonly action: Action;
    readonly destination: Address;
    readonly outputs: TokenQuantity[];
    constructor(inputs: TokenQuantity[], action: Action, destination: Address, outputs: TokenQuantity[]);
}
type ToTransactionArgs = Partial<{
    returnDust: boolean;
    maxIssueance?: boolean;
    outputSlippage?: bigint;
    gasLimit?: number;
    permit2: {
        permit: PermitTransferFrom;
        signature: string;
    };
}>;
export declare abstract class BaseSearcherResult {
    readonly universe: UniverseWithERC20GasTokenDefined;
    readonly userInput: TokenQuantity;
    swaps: SwapPaths;
    readonly signer: Address;
    readonly outputToken: Token;
    protected readonly builder: TransactionBuilder;
    readonly blockNumber: number;
    readonly commands: Step[];
    readonly potentialResidualTokens: Token[];
    readonly allApprovals: Approval[];
    readonly inputToken: Token;
    readonly inputIsNative: boolean;
    constructor(universe: UniverseWithERC20GasTokenDefined, userInput: TokenQuantity, swaps: SwapPaths, signer: Address, outputToken: Token);
    describe(): string[];
    valueOfDust(): Promise<TokenQuantity>;
    protected encodeActions(steps: Step[]): Promise<ContractCall[]>;
    simulateNoNode({ data, value }: SimulateParams): Promise<ZapperOutputStructOutput>;
    simulate({ data, value, quantity, inputToken, gasLimit, }: SimulateParams): Promise<ZapperOutputStructOutput>;
    protected simulateAndParse(options: ToTransactionArgs, data: string): Promise<{
        gasUsed: bigint;
        simulatedOutputs: TokenQuantity[];
        totalValue: TokenQuantity;
        swaps: SwapPaths;
        dust: TokenQuantity[];
        dustValue: TokenQuantity;
        output: TokenQuantity;
    }>;
    protected setupApprovals(builder: TransactionBuilder): Promise<void>;
    protected encodePayload(outputTokenOutput: TokenQuantity, options: ToTransactionArgs): {
        tokenIn: string;
        amountIn: bigint;
        commands: {
            to: string;
            value: bigint;
            data: Buffer;
        }[];
        amountOut: bigint;
        tokenOut: string;
        tokensUsedByZap: string[];
    };
    protected get value(): bigint;
    protected encodeCall(options: ToTransactionArgs, payload: any): string;
    protected encodeTx(data: string, gasNeeded: bigint): TransactionRequest;
    abstract toTransaction(options: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class TradeSearcherResult extends BaseSearcherResult {
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class BurnRTokenSearcherResult extends BaseSearcherResult {
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export declare class MintRTokenSearcherResult extends BaseSearcherResult {
    toTransaction(options?: ToTransactionArgs): Promise<ZapTransaction>;
}
export {};
//# sourceMappingURL=SearcherResult.d.ts.map