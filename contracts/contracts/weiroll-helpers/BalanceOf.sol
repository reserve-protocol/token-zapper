// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

contract BalanceOf {
    error BalanceOfFailed(address token, address account);
    function balanceOf(address token, address account) external returns (uint256) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(
                0x70a08231, // balanceOf(address)
                account
            )
        );
        if (!success) {
            revert BalanceOfFailed(token, account);
        }
        return abi.decode(data, (uint256));
    }
}