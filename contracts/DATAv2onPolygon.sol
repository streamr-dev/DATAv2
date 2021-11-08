// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "./DATAv2.sol";

/**
 * Version of DATAv2 that fulfills the requirements in https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/mapping-assets/
 */
contract DATAv2onPolygon is DATAv2 {
    address public bridgeAddress;

    constructor(address initialBridgeAddress) DATAv2() {
        setBridgeAddress(initialBridgeAddress);
    }

    ///@dev docs say: being proxified smart contract, most probably bridge addreess is not going to change ever, but... just in case
    function setBridgeAddress(address newBridgeAddress) public onlyAdmin {
        bridgeAddress = newBridgeAddress;
    }

    /**
     * When tokens are bridged from mainnet, perform a "mind-and-call" to activate
     *   the receiving contract's ERC677 onTokenTransfer callback
     * Equal amount of tokens got locked in RootChainManager on the mainnet side
     */
    function deposit(address user, bytes calldata depositData) external {
        require(_msgSender() == bridgeAddress, "error_onlyBridge");
        uint256 amount = abi.decode(depositData, (uint256));

        // emits two Transfer events: 0x0 -> bridgeAddress -> user
        _mint(bridgeAddress, amount);
        transferAndCall(user, amount, depositData);
    }

    /**
     * When returning to mainnet, it's enough to simply burn the tokens on the Polygon side
     */
    function withdraw(uint256 amount) external {
        _burn(_msgSender(), amount);
    }
}