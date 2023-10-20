import { Universe } from '../Universe';
import { Address } from '../base/Address';
import { Token, TokenQuantity } from '../entities/Token';
import { DexAggregator } from './DexAggregator';
interface Quote {
    amountReturned: string;
    amountIn: string;
    estimatedGas: string;
    tokenApprovalAddress: string;
    rawQuote: {
        chainId: number;
        price: string;
        guaranteedPrice: string;
        estimatedPriceImpact: string;
        to: string;
        data: string;
        value: string;
        gas: string;
        estimatedGas: string;
        from: string;
        gasPrice: string;
        protocolFee: string;
        minimumProtocolFee: string;
        buyTokenAddress: string;
        sellTokenAddress: string;
        buyAmount: string;
        sellAmount: string;
        allowanceTarget: string;
        decodedUniqueId: string;
        sellTokenToEthRate: string;
        buyTokenToEthRate: string;
        grossPrice: string;
        grossBuyAmount: string;
        grossSellAmount: string;
        gasLimit: string;
    };
}
export declare const fetchQuote: ({ userAddress, destination, quantity: qty, output, chainId, slippage, }: {
    userAddress: Address;
    destination: Address;
    quantity: TokenQuantity;
    output: Token;
    chainId: number;
    slippage: number;
}) => Promise<Quote>;
export declare const createDefillama: (aggregatorName: string, universe: Universe, slippage: number) => DexAggregator;
export {};
