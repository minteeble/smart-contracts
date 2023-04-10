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

import "./MinteebleERC721.sol";

contract SubAssets is MinteebleERC721 {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) MinteebleERC721(_tokenName, _tokenSymbol, _maxSupply, _mintPrice) {}

    bool public paired = false;

    address mainCollectionAddress = address(0);

    function setPaired(bool _paired) public {
        require(_paired != paired, "Paired value already set");
        require(
            _msgSender() == mainCollectionAddress,
            "Unauthorized to edit paired state"
        );

        paired = _paired;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(IERC721, ERC721) {
        super.transferFrom(from, to, tokenId);
    }
}

contract DynamicCollection is MinteebleERC721 {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) MinteebleERC721(_tokenName, _tokenSymbol, _maxSupply, _mintPrice) {}

    bool public paired = false;
    SubAssets public subAssetsCollection;

    mapping(address => uint256[]) public subAssetsIds;

    function addSubAsset(uint256 tokenId, uint256 id) public {
        require(_msgSender() == ownerOf(tokenId), "Address is not token owner");
        require(
            _msgSender() == subAssetsCollection.ownerOf(id),
            "Address is not subAsset owner"
        );
        require(!paired, "token is paired");

        paired = true;
        subAssetsCollection.setPaired(true);

        // address assetOwner = subAssetsCollection.ownerOf(id);
    }
}
