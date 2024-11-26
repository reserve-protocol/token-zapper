// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IBalancerVault {
  enum SwapKind {
    GIVEN_IN,
    GIVEN_OUT
  }

  struct PoolTokenInfo {
    uint256 cash;
    uint256 managed;
    uint256 lastChangeBlock;
    address assetManager;
  }

  struct SingleSwap {
    bytes32 poolId;
    SwapKind kind;
    address assetIn;
    address assetOut;
    uint256 amount;
    bytes userData;
  }

  struct FundManagement {
    address sender;
    bool fromInternalBalance;
    address payable recipient;
    bool toInternalBalance;
  }

  function getPoolTokenInfo(
    bytes32 poolId,
    address token
  ) external view returns (PoolTokenInfo memory);

  function swap(
    SingleSwap memory singleSwap,
    FundManagement memory funds,
    uint256 limit,
    uint256 deadline
)
    external
    payable
    returns (uint256 amountCalculated);
}

interface IBalancerQueries {
  function querySwap(
    IBalancerVault.SingleSwap memory singleSwap,
    IBalancerVault.FundManagement memory funds
  ) external returns (uint256);
}