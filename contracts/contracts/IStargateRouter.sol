// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IStargateRouter {
    // Deposit
    function addLiquidity(
        uint256 poolId,
        uint256 amountLD,
        address _to
    ) external;

    // Withdraw
    function instantRedeemLocal(
        uint16 poolId,
        uint256 amountLD,
        address _to
    ) external returns (uint256 amountSD);
}

interface IStargatePool {
    function token() external view returns(address);
    function poolId() external view returns(uint256);
}