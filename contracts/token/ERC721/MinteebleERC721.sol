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

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MinteeblePartialERC721.sol";

/**
 *  @title Minteeble ERC721 Contract
 *  @notice Minteeble base contract for ERC721 standard
 */
contract MinteebleERC721 is ERC721Enumerable, MinteeblePartialERC721 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    /**
     *  @notice MinteebleERC721 constructor
     *  @param _tokenName Token name
     *  @param _tokenName Token symbol
     */
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(_tokenName, _tokenSymbol) {
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
    }

    /**
     *  @dev Checks if caller can mint
     */
    modifier canMint(uint256 _mintAmount) {
        require(totalSupply() + _mintAmount <= maxSupply, "Max supply exceed!");
        _;
    }

    /**
     *  @inheritdoc ERC721
     */
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    /**
     *  @inheritdoc ERC721
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(_tokenId);

        // Checks if collection is revealed
        if (revealed) return preRevealUri;

        // Evaluating full URI for the specified ID
        return string.concat(_baseURI(), _tokenId.toString(), uriSuffix);
    }

    /**
     *  @notice Mints one or more items
     */
    function mint(uint256 _mintAmount)
        public
        payable
        virtual
        canMint(_mintAmount)
        enoughFunds(_mintAmount)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
    }
}
