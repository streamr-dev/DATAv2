// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./IERC677.sol";
import "./IERC677Receiver.sol";

contract DATAv2 is ERC20Permit, ERC20Burnable, AccessControl, IERC677 {
	string constant NAME = "Streamr";
	string constant SYMBOL = "DATA";

	// ------------------------------------------------------------------------
	// Immediately mint the initial supply belonging to the old DATA token holders
	// This makes the DATAv2.totalSupply() correctly reflect the amount of DATA tokens that can be migrated from the old contract
	// See totalSupply at https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#readContract
	uint constant INITIAL_SUPPLY = 987154514 ether;

	// ------------------------------------------------------------------------
	// adapted from @openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol
	bytes32 constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(
		address migrationContract
	) ERC20(NAME, SYMBOL) ERC20Permit(NAME) {
		// make contract deployer the role admin that can later grant minter role
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _mint(migrationContract, INITIAL_SUPPLY);
    }

    /**
     * @dev Creates `amount` new tokens for `to`.
     *
     * See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(
		address to,
		uint256 amount
	) public {
        require(hasRole(MINTER_ROLE, _msgSender()), "Sender is not minter");
        _mint(to, amount);
    }

	// ------------------------------------------------------------------------
	// adapted from LINK token, see https://etherscan.io/address/0x514910771af9ca656af840dff83e8264ecf986ca#code
	// implements https://github.com/ethereum/EIPs/issues/677
	/**
	 * @dev transfer token to a contract address with additional data if the recipient is a contact.
	 * @param _to The address to transfer to.
	 * @param _value The amount to be transferred.
	 * @param _data The extra data to be passed to the receiving contract.
	 */
	function transferAndCall(
		address _to,
		uint256 _value,
		bytes calldata _data
	) public override returns (bool success) {
		super.transfer(_to, _value);
		emit Transfer(_msgSender(), _to, _value, _data);

		uint256 recipientCodeSize;
		assembly {
			recipientCodeSize := extcodesize(_to)
		}
		if (recipientCodeSize > 0) {
			IERC677Receiver receiver = IERC677Receiver(_to);
			receiver.onTokenTransfer(_msgSender(), _value, _data);
		}
		return true;
	}
}
