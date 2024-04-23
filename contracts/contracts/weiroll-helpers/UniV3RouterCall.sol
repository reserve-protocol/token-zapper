// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @dev Setting `amountIn` to 0 will cause the contract to look up its own balance,
    /// and swap the entire amount, enabling contracts to send tokens before calling this function.
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another along the specified path
    /// @dev Setting `amountIn` to 0 will cause the contract to look up its own balance,
    /// and swap the entire amount, enabling contracts to send tokens before calling this function.
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);
}
contract UniV3RouterCall {
    function exactInputSingle(
        uint256 amountIn,
        uint256 _expected,
        address router,
        bytes calldata encodedRouterCall
    ) external returns (uint256) {
        (ISwapRouter.ExactInputSingleParams memory decodedCall) = abi.decode(
            encodedRouterCall,
            (ISwapRouter.ExactInputSingleParams)
        );
        decodedCall.amountIn = amountIn;
        decodedCall.amountOutMinimum = _expected;
        return ISwapRouter(router).exactInputSingle(decodedCall);
    }

    function exactInput(
        uint256 amountIn,
        uint256 _expected,
        address router,
        address recipient,
        bytes memory path
    ) external returns (uint256) {
        ISwapRouter.ExactInputParams memory decodedCall = ISwapRouter.ExactInputParams({
            path: path,
            recipient: recipient,
            amountIn: amountIn,
            amountOutMinimum: _expected
        });
        decodedCall.amountIn = amountIn;
        decodedCall.amountOutMinimum = _expected;
        return ISwapRouter(router).exactInput(decodedCall);
    }
}