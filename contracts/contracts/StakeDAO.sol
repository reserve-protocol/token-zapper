// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IGaugeStakeDAO is IERC20 {
    function vault() external view returns (address);
}

interface IVaultStakeDAO {
    function deposit(address _recipient, uint256 _amount, bool _earn) external;
    function withdraw(uint256 _shares) external;
}
