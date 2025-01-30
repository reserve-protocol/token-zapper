
// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployFolioHelper {
  function deployFolio(
      address deployer,
      address expectedTokenAddress,
      bool isGoverned,
      bytes memory encodedFolioDeployerCall
  ) external returns (uint256) {
    (bool success, bytes memory result) = address(deployer).call(encodedFolioDeployerCall);
    if (!success) {
      assembly{
        let revertStringLength := mload(result)
        let revertStringPtr := add(result, 0x20)
        revert(revertStringPtr, revertStringLength)
      }
    }
    if (isGoverned) {
      (address folio, , , , , ) = abi.decode(result, (address, address, address, address, address, address));
      if (folio != expectedTokenAddress) {
        revert('EXPECTED != ACTUAL');
      }

      return IERC20(expectedTokenAddress).balanceOf(address(this));
    } else {
      (address folio, ) = abi.decode(result, (address, address));
      if (folio != expectedTokenAddress) {
        revert('EXPECTED != ACTUAL');
      }

      return IERC20(expectedTokenAddress).balanceOf(address(this));
    }
    
  }
}
