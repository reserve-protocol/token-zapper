// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

contract EmitId {
    event ReserveZapId(uint256 id);
    function emitId(uint256 id) external {
        emit ReserveZapId(id);  
    }
}