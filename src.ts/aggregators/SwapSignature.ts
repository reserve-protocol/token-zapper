import { type Address } from '../base/Address';
import { type SwapPath } from '../searcher/Swap';
import { type Token, type TokenQuantity } from '../entities/Token';

export type SwapSignature = (
  abort: AbortSignal,
  input: TokenQuantity,
  output: Token,
  slippage: bigint
) => Promise<SwapPath>;