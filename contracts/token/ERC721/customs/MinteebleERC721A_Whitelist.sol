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

import "../MinteebleERC721A.sol";
import "../../extensions/WhitelistExtension.sol";

contract MinteebleERC721A_Whitelisted is MinteebleERC721A, WhitelistExtension {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) MinteebleERC721A(_tokenName, _tokenSymbol, _maxSupply, _mintPrice) {}

    function whitelistMint(uint256 _mintAmount, bytes32[] calldata _merkleProof)
        public
        payable
        virtual
        canWhitelistMint(_mintAmount, _merkleProof)
        enoughFunds(_mintAmount)
    {
        _safeMint(_msgSender(), _mintAmount);
        totalMintedByAddress[_msgSender()] += _mintAmount;
    }
}
