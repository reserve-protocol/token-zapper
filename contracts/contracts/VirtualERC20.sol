// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IConcentratorVault {
    function getUserShare(uint256 _pid, address _account) external view returns (uint256);
}

contract VirtualERC20 {
    IConcentratorVault public immutable concentratorVault;
    uint256 public pid;
    string public _name;
    string public _symbol;
    uint8 public immutable _decimals;

    constructor(
        address _vaultAddress,
        uint256 _pid,
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) {
        concentratorVault = IConcentratorVault(_vaultAddress);
        pid = _pid;
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
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
