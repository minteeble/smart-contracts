// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

/// @title Account Action Tracker Contract
/// @notice This contract allows tracking actions performed by specific accounts.
/// @dev This is an abstract contract, meaning it cannot be deployed directly. It serves as a base contract
/// for other contracts to inherit from, providing functionalities for tracking actions of specific accounts.

abstract contract AccountActionTracker {
    /// @dev Struct to store information about an account.
    struct AccountInfo {
        uint256 actions; // Number of actions performed by the account.
        bool enabled; // Flag indicating whether tracking is enabled for the account.
        mapping(uint256 => uint256) actionsBySignal;
    }

    /// @dev Flag indicating whether tracking is in manual mode.
    bool public trackingManualMode = true;

    /// @dev Mapping to store AccountInfo for each account address.
    mapping(address => AccountInfo) public accountInfo;

    /// @notice Checks if tracking is enabled for the specified account.
    /// @param _account The address of the account to check.
    /// @return true if tracking is enabled for the account, false otherwise.
    function isTrackedAccountEnabled(address _account)
        public
        view
        returns (bool)
    {
        return !trackingManualMode || accountInfo[_account].enabled;
    }

    /// @notice Gets number of actions by accoutn and signal ID
    /// @param _account The address of the account to check.
    /// @param _signalId ID of the signal to read
    function getTrackedActionsBySignal(address _account, uint256 _signalId)
        public
        view
        returns (uint256)
    {
        return accountInfo[_account].actionsBySignal[_signalId];
    }

    /// @dev Internal function to track an action performed by an account.
    /// @param _account The address of the account to track the action for.
    /// @param _signalId Id of the signal to track saction into
    function _trackActionToAccount(address _account, uint256 _signalId)
        internal
    {
        require(
            isTrackedAccountEnabled(_account),
            "Tracked account is not enabled"
        );
        accountInfo[_account].actions += 1;
        accountInfo[_account].actionsBySignal[_signalId] += 1;
    }

    /// @dev Internal function to reset an account's tracked actions and disable tracking for the account.
    /// @param _account The address of the account to reset.
    function _resetAccount(address _account) internal {
        accountInfo[_account].actions = 0;
        accountInfo[_account].enabled = false;
    }

    /// @dev Internal function to enable or disable tracking for a specific account.
    /// @param _account The address of the account to enable or disable tracking for.
    /// @param _enabled Boolean indicating whether tracking should be enabled (true) or disabled (false) for the account.
    function _setAccountEnabled(address _account, bool _enabled) internal {
        accountInfo[_account].enabled = _enabled;
    }
}
