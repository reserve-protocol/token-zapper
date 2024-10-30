// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVaultYearn is IERC20 {
    function deposit(uint256 amount) external returns (uint256);
    function withdraw(uint256 maxShares) external returns (uint256);
    function pricePerShare() external view returns (uint256);
}
