// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

/**
 * @title IRToken
 * @notice An RToken is an ERC20 that is permissionlessly issuable/redeemable and tracks an
 *   exchange rate against a single unit: baskets, or {BU} in our type notation.
 */
interface IRToken  {
    function issue(uint256 amount) external;
    function issueTo(address recipient, uint256 amount) external;
    function redeem(uint256 amount, uint48 basketNonce) external;
    function redeemTo(
        address recipient,
        uint256 amount,
        uint48 basketNonce
    ) external;
    function mint(address recipient, uint256 amount) external;
    function basketsNeeded() external view returns (uint192);
}
