// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

interface IConvexWrapper {
    function convexPool() external view returns (address);

    function convexPoolId() external view returns (uint256);

    function convexToken() external view returns (address);

    function curveToken() external view returns (address);

    

    function deposit(uint256 _amount, address _to) external;
    
    function stake(uint256 _amount, address _to) external;

    function withdraw(uint256 _amount) external;

    function withdrawAndUnwrap(uint256 _amount) external;
}