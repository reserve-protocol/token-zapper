// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface UniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}