// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.14;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
// import {ReferralSystem} from "../../utils/ReferralSystem.sol";

// //  =============================================
// //   _   _  _  _  _  ___  ___  ___  ___ _    ___
// //  | \_/ || || \| ||_ _|| __|| __|| o ) |  | __|
// //  | \_/ || || \\ | | | | _| | _| | o \ |_ | _|
// //  |_| |_||_||_|\_| |_| |___||___||___/___||___|
// //
// //  Website: https://minteeble.com
// //  Email: minteeble@gmail.com
// //
// //  =============================================

// /// @title A Launchpad for Crypto-projects
// contract TokenLaunchpad is AccessControlEnumerable {
//     bytes32 public constant CRYPTO_PROJECT_ROLE =
//         keccak256("CRYPTO_PROJECT_ROLE");


//     /// @notice ReferralSystem used among the Launchpad Crypto Projects
//     ReferralSystem public referral;

//     constructor() {
//         _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

//         referral = new ReferralSystem();
//     }

//     function addProject(address _project) public onlyRole(DEFAULT_ADMIN_ROLE) {
//         _grantRole(CRYPTO_PROJECT_ROLE, _project);
//     }

//     function removeProject(address _project)
//         public
//         onlyRole(DEFAULT_ADMIN_ROLE)
//     {
//         _revokeRole(CRYPTO_PROJECT_ROLE, _project);
//     }

//     function setInvitation(address _inviter, address _invitee) public {
//         require(
//             hasRole(INVITER_ROLE, _inviter) ||
//                 hasRole(DEFAULT_ADMIN_ROLE, _inviter),
//             "Unauthorized"
//         );

//         referral.setInvitation(_inviter, _invitee);
//     }
// }
