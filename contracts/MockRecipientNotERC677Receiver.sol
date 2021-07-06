//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.6;

import "hardhat/console.sol";
import "./IERC677Receiver.sol";

/**
just a blank contract that doesnt implement onTokensTransferred
 */
contract MockRecipientNotERC677Receiver {
    uint public x = 1;
}