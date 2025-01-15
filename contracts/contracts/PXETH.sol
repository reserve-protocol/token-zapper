// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IPXETH {
  function deposit(
      address receiver,
      bool shouldCompound
  ) external payable returns (uint256 postFeeAmount, uint256 feeAmount);
}
