// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { FacadeRead, RToken } from "./IRTokenZapper.sol";
import { VM } from "./weiroll/VM.sol";
import { PreventTampering } from "./PreventTampering.sol";

import { IFolio, IVotes, GovRoles, IFolioDeployer, IGovernanceDeployer } from "./IFolio.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

struct DeployFolioConfig {
  address deployer;
  IFolio.FolioBasicDetails basicDetails;
  IFolio.FolioAdditionalDetails additionalDetails;
  GovRoles govRoles;

  bool isGoverned;
  IVotes stToken;
  address owner;
  IGovernanceDeployer.GovParams ownerGovParams;
  IGovernanceDeployer.GovParams tradingGovParams;
}

struct ExecuteOutput {
  uint256[] dust;
}
struct ExecuteDeployOutput {
  uint256[] dust;
  uint256 amountOut;
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

  function executeDeploy(
      bytes32[] calldata commands,
      bytes[] memory state,
      IERC20[] memory tokens,
      DeployFolioConfig memory config,
      address recipient,
      bytes32 nonce
  ) revertOnCodeHashChange public payable returns (ExecuteDeployOutput memory out) {
    _execute(commands, state);
    // DSTEP 2: Deploy folio
    uint256 initialShares = type(uint256).max;
    for (uint256 i = 0; i < config.basicDetails.assets.length; i++) {
        uint256 balance = IERC20(config.basicDetails.assets[i]).balanceOf(address(this));
        if (balance == 0) {
            revert('ZERO BALANCE');
        }
        uint256 quantityPrShare = config.basicDetails.amounts[i];
        if (quantityPrShare == 0) {
            revert('ZERO QUANTITY');
        }
        uint256 shares = balance * 1e18 / quantityPrShare;
        
        if (shares < initialShares) {
            initialShares = shares;
        }
        SafeERC20.safeApprove(IERC20(config.basicDetails.assets[i]), address(config.deployer), 0);
        SafeERC20.safeApprove(IERC20(config.basicDetails.assets[i]), address(config.deployer), type(uint256).max);
    }
    if (initialShares == type(uint256).max) {
        revert('NO SHARES');
    }

    config.basicDetails.initialShares = initialShares;

    if (config.isGoverned) {
        (address folio, , , , ,) = IFolioDeployer(config.deployer).deployGovernedFolio(
            config.stToken,
            config.basicDetails,
            config.additionalDetails,
            config.ownerGovParams,
            config.tradingGovParams,
            config.govRoles,
            nonce
        );
        out.amountOut = IERC20(folio).balanceOf(address(this));
        IERC20(folio).transfer(recipient, out.amountOut);
    } else {
        (address folio, ) = IFolioDeployer(config.deployer).deployFolio(
            config.basicDetails,
            config.additionalDetails,
            config.owner,
            config.govRoles.existingTradeProposers,
            config.govRoles.tradeLaunchers,
            config.govRoles.vibesOfficers,
            nonce
        );
        out.amountOut = IERC20(folio).balanceOf(address(this));
        IERC20(folio).transfer(recipient, out.amountOut);
    }
    out.dust = new uint256[](tokens.length);
      for(uint256 i; i < tokens.length; i++) {
          out.dust[i] = tokens[i].balanceOf(address(this));
          tokens[i].transfer(recipient, out.dust[i]);
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
