import { type Address } from '../base/Address';
import { type SwapPath } from '../searcher/Swap';
import { type Token, type TokenQuantity } from '../entities/Token';

export type SwapSignature = (
  payerAddress: Address,
  recipientDestination: Address,
  input: TokenQuantity,
  output: Token,
  slippage: number
) => Promise<SwapPath>;


export type QuoteSignature = (
  input: TokenQuantity,
  output: Token,
  slippage: number
) => Promise<TokenQuantity>;
