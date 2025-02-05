import { type Token, type TokenQuantity } from '../entities/Token';
import { type SwapPath } from '../searcher/Swap';

export type SwapSignature = (
  abort: AbortSignal,
  input: TokenQuantity,
  output: Token,
  slippage: bigint
) => Promise<SwapPath>;