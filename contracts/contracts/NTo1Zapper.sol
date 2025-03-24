// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

import { IWrappedNative } from "./IWrappedNative.sol";
import { VM } from "./weiroll/VM.sol";
import { PreventTampering } from "./PreventTampering.sol";

import { ZapperExecutor, DeployFolioConfig, ExecuteDeployOutput } from "./ZapperExecutor.sol";

struct ZapperOutput {
    uint256[] dust;
    uint256 amountOut;
    uint256 gasUsed;
}
struct TokenQuantity {
  address token;
  uint256 quantity;
}

struct MultiZapParams {
  TokenQuantity[] inputs;
  
  // Weiroll code to execute to produce 'amountOut' of 'tokenOut'
  bytes32[] commands;
  bytes[] state;
  IERC20[] tokens;

  // RTokens the user requested
  uint256 amountOut;
  // RToken to issue
  address tokenOut;

  address recipient;
}


contract NTo1Zapper is ReentrancyGuard {
    IWrappedNative internal immutable wrappedNative;
    ZapperExecutor internal immutable zapperExecutor;

    constructor(
        IWrappedNative wrappedNative_,
        ZapperExecutor executor_
    ) {
        wrappedNative = wrappedNative_;
        zapperExecutor = executor_;
    }

    receive() external payable {}

    function zap(MultiZapParams calldata params) external payable nonReentrant returns (ZapperOutput memory) {
        uint256 startGas = gasleft();
        return zapInner(params, balanceOf(params.tokenOut, params.recipient), startGas);
    }

    function zapInner(MultiZapParams calldata params, uint256 initialBalance, uint256 startGas) private returns (ZapperOutput memory out) {
        require(params.amountOut != 0, "INVALID_OUTPUT_AMOUNT");

        pullFundsFromSender(params.inputs);
        // STEP 1: Execute
        out.dust = zapperExecutor.execute(
            params.commands,
            params.state,
            params.tokens
        ).dust;

        // STEP 2: Verify that the user has gotten the tokens they requested
        uint256 newBalance = balanceOf(params.tokenOut, params.recipient);
        require(newBalance > initialBalance, "INVALID_NEW_BALANCE");
        uint256 difference = newBalance - initialBalance;
        require(difference >= params.amountOut, "INSUFFICIENT_OUT");

        out.amountOut = difference;
        out.gasUsed = startGas - gasleft();
    }

    function pullFundsFromSender(
        TokenQuantity[] calldata inputs
    ) private {
      for (uint256 i = 0; i < inputs.length; i++) {
        TokenQuantity memory input = inputs[i];
        address token = input.token;
        uint256 amount = input.quantity;
          if (token != address(0)) {
              SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(zapperExecutor), amount);
          } else {
              require(msg.value >= amount, "INSUFFICIENT_ETH");
              wrappedNative.deposit{ value: amount }();
              SafeERC20.safeTransfer(IERC20(address(wrappedNative)), address(zapperExecutor), amount);
          }
        }
    }


    function balanceOf(address token, address account) private view returns (uint256) {
        if (token != address(0)) {
            // Check if token address contains bytecode
            return IERC20(token).balanceOf(account);
        } else {
            return account.balance;
        }
    }
}
