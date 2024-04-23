// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IStaticAV3TokenLM {
    function deposit(
        uint256 assets,
        address receiver,
        uint16 referralCode,
        bool fromUnderlying
    ) external returns (uint256);

    function redeem(
        uint256 shares,
        address receiver,
        address owner,
        bool withdrawFromAave
    ) external returns (uint256);

    function rate() external view returns (uint256);
}
