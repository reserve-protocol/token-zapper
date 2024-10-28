// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IVaultStakeDAO {
    function deposit(address _recipient, uint256 _amount, bool _earn) external;
    function withdraw(uint256 _shares) external;
}
