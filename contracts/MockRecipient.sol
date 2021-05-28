//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./IERC677Receiver.sol";

contract MockRecipient is IERC677Receiver {
    uint public txCount;

    function onTokenTransfer(
        address _sender,
        uint256 _value,
        bytes calldata _data
    ) external override {
        console.log("Received from", _sender);
        console.log("Amount", _value);
        console.log("With data", string(_data));
        txCount += 1;
    }
}
