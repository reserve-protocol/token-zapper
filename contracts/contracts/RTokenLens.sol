// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IAssetRegistry } from "./IAssetRegistry.sol";
import { IBasketHandler, RoundingMode } from "./IBasketHandler.sol";
import { IRToken } from "./IRToken.sol";

contract RTokenLens {
    function redeem(
        IAssetRegistry assetRegistry,
        IBasketHandler basketHandler,
        IRToken rToken,
        uint256 amtRToken
    ) external returns (address[] memory erc20s, uint256[] memory quantities) {
        assetRegistry.refresh();
        uint256 amtBaskets = uint256(rToken.basketsNeeded()) * amtRToken / rToken.totalSupply(); // FLOOR
        (erc20s, quantities) = basketHandler.quote(uint192(amtBaskets), RoundingMode.CEIL);
    }
}
