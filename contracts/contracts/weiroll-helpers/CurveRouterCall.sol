// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;
interface ICurveRouter {

    function get_dy(
        address[11] calldata route,
        uint256[5][5] calldata swapParams,
        uint256 amount
    ) external view returns (uint256);


    function get_dy(
        address[11] calldata route,
        uint256[5][5] calldata swapParams,
        uint256 amount,
        address[5] calldata pools
    ) external view returns (uint256);

    function exchange(
        address[11] calldata route,
        uint256[5][5] calldata swapParams,
        uint256 amount,
        uint256 expected
    ) external payable returns (uint256);


    function exchange(
        address[11] calldata route,
        uint256[5][5] calldata swapParams,
        uint256 amount,
        uint256 expected,
        address[5] calldata pools
    ) external payable returns (uint256);

    function exchange(
        address[11] calldata route,
        uint256[5][5] calldata swapParams,
        uint256 amount,
        uint256 expected,
        address[5] calldata pools,
        uint256 minAmount
    ) external payable returns (uint256);


    function exchange_multiple(
        address[9] calldata route,
        uint256[3][4] calldata swapParams,
        uint256 amount,
        uint256 expected,
        address[4] calldata pools
    ) external returns (uint256);
}
contract CurveRouterCall {
    function exchange(
        uint256 amountIn,
        uint256 expected,
        address router,
        bytes memory encodedRouterCall
    ) external returns (uint256) {
        (
            address[9] memory route,
            uint256[3][4] memory swapParams,
            address[4] memory pools
        ) = abi.decode(
            encodedRouterCall,
            (address[9], uint256[3][4], address[4])
        );
        return ICurveRouter(router).exchange_multiple(
            route,
            swapParams,
            amountIn,
            expected,
            pools
        );
    }

    function exchangeNew(
        uint256 amountIn,
        bytes memory encodedRouterCall
    ) external returns (uint256) {
        (
            address[11] memory route,
            uint256[5][5] memory swapParams,
            uint256 expected,
            address router
        ) = abi.decode(
            encodedRouterCall,
            (address[11], uint256[5][5], uint256, address)
        );
        return ICurveRouter(router).exchange(
            route,
            swapParams,
            amountIn,
            expected
        );
    }
}