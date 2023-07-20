// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "../AccountActionTracker.sol";

contract Test_AccountActionTracker is AccountActionTracker {
    function trackActionToAccount(address _account) public {
        _trackActionToAccount(_account);
    }

    function setManualMode(bool _mode) public {
        trackingManualMode = _mode;
    }

    function setAccountEnabled(address _account, bool _enabled) public {
        _setAccountEnabled(_account, _enabled);
    }
}
