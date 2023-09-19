// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface WrapperCompV3 {
    function exchangeRate() external view returns (uint256);
    function deposit(uint256 amount) external;
    function withdrawTo(address dst, uint256 amount) external;
}