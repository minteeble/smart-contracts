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

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./MinteebleERC721A.sol";
import "../ERC1155/MinteebleGadgetsCollection.sol";

interface IMinteebleDynamicCollection is IMinteebleERC721A {
    struct ItemInfo {
        uint256[] gadgets;
    }

    function getItemInfo(uint256 _id) external view returns (ItemInfo memory);
}

contract MinteebleDynamicCollection is MinteebleERC721A {
    IMinteebleGadgetsCollection public gadgetCollection;

    struct ItemInfo {
        uint256[] gadgets;
    }

    mapping(uint256 => ItemInfo) internal itemInfo;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) MinteebleERC721A(_tokenName, _tokenSymbol, _maxSupply, _mintPrice) {}

    function setGadgetCollection(address _gadgetCollection) public onlyOwner {
        gadgetCollection = IMinteebleGadgetsCollection(_gadgetCollection);
    }

    function getItemInfo(uint256 _id) public view returns (ItemInfo memory) {
        return itemInfo[_id];
    }

    function _pairGadget(
        address _account,
        uint256 _id,
        uint256 _gadgetGroupId,
        uint256 _variationId
    ) public {
        require(ownerOf(_id) == _account, "Id not owned");

        uint256 gadgetTokenId = gadgetCollection.groupIdToTokenId(
            _gadgetGroupId,
            _variationId
        );

        require(
            gadgetCollection.balanceOf(_account, gadgetTokenId) > 0,
            "Gadget not owned"
        );

        for (uint256 i = 0; i < itemInfo[_id].gadgets.length; i++) {
            require(
                itemInfo[_id].gadgets[i] != gadgetTokenId,
                "Gadget already paired"
            );
        }

        gadgetCollection.safeTransferFrom(
            _account,
            address(this),
            gadgetTokenId,
            1,
            ""
        );

        itemInfo[_id].gadgets.push(gadgetTokenId);
    }

    function pairGadget(
        uint256 _id,
        uint256 _gadgetGroupId,
        uint256 _variationId
    ) public onlyOwner {
        _pairGadget(msg.sender, _id, _gadgetGroupId, _variationId);
    }
}
