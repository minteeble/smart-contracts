// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import {ReferralSystem} from "./ReferralSystem.sol";

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

abstract contract ReferralSystemConsumer {
    address public referral;

    constructor() {
        referral = address(0x0);
    }

    modifier referralSet() {
        require(referral != address(0x0), "Referral is not set");
        _;
    }

    function _setReferral(address _referralAddress) internal {
        referral = _referralAddress;
    }

    function _executeReferralAction(
        uint256 _balanceToRedistribute,
        address _account
    ) internal referralSet returns (uint256 usedBalance) {
        ReferralSystem.RefInfo[] memory refInfo = ReferralSystem(referral)
            .addAction(_account);

        return _redistributeReferralBalance(_balanceToRedistribute, refInfo);
    }

    function _redistributeReferralBalance(
        uint256 _balanceToRedistribute,
        ReferralSystem.RefInfo[] memory _refInfo
    ) internal referralSet returns (uint256 usedBalance) {
        uint256 totalRefValue = 0;

        for (uint256 i = 0; i < _refInfo.length; i++) {
            uint256 currentValue = (_balanceToRedistribute / 100) *
                _refInfo[i].percentage;
            (bool success, ) = payable(_refInfo[i].account).call{
                value: currentValue
            }("");
            require(success);
            totalRefValue += currentValue;
        }

        return totalRefValue;
    }
}
