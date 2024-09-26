// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IAssetRegistry
 * @notice The AssetRegistry is in charge of maintaining the ERC20 tokens eligible
 *   to be handled by the rest of the system. If an asset is in the registry, this means:
 *      1. Its ERC20 contract has been vetted
 *      2. The asset is the only asset for that ERC20
 *      3. The asset can be priced in the UoA, usually via an oracle
 */

 struct Price {
    uint192 low; // {UoA/tok}
    uint192 high; // {UoA/tok}
}

interface IAssetRegistry  {
    function refresh() external;

    function toAsset(address asset) external view returns (IAsset);
}

interface IAsset {
    function price() external view returns (Price memory);
}
