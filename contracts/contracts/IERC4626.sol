// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import { IERC4626 } from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

interface IStakedEthenaUSD is IERC4626 {
    function cooldownShares(uint256 shares) external;
}


interface ETHTokenVault {
    function deposit(address receiver) external payable returns (uint256);
    function previewDeposit(uint256 amount) external view returns (uint256);
}