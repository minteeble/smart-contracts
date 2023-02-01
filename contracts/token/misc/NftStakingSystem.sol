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

    bool public initialized;
    uint256 public initTimestamp;

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

    uint256 private rewardsPerHour = 100000;

    constructor(IERC721 _nftCollection, NftStakingERC20Token _rewardToken) {
        nftCollection = _nftCollection;
        rewardToken = _rewardToken;
        initialized = true;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier requireAdmin(address _account) {
        require(hasRole(DEFAULT_ADMIN_ROLE, _account), "Unauthorized");
        _;
    }

    modifier systemInitialized() {
        require(initialized, "System is not initialized yet");
        _;
    }

    function initializeSystem() public requireAdmin(msg.sender) {
        require(!initialized, "System already initialized");
        initTimestamp = block.timestamp;
        initialized = true;
    }

    function setRewardPerHour(uint256 _rewardsPerHour)
        public
        requireAdmin(msg.sender)
    {
        rewardsPerHour = _rewardsPerHour;
    }

    function calculateRewards(address _account) public view returns (uint256) {
        return
            ((stakers[_account].amountStaked *
                (block.timestamp - stakers[_account].lastClaimTimestamp)) /
                3600) * rewardsPerHour;
    }

    function _stake(address _account, uint256 _id) internal systemInitialized {
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

    function _unstake(uint256 _id) internal systemInitialized {}

    function unstake(uint256 _id) public {
        _unstake(_id);
    }
}
