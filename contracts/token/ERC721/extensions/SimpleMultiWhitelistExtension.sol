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

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

interface ISimpleMultiWhitelistExtension {}

abstract contract SimpleMultiWhitelistExtension is
    ISimpleMultiWhitelistExtension
{
    struct WhitelistGroup {
        bool enabled;
        bytes32 merkleRoot;
        mapping(address => bool) used;
    }

    mapping(uint256 => WhitelistGroup) public whitelistGroups;
    uint256[] public activeWhitelistGroups;

    modifier canWhitelistMint(
        uint256 _groupId,
        bytes32[] calldata _merkleProof
    ) {
        require(
            whitelistGroups[_groupId].enabled,
            "The whitelist sale is not enabled for this group!"
        );

        require(
            !whitelistGroups[_groupId].used[msg.sender],
            "Exceeded maximum total amount per address!"
        );

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(
                _merkleProof,
                whitelistGroups[_groupId].merkleRoot,
                leaf
            ),
            "Invalid proof!"
        );
        _;
    }

    function _createWhitelistGroup(uint256 _groupId, bytes32 _merkleRoot)
        internal
    {
        require(
            !whitelistGroups[_groupId].enabled,
            "Group with the same ID already exists!"
        );

        whitelistGroups[_groupId].enabled = true;
        whitelistGroups[_groupId].merkleRoot = _merkleRoot;

        activeWhitelistGroups.push(_groupId);
    }

    function switchWhitelistGroup(uint256 _groupId) internal {
        require(
            whitelistGroups[_groupId].enabled,
            "Group with the given ID does not exist or is not enabled!"
        );

        // Rimuovi il gruppo dalla lista dei gruppi attivi se già presente
        for (uint256 i = 0; i < activeWhitelistGroups.length; i++) {
            if (activeWhitelistGroups[i] == _groupId) {
                activeWhitelistGroups[i] = activeWhitelistGroups[
                    activeWhitelistGroups.length - 1
                ];
                activeWhitelistGroups.pop();
                break;
            }
        }

        activeWhitelistGroups.push(_groupId);
    }

    function disableWhitelistGroup(uint256 _groupId) internal {
        require(
            whitelistGroups[_groupId].enabled,
            "Group with the given ID does not exist or is not enabled!"
        );

        whitelistGroups[_groupId].enabled = false;

        // Rimuovi il gruppo dalla lista dei gruppi attivi se presente
        for (uint256 i = 0; i < activeWhitelistGroups.length; i++) {
            if (activeWhitelistGroups[i] == _groupId) {
                activeWhitelistGroups[i] = activeWhitelistGroups[
                    activeWhitelistGroups.length - 1
                ];
                activeWhitelistGroups.pop();
                break;
            }
        }
    }

    function _setWhitelistMintEnabled(bool _state) internal {
        for (uint256 i = 0; i < activeWhitelistGroups.length; i++) {
            whitelistGroups[activeWhitelistGroups[i]].enabled = _state;
        }
    }

    function _setMerkleRoot(uint256 _groupId, bytes32 _merkleRoot) internal {
        whitelistGroups[_groupId].merkleRoot = _merkleRoot;
    }

    function _consumeWhitelist(uint256 _groupId, address _account) internal {
        whitelistGroups[_groupId].used[_account] = true;
    }
}
