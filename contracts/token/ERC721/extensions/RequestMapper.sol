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

/// @title IRequestMapper Interface
/// @dev This interface defines the function to retrieve an ID associated with a request hash.
interface IRequestMapper {
    /// @notice Retrieves the ID associated with a given request hash.
    /// @param _request The hash of the request to get the ID for.
    /// @return The ID associated with the provided request hash.
    function getIdByRequest(bytes32 _request) external view returns (uint256);
}

/// @title RequestMapper Contract
/// @dev This abstract contract extends ERC721 functionality and provides a way to map request hashes to unique IDs.
abstract contract RequestMapper {
    // The interface ID of the IRequestMapper interface.
    bytes4 public constant IREQUEST_MAPPER_INTERFACE_ID =
        type(IRequestMapper).interfaceId;

    // Mapping to store request hashes to their corresponding IDs.
    mapping(bytes32 => uint256) internal requestToId;

    /// @notice Retrieves the ID associated with a given request hash.
    /// @param _request The hash of the request to get the ID for.
    /// @return The ID associated with the provided request hash.
    function getIdByRequest(bytes32 _request) public view returns (uint256) {
        return requestToId[_request];
    }

    /// @notice Internal function to set a request hash and its associated ID.
    /// @dev It is important to ensure that the request is new (ID equal to zero is safe because ERC721 IDs start from 1).
    /// @param _request The hash of the request to set.
    /// @param _id The ID to associate with the provided request hash.
    function _setRequest(bytes32 _request, uint256 _id) internal {
        // Make sure request is new (ID equal to zero is safe because ERC721 IDs start from 1).
        require(requestToId[_request] == 0, "Request already set");

        // Associate the provided ID with the given request hash.
        requestToId[_request] = _id;
    }
}
