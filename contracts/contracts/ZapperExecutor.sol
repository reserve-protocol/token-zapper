// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { FacadeRead, RToken } from "./IRTokenZapper.sol";
import { VM } from "./weiroll/VM.sol";
import { PreventTampering } from "./PreventTampering.sol";

struct ExecuteOutput {
  uint256[] dust;
}
contract ZapperExecutor is VM, PreventTampering {
  receive() external payable {}

  function add(
      uint256 a,
      uint256 b
  ) external pure returns (uint256) {
      return a + b;
  }
  function sub(
      uint256 a,
      uint256 b
  ) external pure returns (uint256) {
      return a - b;
  }
  function fpMul(
      uint256 a,
      uint256 b,
      uint256 scale
  ) external pure returns (uint256) {
      return (a * b) / scale;
  }
  function assertLarger(
      uint256 a,
      uint256 b
  ) external pure returns (bool) {
      require(a > b, "!ASSERT_GT");
      return true;
  }
  function assertEqual(
      uint256 a,
      uint256 b
  ) external pure returns (bool) {
      require(a == b, "!ASSERT_EQ");
      return true;
  }


  /** @dev Main endpoint to call
   * @param commands - Weiroll code to execute
   * @param state - Intiaial Weiroll state to use
   * @param tokens - All tokens used by the Zap in order to calculate dust
   */
  function execute(
      bytes32[] calldata commands,
      bytes[] memory state,
      IERC20[] memory tokens
  )
      revertOnCodeHashChange
      public
      payable
      returns (ExecuteOutput memory out)
  {
      _execute(commands, state);
      out.dust = new uint256[](tokens.length);
      for(uint256 i; i < tokens.length; i++) {
          out.dust[i] = tokens[i].balanceOf(address(this));
      }
  }

  /** @dev Workaround for weiroll not supporting a way to make untyped calls.
    * @param to - Address to call
    * @param value - Amount of ETH to send
    * @param data - Data to send
   */
  function rawCall(
      address to,
      uint256 value,
      bytes calldata data
  ) external returns (bool success, bytes memory out) {
      require(msg.sender == address(this), "ZapperExecutor: Only callable by Zapper");
      (success, out) = to.call{value: value}(data);
  }

  /**   @dev Utility for minting max amount of rToken.
             Should only be used off-chain to calculate the exact
             amount of an rToken that can be minted
      * @param token - rToken to mint
      * @param recipient - Recipient of the rToken
   */
  function mintMaxRToken(
      FacadeRead facade,
      RToken token,
      address recipient
  ) external {
      uint256 maxIssueableAmount = facade.maxIssuable(token, address(this));
      token.issueTo(recipient, maxIssueableAmount);
  }
}
