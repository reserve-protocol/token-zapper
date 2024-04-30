// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IRToken } from "./IRToken.sol";


interface IFacade  {

    // === Static Calls ===

    /// @return How many RToken `account` can issue given current holdings
    /// @custom:static-call
    function maxIssuable(IRToken rToken, address account) external returns (uint256);

    /// @param amounts {qTok} The balances of each basket ERC20 to assume
    /// @return How many RToken can be issued
    /// @custom:static-call
    function maxIssuableByAmounts(IRToken rToken, uint256[] memory amounts)
        external
        returns (uint256);

    /// @return tokens The erc20 needed for the issuance
    /// @return deposits {qTok} The deposits necessary to issue `amount` RToken
    /// @return depositsUoA {UoA} The UoA value of the deposits necessary to issue `amount` RToken
    /// @custom:static-call
    function issue(IRToken rToken, uint256 amount)
        external
        returns (
            address[] memory tokens,
            uint256[] memory deposits,
            uint192[] memory depositsUoA
        );

    /// @return tokens The erc20s returned for the redemption
    /// @return withdrawals The balances the reedemer would receive after a full redemption
    /// @return available The amount actually available, for each token
    /// @dev If available[i] < withdrawals[i], then RToken.redeem() would revert
    /// @custom:static-call
    function redeem(IRToken rToken, uint256 amount)
        external
        returns (
            address[] memory tokens,
            uint256[] memory withdrawals,
            uint256[] memory available
        );

    /// @return tokens The ERC20s backing the RToken
    function basketTokens(IRToken rToken) external view returns (address[] memory tokens);

    /// @return low {UoA/tok} The low price of the RToken as given by the relevant RTokenAsset
    /// @return high {UoA/tok} The high price of the RToken as given by the relevant RTokenAsset
    function price(IRToken rToken) external view returns (uint192 low, uint192 high);
}
