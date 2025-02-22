// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface WETH {
    function withdraw(uint256 amount) external;
}

contract MoveEth {
    function moveEth(address to, address weth, uint256 amount) external {
        WETH(weth).withdraw(amount);
        (bool success, ) = to.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
}