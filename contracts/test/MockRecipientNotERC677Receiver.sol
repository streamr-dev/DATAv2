// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

/** Just a blank contract that doesnt implement onTokensTransferred */
contract MockRecipientNotERC677Receiver {
    uint public x = 1;
}
