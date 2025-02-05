// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { ICurveStableSwapNG } from "../CurveStableSwapNG.sol";

contract CurveStableSwapNGHelper {
    function addliquidity(
        uint256 amount,
        uint256 coinIdx,
        ICurveStableSwapNG pool,
        uint256 minOut
    ) external returns (uint256) {
        uint256[] memory amounts = new uint256[](pool.N_COINS());
        amounts[coinIdx] = amount;
        return pool.add_liquidity(amounts, minOut);
    }
}


interface ICurveCryptoFactory {
    function add_liquidity(
        uint256[2] calldata amounts,
        uint256 minOut,
        bool useEth
    ) external returns (uint256);
}
contract CurveCryptoFactoryHelper {
    function addliquidity(
        uint256 amount0,
        uint256 amount1,
        ICurveCryptoFactory pool,
        uint256 minOut,
        bool useEth
    ) external returns (uint256) {
        uint256[2] memory amounts;
        amounts[0] = amount0;
        amounts[1] = amount1;
        return pool.add_liquidity(amounts, minOut, useEth);
    }
}