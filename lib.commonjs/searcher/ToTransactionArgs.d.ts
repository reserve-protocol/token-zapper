import { type PermitTransferFrom } from '@uniswap/permit2-sdk';
export type ToTransactionArgs = Partial<{
    returnDust: boolean;
    maxIssueance?: boolean;
    outputSlippage?: bigint;
    internalTradeSlippage?: bigint;
    gasLimit?: number;
    permit2: {
        permit: PermitTransferFrom;
        signature: string;
    };
}>;
