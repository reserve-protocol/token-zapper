// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IConcentratorVault {
    function getUserShare(uint256 _pid, address _account) external view returns (uint256);
}

contract VirtualERC20 {
    IConcentratorVault public concentratorVault;
    uint256 public pid;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    constructor(address _vaultAddress, uint256 _pid, string memory name_, string memory symbol_, uint8 decimals_) {
        concentratorVault = IConcentratorVault(_vaultAddress);
        pid = _pid;
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function balanceOf(address account) public view returns (uint256) {
        return concentratorVault.getUserShare(pid, account);
    }

    function transfer(address, uint256) public pure returns (bool) {
        revert("VirtualERC20: Transfers not supported");
    }
}
