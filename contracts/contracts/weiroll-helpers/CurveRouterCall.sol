// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
interface ICurveRouter {
    function exchange_multiple(
        address[9] calldata _route,
        uint256[3][4] calldata _swap_params,
        uint256 _amount,
        uint256 _expected,
        address[4] calldata _pools
    ) external returns (uint256);
}
contract CurveRouterCall {
    function exchange(uint256 amountIn, uint256 _expected, address router, bytes memory encodedRouterCall) external returns (uint256) {
        (address[9] memory _route, uint256[3][4] memory _swap_params, address[4] memory _pools ) = abi.decode(
            encodedRouterCall,
            (address[9], uint256[3][4], address[4])
        );
        return ICurveRouter(router).exchange_multiple(
            _route,
            _swap_params,
            amountIn,
            _expected,
            _pools
        );
    }
}