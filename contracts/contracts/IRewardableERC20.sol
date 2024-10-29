// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRewardableERC20Wrapper is IERC20 {
    function deposit(uint256 _amount, address _to) external;
    function withdraw(uint256 _amount, address _to) external;

    function underlying() external view returns (address);
}