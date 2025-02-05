
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
function sortTokens(address tokenA, address tokenB) pure returns (address token0, address token1) {
  require(tokenA != tokenB, 'UniswapV2Library: IDENTICAL_ADDRESSES');
  (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
  require(token0 != address(0), 'UniswapV2Library: ZERO_ADDRESS');
}
contract Univ2SwapHelper {
  function swap(
    address pool,
    bool zeroForOne,
    address tokenIn,
    uint256 amountIn
) external returns (uint256 amountOut) {
    
    (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pool).getReserves();
    SafeERC20.safeTransfer(IERC20(tokenIn), pool, amountIn);
    if (zeroForOne) {
      amountOut = getAmountOut(amountIn, reserve0, reserve1);
      IUniswapV2Pair(pool).swap(0, amountOut, address(this), new bytes(0));
    } else {
      amountOut = getAmountOut(amountIn, reserve1, reserve0);
      IUniswapV2Pair(pool).swap(amountOut, 0, address(this), new bytes(0));
    }
  }

  function swapOnPoolWithFeeTokens(
    IUniswapV2Pair pair,
    address tokenIn,
    address tokenOut,
    uint256 amountIn
  ) external returns (uint256 amountOutput) {
    SafeERC20.safeTransfer(IERC20(tokenIn), address(pair), amountIn);
    (address token0,) = sortTokens(tokenIn, tokenOut);
    uint amountInput;
    { // scope to avoid stack too deep errors
    (uint reserve0, uint reserve1,) = pair.getReserves();
    (uint reserveInput, uint reserveOutput) = tokenIn == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    amountInput = IERC20(tokenIn).balanceOf(address(pair)) - reserveInput;
    amountOutput = getAmountOut(amountInput, reserveInput, reserveOutput);
    }
    (uint amount0Out, uint amount1Out) = tokenIn == token0 ? (uint(0), amountOutput) : (amountOutput, uint(0));
    
    pair.swap(amount0Out, amount1Out, address(this), new bytes(0));
  }
}
