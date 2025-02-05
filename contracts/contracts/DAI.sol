// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;


interface IDssLitePsm {
  function sellGem(address recipient, uint256 gemAmt) external returns (uint256 daiAmt);
}