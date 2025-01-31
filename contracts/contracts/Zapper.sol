// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

import { IWrappedNative } from "./IWrappedNative.sol";
import { FacadeRead, RToken, Call, ZapERC20Params } from "./IRTokenZapper.sol";
import { IPermit2, SignatureTransferDetails, PermitTransferFrom } from "./IPermit2.sol";
import { VM } from "./weiroll/VM.sol";
import { PreventTampering } from "./PreventTampering.sol";
import { ZapperExecutor } from "./ZapperExecutor.sol";

struct ZapperOutput {
    uint256[] dust;
    uint256 amountOut;
    uint256 gasUsed;
}


contract Zapper is ReentrancyGuard {
    IWrappedNative internal immutable wrappedNative;
    IPermit2 internal immutable permit2;
    ZapperExecutor internal immutable zapperExecutor;

    constructor(
        IWrappedNative wrappedNative_,
        IPermit2 permit2_,
        ZapperExecutor executor_
    ) {
        wrappedNative = wrappedNative_;
        permit2 = permit2_;
        zapperExecutor = executor_;
    }

    function zapInner(ZapERC20Params calldata params) internal returns (ZapperOutput memory out) {
        uint256 initialBalance = params.tokenOut.balanceOf(msg.sender);
        // STEP 1: Execute
        out.dust = zapperExecutor.execute(
            params.commands,
            params.state,
            params.tokens
        ).dust;

        // STEP 2: Verify that the user has gotten the tokens they requested
        uint256 newBalance = params.tokenOut.balanceOf(msg.sender);
        require(newBalance > initialBalance, "INVALID_NEW_BALANCE");
        uint256 difference = newBalance - initialBalance;
        require(difference >= params.amountOut, "INSUFFICIENT_OUT");

        out.amountOut = difference;
        
    }

    receive() external payable {}

    function zapERC20(
        ZapERC20Params calldata params
    ) external nonReentrant returns (ZapperOutput memory out) {
        uint256 startGas = gasleft();
        require(params.amountIn != 0, "INVALID_INPUT_AMOUNT");
        require(params.amountOut != 0, "INVALID_OUTPUT_AMOUNT");
        SafeERC20.safeTransferFrom(
            params.tokenIn,
            msg.sender,
            address(zapperExecutor),
            params.amountIn
        );
        out = zapInner(params);
        out.gasUsed = startGas - gasleft();
    }

    function zapERC20WithPermit2(
        ZapERC20Params calldata params,
        PermitTransferFrom calldata permit,
        bytes calldata signature
    ) external nonReentrant returns (ZapperOutput memory out) {
        uint256 startGas = gasleft();
        require(params.amountIn != 0, "INVALID_INPUT_AMOUNT");
        require(params.amountOut != 0, "INVALID_OUTPUT_AMOUNT");

        permit2.permitTransferFrom(
            permit,
            SignatureTransferDetails({
                to: address(zapperExecutor),
                requestedAmount: params.amountIn
            }),
            msg.sender,
            signature
        );

        out = zapInner(params);
        out.gasUsed = startGas - gasleft();
    }

    function zapETH(
        ZapERC20Params calldata params
    ) external payable nonReentrant returns (ZapperOutput memory out) {
        uint256 startGas = gasleft();
        require(address(params.tokenIn) == address(wrappedNative), "INVALID_INPUT_TOKEN");
        require(params.amountIn == msg.value, "INVALID_INPUT_AMOUNT");
        require(msg.value != 0, "INVALID_INPUT_AMOUNT");
        require(params.amountOut != 0, "INVALID_OUTPUT_AMOUNT");
        wrappedNative.deposit{ value: msg.value }();
        SafeERC20.safeTransfer(
            IERC20(address(wrappedNative)),
            address(zapperExecutor),
            wrappedNative.balanceOf(address(this))
        );
        out = zapInner(params);
        out.gasUsed = startGas - gasleft();
    }
}
