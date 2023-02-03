// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NftStakingERC20Token.sol";

//  =============================================
//   _   _  _  _  _  ___  ___  ___  ___ _    ___
//  | \_/ || || \| ||_ _|| __|| __|| o ) |  | __|
//  | \_/ || || \\ | | | | _| | _| | o \ |_ | _|
//  |_| |_||_||_|\_| |_| |___||___||___/___||___|
//
//  Website: https://minteeble.com
//  Email: minteeble@gmail.com
//
//  =============================================

contract NftStakingSystem is AccessControlEnumerable {
    IERC721 public nftCollection;
    NftStakingERC20Token public rewardToken;

    bool public systemPaused;

    struct StakerInfo {
        uint256 amountStaked;
        uint256[] stakedIds;
        uint256 lastClaimTimestamp;
        uint256 unclaimedRewards;
    }

    struct StakedTokenInfo {
        uint256 minPeriod;
    }

    mapping(uint256 => StakedTokenInfo) public stakedTokens;

    mapping(address => StakerInfo) public stakers;

    mapping(uint256 => address) public stakerAddress;

    uint256 public rewardsPerHour = 100000;

    uint256 public timeUnit = 3600;

    constructor(IERC721 _nftCollection, NftStakingERC20Token _rewardToken) {
        nftCollection = _nftCollection;
        rewardToken = _rewardToken;
        systemPaused = false;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier requireAdmin(address _account) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _account), "Unauthorized");
        _;
    }

    modifier systemActive() {
        require(!systemPaused, "System is paused");
        _;
    }

    function setSystemPaused(bool _systemPaused)
        public
        requireAdmin(msg.sender)
    {
        systemPaused = _systemPaused;
    }

    function setRewardPerTimeUnit(uint256 _rewardsPerHour)
        public
        requireAdmin(msg.sender)
    {
        rewardsPerHour = _rewardsPerHour;
    }

    function setTimeunit(uint256 _timeUnit) public requireAdmin(msg.sender) {
        timeUnit = _timeUnit;
    }

    function calculateRewards(address _account) public view returns (uint256) {
        return
            ((stakers[_account].amountStaked *
                (block.timestamp - stakers[_account].lastClaimTimestamp)) /
                timeUnit) * rewardsPerHour;
    }

    function calculateClaimableReward(address _account)
        public
        view
        returns (uint256)
    {
        return stakers[_account].unclaimedRewards + calculateRewards(_account);
    }

    function getUnclaimedReward(address _account)
        public
        view
        returns (uint256)
    {
        return stakers[_account].unclaimedRewards;
    }

    function _claim(address _account) internal {
        uint256 rewardAmount = calculateClaimableReward(_account);

        require(rewardAmount > 0, "No reward available to claim");

        rewardToken.mintTokens(_account, rewardAmount);
        stakers[_account].unclaimedRewards = 0;
        stakers[_account].lastClaimTimestamp = block.timestamp;
    }

    function claim(address _account) public {
        _claim(_account);
    }

    function getAccountStakedIds(address _account)
        public
        view
        returns (uint256[] memory)
    {
        return stakers[_account].stakedIds;
    }

    function getAccountStakedIdsAtIndex(address _account, uint256 _idIndex)
        public
        view
        returns (uint256)
    {
        require(_idIndex < stakers[_account].stakedIds.length, "Invalid index");

        return stakers[_account].stakedIds[_idIndex];
    }

    function getAccountStakedItemsAmount(address _account)
        public
        view
        returns (uint256)
    {
        return stakers[_account].amountStaked;
    }

    function _stake(address _account, uint256 _id) internal systemActive {
        require(
            nftCollection.ownerOf(_id) == _account,
            "Account must be token owner"
        );

        if (stakers[_account].amountStaked > 0) {
            stakers[_account].unclaimedRewards += calculateRewards(_account);
        }

        nftCollection.transferFrom(_account, address(this), _id);

        stakerAddress[_id] = _account;
        stakers[_account].stakedIds.push(_id);
        stakers[_account].amountStaked++;
        stakers[_account].lastClaimTimestamp = block.timestamp;
    }

    function stake(uint256 _id) public {
        _stake(msg.sender, _id);
    }

    function _unstake(uint256 _id) internal {
        require(stakerAddress[_id] != address(0x0), "Token is not staked");

        address stakerAccount = stakerAddress[_id];

        stakers[stakerAccount].unclaimedRewards += calculateRewards(
            stakerAccount
        );

        for (uint256 i = 0; i < stakers[stakerAccount].stakedIds.length; i++) {
            if (stakers[stakerAccount].stakedIds[i] == _id) {
                stakers[stakerAccount].stakedIds[i] = stakers[stakerAccount]
                    .stakedIds[stakers[stakerAccount].stakedIds.length - 1];
                delete stakers[stakerAccount].stakedIds[i];
                stakers[stakerAccount].stakedIds.pop();
            }
        }

        stakers[stakerAccount].amountStaked--;
        stakerAddress[_id] = address(0x0);
        stakers[stakerAccount].lastClaimTimestamp = block.timestamp;

        nftCollection.safeTransferFrom(address(this), stakerAccount, _id, "");
    }

    function unstake(uint256 _id) public {
        require(
            stakerAddress[_id] == msg.sender,
            "Item is not staked by the caller account."
        );

        _unstake(_id);
    }
}
