// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import { IERC4626 } from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

interface IStakedEthenaUSD is IERC4626 {
    function cooldownShares(uint256 shares) external;
}