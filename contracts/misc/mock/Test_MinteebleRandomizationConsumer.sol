// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "../MinteebleRandomizationConsumer.sol";

contract Test_MinteebleRandomizationConsumer is MinteebleRandomizationConsumer {
    constructor(address _linkAddress, address _wrapperAddress)
        MinteebleRandomizationConsumer(_linkAddress, _wrapperAddress)
    {}

    function getRandom() public returns (uint256) {
        return _getRandom();
    }
}
