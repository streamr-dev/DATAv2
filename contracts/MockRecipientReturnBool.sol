//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.6;

import "hardhat/console.sol";

contract MockRecipientReturnBool {
    uint public txCount;

    function onTokenTransfer(
        address _sender,
        uint256 _value,
        bytes calldata _data
    ) external returns (bool) {
        console.log("Received from", _sender);
        console.log("Amount", _value);
        console.log("With data", string(_data));
        txCount += 1;
        // return false if passed "err"
        bool retval = keccak256(_data) != keccak256("err");
        console.log("retval", retval);
        return retval;
    }
}
