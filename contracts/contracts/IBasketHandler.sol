// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

enum RoundingMode {
    FLOOR, // Round towards zero
    ROUND, // Round to the nearest int
    CEIL // Round away from zero
}

/**
 * @title IBasketHandler
 * @notice The BasketHandler aims to maintain a reference basket of constant target unit amounts.
 * When a collateral token defaults, a new reference basket of equal target units is set.
 * When _all_ collateral tokens default for a target unit, only then is the basket allowed to fall
 *   in terms of target unit amounts. The basket is considered defaulted in this case.
 */
interface IBasketHandler {
    /// @param amount {BU}
    /// @return erc20s The addresses of the ERC20 tokens in the reference basket
    /// @return quantities {qTok} The quantity of each ERC20 token to issue `amount` baskets
    function quote(
        uint192 amount,
        RoundingMode rounding
    )
        external
        view
        returns (address[] memory erc20s, uint256[] memory quantities);

    /// @return The current basket nonce, regardless of status
    function nonce() external view returns (uint48);
}
