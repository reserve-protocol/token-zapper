// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IComponentRegistry {
    // === Component setters/getters ===
    function rToken() external view returns (address);
    function stRSR() external view returns (address);
    function assetRegistry() external view returns (address);
    function basketHandler() external view returns (address);
    function backingManager() external view returns (address);
    function distributor() external view returns (address);
    function rsrTrader() external view returns (address);
    function rTokenTrader() external view returns (address);
    function furnace() external view returns (address);
    function broker() external view returns (address);
}

interface IMain is IComponentRegistry {
    function poke() external; // not used in p1
    function rsr() external view returns (address);
}