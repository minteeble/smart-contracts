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

    constructor(IERC721 _nftCollection, NftStakingERC20Token _rewardToken) {
        nftCollection = _nftCollection;
        rewardToken = _rewardToken;
        initialized = false;

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
        initialized = true;
    }

    function _stake(address _account, uint256 _id) internal systemInitialized {}

    function stake(uint256 _id) public {
        _stake(msg.sender, _id);
    }

    function _unstake(uint256 _id) internal systemInitialized {}

    function unstake(uint256 _id) public {
        _unstake(_id);
    }
}
