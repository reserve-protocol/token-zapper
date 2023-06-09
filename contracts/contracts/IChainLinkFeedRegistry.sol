// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IChainLinkFeedRegistry {
    function latestAnswer(
        address base,
        address quote
    ) external returns (uint256);
}
