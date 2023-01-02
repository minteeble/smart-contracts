// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import {ReferralSystem, IReferralSystem} from "../../utils/ReferralSystem.sol";

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

/// @title A Launchpad for Crypto-projects
contract TokenLaunchpad is ReferralSystem {
    bytes32 public constant CRYPTO_PROJECT_ROLE =
        keccak256("CRYPTO_PROJECT_ROLE");

    constructor() {}

    modifier requireProject(address _account) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(CRYPTO_PROJECT_ROLE, msg.sender),
            "Unauthorized"
        );
        _;
    }

    function addProject(address _project) public requireAdmin(msg.sender) {
        _grantRole(CRYPTO_PROJECT_ROLE, _project);
    }

    function removeProject(address _project) public requireAdmin(msg.sender) {
        _revokeRole(CRYPTO_PROJECT_ROLE, _project);
    }

    function acceptInvitation(address _inviter) public {
        _setInvitation(_inviter, msg.sender);
    }

    function setInvitation(address _inviter, address _invitee) public override {
        _setInvitation(_inviter, _invitee);
    }

    function addAction(address _account)
        public
        override
        requireProject(msg.sender)
        returns (RefInfo[] memory)
    {
        return _addAction(_account);
    }
}
