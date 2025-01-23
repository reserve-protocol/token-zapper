
// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IUniswapV2Pair } from "../IUniswapV2Pair.sol";
function getAmountOut(
  uint amountIn,
  uint reserveIn,
  uint reserveOut
) pure returns (uint amountOut){
  require(amountIn > 0, 'UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT');
  require(reserveIn > 0 && reserveOut > 0, 'UniswapV2Library: INSUFFICIENT_LIQUIDITY');
  uint amountInWithFee = amountIn * 997;
  uint numerator = amountInWithFee * reserveOut;
  uint denominator = reserveIn * 1000 + amountInWithFee;
  amountOut = numerator / denominator;
}
contract Univ2SwapHelper {
    function swap(
        address pool,
        bool zeroForOne,
        address tokenIn,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
      (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pool).getReserves();
      if (zeroForOne) {
        amountOut = getAmountOut(amountIn, reserve0, reserve1);
        SafeERC20.safeTransfer(IERC20(tokenIn), pool, amountIn);
        IUniswapV2Pair(pool).swap(amountOut, 0, address(this), new bytes(0));
      } else {
        amountOut = getAmountOut(amountIn, reserve1, reserve0);
        SafeERC20.safeTransfer(IERC20(tokenIn), pool, amountIn);
        IUniswapV2Pair(pool).swap(0, amountOut, address(this), new bytes(0));
      }
    }
}
