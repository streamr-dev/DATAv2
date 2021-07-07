# DATAv2 token contract

## List of files

| File                           | Description |
|--------------------------------|-------------|
|contracts/CrowdsaleToken.sol    | [The current (or "old") DATA token](https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#readContract) |
|contracts/DATAv2.sol            | The new DATA token |
|contracts/DataTokenMigrator.sol | Migrator contract that acts as UpgradeAgent for the old token |
|contracts/IERC677.sol           | Interface of ERC677 as defined in [the LINK token](https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code) |
|contracts/IERC677Receiver.sol   | Interface of ERC677Receiver also defined in [the LINK token](https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code) |
|contracts/MockRecipient.sol     | IERC677Receiver implementation for the purpose of testing |
|test/DATAv2-test.js             | DATAv2.sol tests |
|test/DataTokenMigrator-test.js  | DataTokenMigrator.sol tests |

## DATAv2 features

Some of the following features are inherited from [OpenZeppelin contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v4.0.0/contracts):

| Feature                                                   | Associated function   | File where the function is                                            |
|-----------------------------------------------------------|-----------------------|-----------------------------------------------------------------------|
| [ERC-677](https://github.com/ethereum/EIPs/issues/677)    | transferAndCall       | contracts/DATAv2.sol                                                  |
| [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612)       | permit                | @openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol  |
| Minting           | grantRole, revokeRole | @openzeppelin/contracts/access/AccessControl.sol                  |
| Minting           | mint                  | contracts/DATAv2.sol                                              |
| Burning           | burn, burnFrom        | @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol  |

## Minting

DATAv2 has an admin role (controlled by Streamr) that can add and remove minters, who can mint tokens tokens at will. The admin and minters will be contracts that are not controlled by a single wallet.

The whole old DATA supply is minted as part of migration, and new tokens may be minted later as decided by the community process in the form of [Streamr Improvement Proposals](https://snapshot.org/#/streamr.eth), see e.g. [SIP-6](https://snapshot.org/#/streamr.eth/proposal/QmU383LMPAHdzMevcxY6UzyL5vkBaNHQhCcp2WbXw5kXS1).

# ERC677 functionality

DATAv2 follows the convention of [LINK](https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code) and other tokens with regard to the callback function `onTokenTransfer` invoked by `transferAndCall`: DATAv2 does not check the bool return value of `onTokenTransfer`. Instead `onTokenTransfer` should revert if the transfer is to be rejected by the recipient contract. If the recipient is a contract, it must implement `onTokenTransfer` or else `transferAndCall` reverts.


## Migration process

1. We deploy the DATAv2 and DataTokenMigrator contracts
2. We call `grantRole(id('MINTER_ROLE'), minter.address)` on the DATAv2 contract
3. Minter calls `mint(migrator.address, tokenSupply)` on the DATAv2 contract to mint the tokens belonging to old DATA holders into the DataTokenMigrator contract
4. We call `setUpgradeAgent(migrator.address)` in the old DATA contract to start the upgrade
5. DATA token holders call `upgrade(amountWei)` in the old DATA contract

Result:
* Old DATA tokens are burned
* DATAv2 tokens are transferred from the DataTokenMigrator to the holders

At all times, DATAv2 tokens left in the DataTokenMigrator are the unmigrated DATA tokens, and they should be equal in number to the tokenSupply of the old DATA contract

## DATAv2 contract anatomy

[OpenZeppelin contracts](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/v4.0.0/contracts) were used where available to implement the features listed in the above table.

Explanations of the origins and intents of all code found in DATAv2.sol:
| Lines   | Explanation                                                 |
|---------|-------------------------------------------------------------|
| 1...12  | OpenZeppelin and interface imports, DATAv2 token properties |
| 16...46 | Adapted from @openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol to implement the minting feature. The AccessControl.sol is a bit of a can of worms when it comes to state-space: the "role admin" can set up any constellation of roles and grant those roles and their administration to anyone; its implementation is quite elegant though, so it didn't feel very significantly worse than a "brute" `mapping (address => bool) isMinter` type of implementation, especially since it's all library code. Added isMinter convenience function. |
| 48...74 | Adapted from LINK token to implement the ERC-677 token transfer hook. Recipient smart contracts can now react to DATAv2 token transfer which makes approve+transferFrom two-transaction flow avoidable if not entirely redundant. Decided to go for the simply ERC-677 instead of the ERC-777 because of some misfeatures on ERC-777 (defaultOperators, higher plain transfer gas price) as well as uncertain adoption at this stage. |
| 76...98 | Allow the admin to change token symbol and name just in case, e.g. to support token rebranding, and graceful end-of-life after the possible next migration |
