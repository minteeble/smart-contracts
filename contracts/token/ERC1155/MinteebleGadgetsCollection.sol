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

import "./MinteebleERC1155.sol";

interface IMinteebleGadgetsCollection is IMinteebleERC1155 {
    function getGadgetGroups() external returns (uint256);

    function getVariationsPerGroup() external returns (uint256);

    function tokenIdToGroupId(
        uint256 _id
    ) external view returns (uint256, uint256);

    function groupIdToTokenId(
        uint256 _groupId,
        uint256 _variationId
    ) external view returns (uint256);
}

contract MinteebleGadgetsCollection is MinteebleERC1155 {
    uint256 internal gadgetGroups;
    uint256 internal variationsPerGroup;

    mapping(uint256 => uint256) public gadgetVariations;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _uri
    ) MinteebleERC1155(_tokenName, _tokenSymbol, _uri) {
        gadgetGroups = 0;
        variationsPerGroup = 32;
    }

    function _addGadgetGroup() internal {
        gadgetGroups++;
    }

    function tokenIdToGroupId(
        uint256 _id
    ) public view returns (uint256, uint256) {
        return (_id / variationsPerGroup, _id % variationsPerGroup);
    }

    function groupIdToTokenId(
        uint256 _groupId,
        uint256 _variationId
    ) public view returns (uint256) {
        return _groupId * variationsPerGroup + _variationId;
    }

    function _addVariation(uint256 _groupId) internal {
        require(_groupId < gadgetGroups, "Invalid gadget Id");

        require(
            gadgetVariations[_groupId] < variationsPerGroup,
            "No available variations"
        );

        _addId(_groupId * variationsPerGroup + gadgetVariations[_groupId]);
        gadgetVariations[_groupId]++;
    }
}
