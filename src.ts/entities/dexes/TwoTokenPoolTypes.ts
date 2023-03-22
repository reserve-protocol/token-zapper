// 0->1 reads as going from token0 to token1.
// 1->0 reads as we're going to token1 to token0

export type Token0ForToken1 = '0->1'
export type Token1ForToken0 = '1->0'
export type SwapDirection = Token0ForToken1 | Token1ForToken0
