// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IRETHRouter {
    function swapTo(
        uint256 _uniswapPortion,
        uint256 _balancerPortion,
        uint256 _minTokensOut,
        uint256 _idealTokensOut
    ) external payable;

    function swapFrom(
        uint256 _uniswapPortion,
        uint256 _balancerPortion,
        uint256 _minTokensOut,
        uint256 _idealTokensOut,
        uint256 _tokensIn
    ) external;

    function optimiseSwapTo(
        uint256 _amount,
        uint256 _steps
    ) external returns (uint256[2] memory portions, uint256 amountOut);

    function optimiseSwapFrom(
        uint256 _amount,
        uint256 _steps
    ) external returns (uint256[2] memory portions, uint256 amountOut);
}
