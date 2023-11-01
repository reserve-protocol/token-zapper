// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface Comet {
    function supply(address asset, uint256 amount) external;
    function withdrawTo(address to, address asset, uint amount) external;
}

interface WrappedComet {
    function exchangeRate() external view returns (uint256);
    function deposit(uint256 amount) external;
    function withdrawTo(address dst, uint256 amount) external;
    function convertStaticToDynamic(uint104 amount) external view returns (uint256);
    function convertDynamicToStatic(uint256 amount) external view returns (uint104);
}