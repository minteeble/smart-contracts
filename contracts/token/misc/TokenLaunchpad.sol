// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import {ReferralSystem, IReferralSystem} from "./ReferralSystem.sol";

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

    modifier requireProject(address _account) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(CRYPTO_PROJECT_ROLE, msg.sender),
            "Unauthorized"
        );
        _;
    }

    /// @notice Adds a new project
    /// @param _project Project address to be added
    function addProject(address _project) public requireAdmin(msg.sender) {
        _grantRole(CRYPTO_PROJECT_ROLE, _project);
    }

    /// @notice Removes an existing project
    /// @param _project Project address to be removed
    function removeProject(address _project) public requireAdmin(msg.sender) {
        require(
            hasRole(CRYPTO_PROJECT_ROLE, _project),
            "Invalid project address"
        );

        _revokeRole(CRYPTO_PROJECT_ROLE, _project);
    }

    /// @notice Gets the number of existing projects inside the Launchpad
    /// @return The number of crypto projects
    function projectsNum() public view returns (uint256) {
        return getRoleMemberCount(CRYPTO_PROJECT_ROLE);
    }

    /// @notice Gets the project by specifying its index
    /// @param _index Project Index inside the Launchpad
    /// @return The project address
    function projectAtIndex(uint256 _index) public view returns (address) {
        return getRoleMember(CRYPTO_PROJECT_ROLE, _index);
    }

    /// @notice Accepts the invitation from the inviter, so the transaction sender will be registered as invited from inviter address
    function acceptInvitation(address _inviter) public {
        _setInvitation(_inviter, msg.sender);
    }

    function setInvitation(address _inviter, address _invitee) public override {
        require(
            hasRole(CRYPTO_PROJECT_ROLE, msg.sender) ||
                hasRole(INVITER_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            ""
        );

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
