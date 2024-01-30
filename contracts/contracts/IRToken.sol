// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title IRToken
 * @notice An RToken is an ERC20 that is permissionlessly issuable/redeemable and tracks an
 *   exchange rate against a single unit: baskets, or {BU} in our type notation.
 */
interface IRToken is IERC20Metadata {
    function version() external pure returns (string memory);
    function issue(uint256 amount) external;
    function issueTo(address recipient, uint256 amount) external;
    function redeem(uint256 amount) external;
    function redeemTo(
        address recipient,
        uint256 amount
    ) external;
    function mint(address recipient, uint256 amount) external;
    function basketsNeeded() external view returns (uint192);
}
