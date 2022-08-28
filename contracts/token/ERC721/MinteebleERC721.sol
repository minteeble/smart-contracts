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

/**
 *  @title Minteeble ERC721 Contract
 *  @notice Minteeble base contract for ERC721 standard
 */
contract MinteebleERC721 is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;

    uint256 public maxSupply;
    uint256 public mintPrice;

    string public baseUri = "";
    string public uriSuffix = ".json";
    string public preRevealUri = "";

    bool public revealed = false;

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

    /* --- Modifiers --- */

    /**
     *  @dev Checks if caller can mint
     */
    modifier canMint(uint256 _mintAmount) {
        require(totalSupply() + _mintAmount <= maxSupply, "Max supply exceed!");
        _;
    }

    /**
     *  @dev Checks if caller provided enough funds for minting
     */
    modifier enoughFunds(uint256 _mintAmount) {
        require(msg.value >= _mintAmount * mintPrice, "Insufficient funds!");
        _;
    }

    /* --- Functions --- */

    /**
     *  @inheritdoc ERC721
     */
    function _baseURI() internal view override returns (string memory) {
        return baseUri;
    }

    /**
     *  @inheritdoc ERC721
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        // Checks if collection is revealed
        if (revealed) return preRevealUri;

        // Evaluating full URI for the specified ID
        return string.concat(_baseURI(), tokenId.toString(), uriSuffix);
    }

    /**
     *  @notice Sets new base URI
     *  @param _baseUri New base URI to be set
     */
    function setBaseUri(string memory _baseUri) public onlyOwner {
        baseUri = _baseUri;
    }

    /**
     *  @notice Sets new URI suffix
     *  @param _uriSuffix New URI suffix to be set
     */
    function setUriSuffix(string memory _uriSuffix) public onlyOwner {
        uriSuffix = _uriSuffix;
    }

    /**
     *  @notice Reveals (or unreveals) the collection
     *  @param _revealed New revealed value to be set. True if revealed, false otherwise
     */
    function setRevealed(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }

    /**
     *  @notice Sets new pre-reveal URI
     *  @param _preRevealUri New pre-reveal URI to be used
     */
    function setPreRevealUri(string memory _preRevealUri) public onlyOwner {
        preRevealUri = _preRevealUri;
    }

    /**
     *  @notice Allows owner to set a new mint price
     *  @param _mintPrice New mint price to be set
     */
    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    /**
     *  @notice Mints one or more items
     */
    function mint(uint256 _mintAmount)
        public
        payable
        canMint(_mintAmount)
        enoughFunds(_mintAmount)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _safeMint(msg.sender, newItemId);
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
}
