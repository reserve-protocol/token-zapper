// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IStaticAV3TokenLM {
    function deposit(
        uint256 assets,
        address receiver,
        uint16 referralCode,
        bool fromUnderlying
    ) external returns (uint256);
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external virtual returns (uint256);
    function rate() external view returns (uint256);
}
