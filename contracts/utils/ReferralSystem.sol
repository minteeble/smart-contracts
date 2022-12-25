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

    struct RefInfo {
        address account;
        uint256 percentage;
    }

    Level[] public levels;
    mapping(address => address) public inviter;

    event RefAction(address _from, address _to, uint256 _percentage);

    modifier isValidAccountAddress(address _account) {
        require(
            _account != address(0) && _account != address(this),
            "Invalid account"
        );
        _;
    }

    function addLevel(uint256 _percentage) public onlyOwner {
        levels.push(Level(_percentage));
    }

    function editLevel(uint256 _levelIndex, uint256 _percentage)
        public
        onlyOwner
    {
        require(levels.length > _levelIndex, "Level not found");

        levels[_levelIndex].percentage = _percentage;
    }

    function removeLevel() public onlyOwner {
        require(levels.length > 0, "No levels available");

        levels.pop();
    }

    function getLevels() public view onlyOwner returns (Level[] memory) {
        return levels;
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
    }

    function addAction(address _account)
        public
        onlyOwner
        returns (RefInfo[] memory)
    {
        require(inviter[_account] != address(0x0), "Account has not inviter");

        RefInfo[] memory refInfo = getRefInfo(_account);

        require(refInfo.length > 0, "Beh");

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
        RefInfo[] memory refInfo = new RefInfo[](levels.length);
        address currentAccount = _account;
        uint256 levelsFound = 0;

        for (levelsFound = 0; levelsFound < levels.length; levelsFound++) {
            address inviterAddr = inviter[currentAccount];

            if (inviterAddr != address(0)) {
                refInfo[levelsFound] = RefInfo(
                    inviterAddr,
                    levels[levelsFound].percentage
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
