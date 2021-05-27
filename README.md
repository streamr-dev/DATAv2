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

| Feature | Associated function | File where the function is |
|---------|---------------------|-------------------|
| [ERC-677](https://github.com/ethereum/EIPs/issues/677)  | transferAndCall     | contracts/DATAv2.sol |
| [EIP-2612](https://eips.ethereum.org/EIPS/eip-2612)  | permit | @openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol |
| Minting | grantRole, revokeRole | @openzeppelin/contracts/access/AccessControl.sol |
| Minting | mint | contracts/DATAv2.sol |
| Initial minting | constructor | contracts/DATAv2.sol |
| Burning | burn, burnFrom | @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol |

## Migration process

1. We deploy the DataTokenMigrator contract
1. We deploy the DATAv2 contract
    - Pass DataTokenMigrator as argument
    - Will mint the old DATA token initial supply of DATAv2 to the DataTokenMigrator
1. We call `setTokens("0x0cf0ee63788a0849fe5297f3407f701e122cc023", DATAv2.address)` in the DataTokenMigrator
1. DATA token holders call `upgrade(amountWei)` in the old DATA contract

Result:
* Old DATA tokens are burned
* DATAv2 tokens are transferred from the DataTokenMigrator to the holders

At all times, tokens left in the DataTokenMigrator are the unmigrated old DATA tokens, and they should be equal in number to the tokenSupply of the old DATA contract