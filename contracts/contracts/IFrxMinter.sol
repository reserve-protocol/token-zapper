// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IfrxETHMinter {
  function submitAndDeposit(address recipient) external payable returns (uint256 shares);
  function submit(address recipient) external payable returns (uint256 shares);
}
