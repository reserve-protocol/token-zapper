// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IBalancerVault } from "../Balancer.sol";

contract BalancerCall {
  struct StaticData {
    uint256 limit;
    address tokenIn;
    address tokenOut;
    bytes32 poolId;
    address payable recipient;
    uint256 deadline;
    IBalancerVault.SwapKind kind;
  }
  function swap(
    uint256 amountIn,
    bytes memory data
  ) external returns (uint256) {
    StaticData memory staticData = abi.decode(data, (StaticData));
    IBalancerVault.SingleSwap memory singleSwap = IBalancerVault.SingleSwap({
      poolId: staticData.poolId,
      kind: staticData.kind,
      assetIn: staticData.tokenIn,
      assetOut: staticData.tokenOut,
      amount: amountIn,
      userData: ""
    });
    IBalancerVault.FundManagement memory funds = IBalancerVault.FundManagement({
      sender: address(this),
      fromInternalBalance: false,
      recipient: staticData.recipient,
      toInternalBalance: false
    });
    return IBalancerVault(
      0xBA12222222228d8Ba445958a75a0704d566BF2C8
    ).swap(singleSwap, funds, staticData.limit, staticData.deadline);
  }
}
