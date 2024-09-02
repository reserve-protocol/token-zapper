// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

abstract contract PreventTampering {
    bytes32 public immutable deployCodehash;
    constructor() {
        bytes32 deployCodehash_;
        assembly {
            deployCodehash_ := extcodehash(address())
        }
        deployCodehash = deployCodehash_;
    }
    modifier revertOnCodeHashChange() {
        _;

        bytes32 hashPostExecution;
        assembly {
            hashPostExecution := extcodehash(address())
        }
        require(hashPostExecution == deployCodehash, "PreventTampering: Code has changed");
    }
}


contract SelfDestruct {
    function destroy() external {
        selfdestruct(payable(msg.sender));
    }
}

contract TestPreventTampering is PreventTampering {
    function shouldNotRevert() external {
        SelfDestruct selfDestruct = new SelfDestruct();
        address(selfDestruct).delegatecall(abi.encodeWithSelector(selfDestruct.destroy.selector));
    }
    function shouldRevert() revertOnCodeHashChange() external {
        SelfDestruct selfDestruct = new SelfDestruct();
        address(selfDestruct).delegatecall(abi.encodeWithSelector(selfDestruct.destroy.selector));
    }
}