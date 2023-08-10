// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.17;

interface IStaticATokenLM {
    
    function deposit(
        address recipient,
        uint256 amount,
        uint16 referralCode,
        bool fromUnderlying
    ) external returns (uint256);

    function withdraw(
        address recipient,
        uint256 amount,
        bool toUnderlying
    ) external returns (uint256, uint256);
    function dynamicBalanceOf(address account) external view returns (uint256);
    function staticToDynamicAmount(uint256 amount) external view returns (uint256);
    function dynamicToStaticAmount(uint256 amount) external view returns (uint256);
    function rate() external view returns (uint256);
    function LENDING_POOL() external view returns (address);
    function ATOKEN() external view returns (address);
    function ASSET() external view returns (address);
    function UNDERLYING_ASSET_ADDRESS() external view returns (address);
}
