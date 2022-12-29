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

contract ReferralSystem is Ownable {
    struct Level {
        uint256 percentage;
    }

    struct Rank {
        Level[] levels;
    }

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

    function ranksLength() public view returns (uint256) {
        return ranks.length;
    }

    function addRank() public onlyOwner {
        ranks.push(Rank(new Level[](0)));
    }

    function removeRank() public onlyOwner {
        require(ranks.length > 0, "No ranks available");

        ranks.pop();
    }

    function addLevel(uint256 _rankIndex, uint256 _percentage)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        ranks[_rankIndex].levels.push(Level(_percentage));
    }

    function editLevel(
        uint256 _rankIndex,
        uint256 _levelIndex,
        uint256 _percentage
    ) public onlyOwner isValidLevelIndex(_rankIndex, _levelIndex) {
        ranks[_rankIndex].levels[_levelIndex].percentage = _percentage;
    }

    function removeLevel(uint256 _rankIndex)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        require(ranks[_rankIndex].levels.length > 0, "No levels available");

        ranks[_rankIndex].levels.pop();
    }

    function getLevels(uint256 _rankIndex)
        public
        view
        onlyOwner
        isValidRankIndex(_rankIndex)
        returns (Level[] memory)
    {
        return ranks[_rankIndex].levels;
    }

    function setAccountRank(address _account, uint256 _rankIndex)
        public
        onlyOwner
        isValidRankIndex(_rankIndex)
    {
        accountRank[_account] = _rankIndex;
    }

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

    function hasInviter(address _account) public view returns (bool) {
        return inviter[_account] != address(0);
    }

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
