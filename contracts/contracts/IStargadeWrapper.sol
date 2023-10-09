// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IStargateRewardableWrapper {
    function underlying() external view returns (address);
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver) external returns (uint256 shares);
}