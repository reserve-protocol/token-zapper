// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IPancakeRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 tickSpacing;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}
contract PancakeRouterCall {
    function exactInputSingle(
        uint256 amountIn,
        uint256 _expected,
        address router,
        bytes calldata encodedRouterCall
    ) external returns (uint256) {
        (IPancakeRouter.ExactInputSingleParams memory decodedCall) = abi.decode(
            encodedRouterCall,
            (IPancakeRouter.ExactInputSingleParams)
        );
        decodedCall.amountIn = amountIn;
        decodedCall.amountOutMinimum = _expected;
        return IPancakeRouter(router).exactInputSingle(decodedCall);
    }
}