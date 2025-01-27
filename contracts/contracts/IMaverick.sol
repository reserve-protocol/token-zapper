// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IMaverickV2Quoter {
  /**
   * @notice Calculates a swap on a MaverickV2Pool and returns the resulting
   * amount and estimated gas.  The gas estimate is only a rough estimate and
   * may not match a swap's gas.
   * @param pool The MaverickV2Pool to swap on.
   * @param amount The input amount.
   * @param tokenAIn Indicates if token A is the input token.
   * @param exactOutput Indicates if the amount is the output amount (true)
   * or input amount (false). If the tickLimit is reached, the full value of
   * the exactOutput may not be returned because the pool will stop swapping
   * before the whole order is filled.
   * @param tickLimit The tick limit for the swap. Once the swap lands in
   * this tick, it will stop and return the output amount swapped up to that
   * tick.
   */
  function calculateSwap(
      address pool,
      uint128 amount,
      bool tokenAIn,
      bool exactOutput,
      int32 tickLimit
  ) external returns (uint256 amountIn, uint256 amountOut, uint256 gasEstimate);

}