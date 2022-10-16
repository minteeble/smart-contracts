// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

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

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract ReferralToken is Ownable {
    struct Level {
        uint256 percentage;
    }

    struct Rank {
        uint256 maxLevel;
        string rankName;
    }

    uint256 public tokenPrice = 0;
    address public walletAddress = address(0);
    address public tokenAddress = address(0);
    uint256 public allowance = 0;

    Level[] private levels;
    Rank[] private ranks;

    event ReceivedERC20Token(
        address token_address,
        address from,
        uint256 value
    );

    constructor(address _tokenAddress) {
        walletAddress = _msgSender();
        tokenAddress = _tokenAddress;
    }

    function setTokenPrice(uint256 _tokenPrice) public onlyOwner {
        tokenPrice = _tokenPrice;
    }

    function setTokenAddress(address _tokenAddress) public onlyOwner {
        tokenAddress = _tokenAddress;
    }

    function setWalletAddress(address _walletAddress) public onlyOwner {
        walletAddress = _walletAddress;
    }

    function addERC20Token(uint256 amount) external onlyOwner {
        allowance += amount;
        require(
            IERC20(tokenAddress).transferFrom(
                walletAddress,
                address(this),
                amount
            )
        );
    }

    function buyToken(uint256 _tokenAmount) public payable {
        require(msg.value >= _tokenAmount * tokenPrice, "Insufficient funds");
        require(
            IERC20(tokenAddress).transfer(msg.sender, _tokenAmount),
            "Failed to send token"
        );
    }

    /**
     *  @notice Withdraws contract balance to onwer account
     */
    function withdrawBalance() public onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success);
    }

    function getLevels() public view returns (Level[] memory) {
        return levels;
    }

    function addLevel(uint256 _percentage) public {
        levels.push(Level(_percentage));
    }

    function editLevel(uint256 _levelIndex, uint256 _percentage) public {
        require(levels.length > _levelIndex, "Level not found");

        levels[_levelIndex].percentage = _percentage;
    }

    function removeLevel() public {
        require(levels.length > 0, "No levels available");

        levels.pop();
    }

    function addRank(uint256 _maxLevel, string memory _rankName) public {
        ranks.push(Rank(_maxLevel, _rankName));
    }

    function editRank(
        uint256 _rankIndex,
        uint256 _maxLevel,
        string memory _rankName
    ) public {
        require(ranks.length > _rankIndex, "Rank not found");

        ranks[_rankIndex].maxLevel = _maxLevel;
        ranks[_rankIndex].rankName = _rankName;
    }

    function removeRank() public {
        require(ranks.length > 0, "No ranks available");

        ranks.pop();
    }
}
