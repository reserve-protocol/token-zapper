// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IFolio } from '../IFolio.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';
contract FolioMintRedeem {
  function _fromAssets(
    address[] memory assets,
    uint256[] memory amounts
  ) internal view returns (uint256 shares) {
    uint256 total = type(uint256).max;
    for (uint256 i; i < assets.length; i++) {
      uint256 assetBal = IERC20(assets[i]).balanceOf(address(this));
      uint256 qtyPrShare = amounts[i];
      // {share} = {tok} / {tok/share}
      total = Math.min(total, (assetBal * 1e18) / qtyPrShare);
    }
    return total;
  }

  function mint(IFolio folio) external returns (uint256 shares) {
    (
      address[] memory assets,
      uint256[] memory amounts
    ) = folio.toAssets(1e18, Math.Rounding.Up);

    uint256 shares = _fromAssets(assets, amounts);

    uint256 balanceBefore = IERC20(address(folio)).balanceOf(address(this));
    folio.mint(shares, address(this));
    uint256 balanceAfter = IERC20(address(folio)).balanceOf(address(this));

    return balanceAfter - balanceBefore;
  }

  function redeem(IFolio folio, uint256 shares) external {
    (
      address[] memory assets,
      uint256[] memory amounts
    ) = folio.folio();
    for (uint256 i; i < assets.length; i++) {
      amounts[i] = 0;
    }
    folio.redeem(shares, address(this), assets, amounts);
  }
}