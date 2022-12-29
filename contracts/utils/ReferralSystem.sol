// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";

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

/// @title A multi-level referral system contract
/// @notice The ReferralSystem contract can handle a multi-level scenario.
/// Each level is characterized by a percentage. Also it is possible to create multiple ranks, each of
/// which with a different levels structure.
/// @dev The contract is meant to be used inside another contract (owner)
contract ReferralSystem is Ownable {
    /// @dev Struct representing a Level
    struct Level {
        uint256 percentage;
    }

    /// @dev Struct representing a Rank
    struct Rank {
        Level[] levels;
    }

    /// @dev Struct representing a RefInfo, so a model used when asking info
    /// for a specific acount referral hierarchy
    struct RefInfo {
        address account;
        uint256 percentage;
    }

    mapping(address => address) public inviter;
    mapping(address => uint256) public accountRank;
    Rank[] internal ranks;

    event RefAction(address _from, address indexed _to, uint256 _percentage);

    modifier isValidAccountAddress(address _account) {
        require(
            _account != address(0) && _account != address(this),
            "Invalid account"
        );
        _;
    }

    modifier isValidRankIndex(uint256 _rankIndex) {
        require(_rankIndex < ranks.length, "Invalid rank index");
        _;
    }

    modifier isValidLevelIndex(uint256 _rankIndex, uint256 _levelIndex) {
        require(_rankIndex < ranks.length, "Invalid rank index");
        require(
            _levelIndex < ranks[_rankIndex].levels.length,
            "Invalid level index"
        );
        _;
    }

    /// @notice Gets the number of available ranks
    /// @return Number of available ranks inside the system
    function ranksLength() public view returns (uint256) {
        return ranks.length;
    }

    /// @notice Adds a new empty rank
    function addRank() public onlyOwner {
        ranks.push(Rank(new Level[](0)));
    }

    /// @notice Removes the last rank
    function removeRank() public onlyOwner {
        require(ranks.length > 0, "No ranks available");

        // Remove rank from top
        ranks.pop();
    }

    /// @notice Adds a new level for the specified rank
    /// @param _rankIndex Index of the rank to add the level to
    /// @param _percentage Referral percentage of the level to be created
    function addLevel(uint256 _rankIndex, uint256 _percentage)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        ranks[_rankIndex].levels.push(Level(_percentage));
    }

    /// @notice Edits the percentage of an existing level
    /// @param _rankIndex Index of the rank to be edited
    /// @param _levelIndex Index of the level to be edited
    /// @param _percentage New level percentage
    function editLevel(
        uint256 _rankIndex,
        uint256 _levelIndex,
        uint256 _percentage
    ) public onlyOwner isValidLevelIndex(_rankIndex, _levelIndex) {
        ranks[_rankIndex].levels[_levelIndex].percentage = _percentage;
    }

    /// @notice Removes the last level of the specified Rank
    /// @param _rankIndex Index of the rank to be removed
    function removeLevel(uint256 _rankIndex)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        require(ranks[_rankIndex].levels.length > 0, "No levels available");

        ranks[_rankIndex].levels.pop();
    }

    /// @notice Gets the levels belonging to the specified Rank
    /// @param _rankIndex Index of the rank to get levels from
    /// @return List of levels
    function getLevels(uint256 _rankIndex)
        public
        view
        onlyOwner
        isValidRankIndex(_rankIndex)
        returns (Level[] memory)
    {
        return ranks[_rankIndex].levels;
    }

    /// @notice Method to manually set the account rank
    /// @param _account Account address
    /// @param _rankIndex Index of the rank to be set
    function setAccountRank(address _account, uint256 _rankIndex)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        accountRank[_account] = _rankIndex;
    }

    /// @notice Creates the invitation (relationship) between inviter and invitee.
    /// The invitee inherits the inviter's rank
    /// @param _inviter Inviter address
    /// @param _invitee Invitee address
    function setInvitation(address _inviter, address _invitee)
        public
        onlyOwner
        isValidAccountAddress(_inviter)
        isValidAccountAddress(_invitee)
    {
        require(
            inviter[_invitee] == address(0x0),
            "Invitee has already an inviter"
        );
        require(
            _inviter != _invitee,
            "Inviter and invitee are the same address"
        );

        inviter[_invitee] = _inviter;
        accountRank[_invitee] = accountRank[_inviter];
    }

    /// @notice Adds a new referral action into the system
    /// @dev Emits the events for each account above the one provided
    /// @param _account Account address that is committing the action
    /// @return The list of referral info for all the accounts above the one provided
    function addAction(address _account)
        public
        onlyOwner
        returns (RefInfo[] memory)
    {
        require(inviter[_account] != address(0x0), "Account has not inviter");

        RefInfo[] memory refInfo = getRefInfo(_account);

        for (uint256 i = 0; i < refInfo.length; i++) {
            emit RefAction(_account, refInfo[i].account, refInfo[i].percentage);
        }

        return refInfo;
    }

    /// @notice Checks if the specified address has an inviter or not
    /// @param _account Account address to be checked
    /// @return True if account has inviter, false otherwise
    function hasInviter(address _account) public view returns (bool) {
        return inviter[_account] != address(0);
    }

    /// @notice Gets the list of Referral actions
    /// @param _account Account to read info from
    /// @return List of referral actions, so the information about the
    /// levels and percentages above the current account
    function getRefInfo(address _account)
        public
        view
        returns (RefInfo[] memory)
    {
        uint256 rankIndex = accountRank[_account];

        RefInfo[] memory refInfo = new RefInfo[](
            ranks[rankIndex].levels.length
        );
        address currentAccount = _account;
        uint256 levelsFound = 0;

        for (
            levelsFound = 0;
            levelsFound < ranks[rankIndex].levels.length;
            levelsFound++
        ) {
            address inviterAddr = inviter[currentAccount];

            if (inviterAddr != address(0)) {
                refInfo[levelsFound] = RefInfo(
                    inviterAddr,
                    ranks[rankIndex].levels[levelsFound].percentage
                );
                currentAccount = inviterAddr;
            } else {
                break;
            }
        }

        RefInfo[] memory refInfoFound = new RefInfo[](levelsFound);

        for (
            uint256 levelIndex = 0;
            levelIndex < refInfoFound.length;
            ++levelIndex
        ) {
            refInfoFound[levelIndex] = refInfo[levelIndex];
        }

        return refInfoFound;
    }
}
