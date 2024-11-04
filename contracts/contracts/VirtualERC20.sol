// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IConcentratorVault {
    function getUserShare(uint256 _pid, address _account) external view returns (uint256);
}

contract VirtualERC20 {
    IConcentratorVault public immutable concentratorVault;
    uint256 public immutable pid;
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    constructor(address _vaultAddress, uint256 _pid, string memory name_, string memory symbol_, uint8 decimals_) {
        concentratorVault = IConcentratorVault(_vaultAddress);
        pid = _pid;
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
    }

    function balanceOf(address account) public view returns (uint256) {
        return concentratorVault.getUserShare(pid, account);
    }

    function transfer(address, uint256 amt) public pure returns (bool) {
        if (amt == 0) {
            return true;
        }
        revert("VirtualERC20: Transfers not supported");
    }
}
