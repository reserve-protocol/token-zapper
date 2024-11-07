// SPDX-License-Identifier: BlueOak-1.0.0
pragma solidity 0.8.17;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";


struct PoolInfo {
    address lptoken;
    address token;
    address gauge;
    address crvRewards;
    address stash;
    bool shutdown;
}

interface IBooster{
    function poolInfo(uint256) external view returns(PoolInfo memory);
}

interface IRewardStaking {
    function stakeFor(address, uint256) external;

    function stake(uint256) external;

    function withdraw(uint256 amount, bool claim) external;

    function withdrawAndUnwrap(uint256 amount, bool claim) external;

    function earned(address account) external view returns (uint256);

    function getReward() external;

    function getReward(address _account, bool _claimExtras) external;

    function extraRewardsLength() external view returns (uint256);

    function extraRewards(uint256 _pid) external view returns (address);

    function rewardToken() external view returns (address);

    function balanceOf(address _account) external view returns (uint256);
}

interface ConvexStakingWrapper is IERC20Metadata {
    //constants/immutables
    function crv() external view returns (address);
    function convexBooster() external view returns (address);
    function cvx() external view returns (address);
    function curveToken() external view returns (address);
    function convexToken() external view returns (address);
    function convexPool() external view returns (address);
    function convexPoolId() external view returns (uint256);
    function collateralVault() external view returns (address);

    //rewards
    event Deposited(
        address indexed _user,
        address indexed _account,
        uint256 _amount,
        bool _wrapped
    );
    event Withdrawn(address indexed _user, uint256 _amount, bool _unwrapped);
    event RewardRedirected(address indexed _account, address _forward);
    event RewardAdded(address _token);
    event UserCheckpoint(address _userA, address _userB);
    event RewardsClaimed(IERC20Metadata indexed erc20, uint256 indexed amount);


    function totalBalanceOf(address _account) external view returns (uint256);

    function deposit(uint256 _amount, address _to) external;
    function stake(uint256 _amount, address _to) external;
    function withdraw(uint256 _amount) external;
    function withdrawAndUnwrap(uint256 _amount) external;
}

interface ICurveLPToken is IERC20Metadata {
    function minter() external view returns (address);
}

contract ConvexVirtualERC20 {
    IRewardStaking public immutable crvRewards;
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    constructor(
        address _crvRewards,
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) {
        crvRewards = IRewardStaking(_crvRewards);
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
    }

    function balanceOf(address account) public view returns (uint256) {
        return crvRewards.balanceOf(account);
    }

    function transfer(address, uint256 amt) public pure returns (bool) {
        if (amt == 0) {
            return true;
        }
        revert("ConvexVirtualERC20: Transfers not supported");
    }
}
