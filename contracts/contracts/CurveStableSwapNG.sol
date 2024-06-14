// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface ICurveStableSwapNG {
    function get_dx(int128 i, int128 j, uint256 dy, address pool) external view returns (uint256);
    function get_dy(int128 i, int128 j, uint256 dx, address pool) external view returns (uint256);
    function dynamic_fee(int128 i, int128 j, address pool) external view returns (uint256);
    function calc_token_amount(
        uint256[] calldata amounts,
        bool isDeposit
    ) external view returns (uint256);

    function coins(uint256 i) external view returns (address);
    function N_COINS() external view returns (uint256);

    function calc_withdraw_one_coin(
        uint256 amt,
        int128 i
    ) external view returns (uint256);
    
    function add_liquidity(
        uint256[] calldata amounts,
        uint256 minOut
    )external returns (uint256);

    function remove_liquidity(
        uint256 amount,
        uint256[] calldata mintOuts
    ) external returns (uint256[] memory);
    function remove_liquidity_one_coin(
        uint256 amt,
        int128 i,
        uint256 mintOut
    ) external returns (uint256);
}


