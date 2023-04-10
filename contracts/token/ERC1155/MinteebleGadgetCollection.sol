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

contract MinteebleDynamicCollection is MinteebleERC1155 {
    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _uri
    ) MinteebleERC1155(_tokenName, _tokenSymbol, _uri) {}
}
