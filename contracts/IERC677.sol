// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// adapted from LINK token https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code
// implements https://github.com/ethereum/EIPs/issues/677
interface IERC677 is IERC20 {
    function transferAndCall(
        address to,
        uint value,
        bytes calldata data
    ) external returns (bool success);

    // commented out this to generate an ABI that doesn't have the "duplicate event", to avoid ethers5 outputting the annoying
    // `Duplicate definition of Transfer (Transfer(address,address,uint256,bytes), Transfer(address,address,uint256))`
    // event Transfer(
    //     address indexed from,
    //     address indexed to,
    //     uint value,
    //     bytes data
    // );
}
