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

interface IRETH {
    function getEthValue(uint256 _rethAmount) external view returns (uint256);
    function getRethValue(uint256 _ethAmount) external view returns (uint256);
}

interface RocketDepositPoolInterface {
    function getBalance() external view returns (uint256);
    function getNodeBalance() external view returns (uint256);
    function getUserBalance() external view returns (int256);
    function getExcessBalance() external view returns (uint256);
    function deposit() external payable;
    function getMaximumDepositAmount() external view returns (uint256);
    function nodeDeposit(uint256 _totalAmount) external payable;
    function nodeCreditWithdrawal(uint256 _amount) external;
    function recycleDissolvedDeposit() external payable;
    function recycleExcessCollateral() external payable;
    function recycleLiquidatedStake() external payable;
    function assignDeposits() external;
    function maybeAssignDeposits() external returns (bool);
    function withdrawExcessBalance(uint256 _amount) external;
}