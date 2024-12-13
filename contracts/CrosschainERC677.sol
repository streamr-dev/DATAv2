// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./IERC677.sol";
import "./IERC677Receiver.sol";

/**
 * Version of DATAv2 adapted from IoTeX/iotube CrosschainERC20V2
 * https://iotexscan.io/address/0x1ae24d4928a86faaacd71cf414d2b3a499adb29b#code
 */
contract CrosschainERC677 is ERC20Burnable, IERC677 {
    using SafeERC20 for ERC20;

    event MinterSet(address indexed minter);

    modifier onlyMinter() {
        require(minter == msg.sender, "not the minter");
        _;
    }

    ERC20 public coToken;
    address public minter;
    uint8 private decimals_;

    constructor(
        ERC20 _coToken,
        address _minter,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) ERC20(_name, _symbol) {
        coToken = _coToken;
        minter = _minter;
        decimals_  = _decimals;
        emit MinterSet(_minter);
    }

    function decimals() public view virtual override returns (uint8) {
        return decimals_;
    }

    function transferMintership(address _newMinter) public onlyMinter {
        minter = _newMinter;
        emit MinterSet(_newMinter);
    }

    function deposit(uint256 _amount) public {
        depositTo(msg.sender, _amount);
    }

    function depositTo(address _to, uint256 _amount) public {
        require(address(coToken) != address(0), "no co-token");
        uint256 originBalance = coToken.balanceOf(address(this));
        coToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 newBalance = coToken.balanceOf(address(this));
        require(newBalance > originBalance, "invalid balance");
        _mint(_to, newBalance - originBalance);
    }

    function withdraw(uint256 _amount) public {
        withdrawTo(msg.sender, _amount);
    }

    function withdrawTo(address _to, uint256 _amount) public {
        require(address(coToken) != address(0), "no co-token");
        require(_amount != 0, "amount is 0");
        _burn(msg.sender, _amount);
        coToken.safeTransfer(_to, _amount);
    }

    function mint(address _to, uint256 _amount) public onlyMinter returns (bool) {
        require(_amount != 0, "amount is 0");
        _mint(_to, _amount);
        return true;
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
