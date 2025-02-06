// SPDX-License-bytes32entifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

/// @title IMetaMorphoFactory
/// @author Morpho Labs
/// @custom:contact security@morpho.org
/// @notice Interface of MetaMorpho's factory.
interface IMetaMorphoFactory {
    /// @notice Emitted when a new MetaMorpho vault is created.
    /// @param metaMorpho The address of the MetaMorpho vault.
    /// @param caller The caller of the function.
    /// @param initialOwner The initial owner of the MetaMorpho vault.
    /// @param initialTimelock The initial timelock of the MetaMorpho vault.
    /// @param asset The address of the underlying asset.
    /// @param name The name of the MetaMorpho vault.
    /// @param symbol The symbol of the MetaMorpho vault.
    /// @param salt The salt used for the MetaMorpho vault's CREATE2 address.
    event CreateMetaMorpho(
        address indexed metaMorpho,
        address indexed caller,
        address initialOwner,
        uint256 initialTimelock,
        address indexed asset,
        string name,
        string symbol,
        bytes32 salt
    );
}