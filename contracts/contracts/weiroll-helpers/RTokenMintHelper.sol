
pragma solidity 0.8.17;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';

interface FacadeRead {
  function maxIssuable(RToken rToken, address account) external returns (uint256);
}

interface RToken {
  function issueTo(address recipient, uint256 amount) external;
}

struct BasketRange {
  uint192 bottom; // {BU}
  uint192 top; // {BU}
}

interface IBasketHandler {
  function basketsHeldBy(address account) external returns (BasketRange memory);
}

contract RTokenMintHelper {
  function mintToken(
    FacadeRead facade,
    bytes calldata basket,
    RToken rToken
  ) external returns (uint256) {
    (IERC20[] memory assets) = abi.decode(basket, (IERC20[]));
    for (uint256 i; i < assets.length; i++) {
      IERC20 asset = assets[i];
      SafeERC20.safeApprove(asset, address(rToken), 0);
      SafeERC20.safeApprove(asset, address(rToken), type(uint256).max);
    }
    uint256 amount = facade.maxIssuable(rToken, address(this));
    rToken.issueTo(msg.sender, amount);

    for (uint256 i; i < assets.length; i++) {
      IERC20 asset = assets[i];
      uint256 b = asset.balanceOf(address(this));
      if (b == 0) {
        continue;
      }
      SafeERC20.safeTransfer(asset, msg.sender, b);
    }
    return amount;
  }
}