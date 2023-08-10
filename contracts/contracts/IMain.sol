// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
interface IMain {
    function rToken() external view returns (address);
    function basketHandler() external view returns (address);
    function backingManager() external view returns (address);
}