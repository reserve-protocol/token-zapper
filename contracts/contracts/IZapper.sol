// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {PermitTransferFrom} from './IPermit2.sol';

struct Call {
    address to;
    bytes data;
    uint256 value;
}

struct ZapERC20Params {
    // Token to zap
    IERC20 tokenIn;
    // Total amount to zap / pull from user
    uint256 amountIn;
    // Smart contract calls to execute to produce 'amountOut' of 'tokenOut'
    Call[] commands;
    // minOut the user requested
    uint256 amountOut;
    // output
    IERC20 tokenOut;
}

interface IZapperExecutor {
    function execute(Call[] calldata calls) external;

    function drainERC20s(
        IERC20[] calldata tokens,
        address destination
    ) external;

    function setupApprovals(
        IERC20[] calldata tokens,
        address[] calldata spenders
    ) external;
}

interface IZapper {
    function zapERC20(ZapERC20Params calldata params) external;

    function zapERC20WithPermit2(
        ZapERC20Params calldata params,
        PermitTransferFrom calldata permit,
        bytes calldata signature
    ) external;

    function zapETH(ZapERC20Params calldata params) external payable;
}
