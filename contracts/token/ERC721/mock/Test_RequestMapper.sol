// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "../extensions/RequestMapper.sol";

contract Test_RequestMapper is RequestMapper {
    function setRequest(bytes32 _request, uint256 _id) public {
        _setRequest(_request, _id);
    }
}
