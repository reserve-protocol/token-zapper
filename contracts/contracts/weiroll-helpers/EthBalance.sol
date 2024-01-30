// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

contract EthBalance {
    function ethBalance(address account) external returns (uint256) {
        return account.balance;
    }
}