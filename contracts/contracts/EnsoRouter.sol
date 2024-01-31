// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface EnsoRouter {
    function routeSingle(
        IERC20 tokenIn,
        uint256 amountIn,
        bytes32[] calldata commands,
        bytes[] calldata state
    ) external payable returns (bytes[] memory returnData);

    function safeRouteSingle(
        IERC20 tokenIn,
        IERC20 tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address receiver,
        bytes32[] calldata commands,
        bytes[] calldata state
    ) external payable returns (bytes[] memory returnData);
}