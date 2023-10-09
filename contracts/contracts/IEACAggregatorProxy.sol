// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IEACAggregatorProxy {
    function latestAnswer() external returns (uint256);
}
