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
    bool public trackingMode;

    modifier isValidAccountAddress(address _account) {
        require(
            _account != address(0) && _account != address(this),
            "Invalid account"
        );
        _;
    }

    function setTrackingModeEnabled(bool _state) public onlyOwner {
        trackingMode = _state;
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
            _inviter != _invitee,
            "Inviter and invitee are the same address"
        );
        inviter[_invitee] = _inviter;
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

        for (uint256 levelIndex = 0; levelIndex < levels.length; ++levelIndex) {
            address inviterAddr = inviter[currentAccount];

            if (inviterAddr != address(0)) {
                refInfo[levelIndex] = RefInfo(
                    inviterAddr,
                    levels[levelIndex].percentage
                );
            } else {
                levelsFound = levelIndex;
                break;
            }
        }

        RefInfo[] memory refInfoFound = new RefInfo[](levelsFound);

        for (uint256 levelIndex = 0; levelIndex < levelsFound; ++levelIndex) {
            refInfoFound[levelIndex] = refInfo[levelIndex];
        }

        return refInfo;
    }

    // function getRefList(address _account) public returns(address[])
}

/**


  levels => 15 10 5

  getInviterAccount(address)



 */
