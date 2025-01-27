const { parseEther, id, ZeroAddress } = require("ethers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

// "err" as bytes, induces a simulated error in MockRecipient.sol and MockRecipientReturnBool.sol
const errData = "0x657272"

describe("CrosschainERC677", () => {
    it("transferAndCall triggers ERC677 callback", async () => {
        const [signer, minter] = await ethers.getSigners()

        const MockRecipient = await ethers.getContractFactory("MockRecipient")
        const recipient = await MockRecipient.deploy()
        await recipient.waitForDeployment()
        const recipientAddress = await recipient.getAddress()

        const MockRecipientNotERC677Receiver = await ethers.getContractFactory("MockRecipientNotERC677Receiver")
        const nonReceiverRecipient = await MockRecipientNotERC677Receiver.deploy()
        await nonReceiverRecipient.waitForDeployment()
        const nonReceiverRecipientAddress = await nonReceiverRecipient.getAddress()

        const MockRecipientReturnBool = await ethers.getContractFactory("MockRecipientReturnBool")
        const returnBoolRecipient = await MockRecipientReturnBool.deploy()
        await returnBoolRecipient.waitForDeployment()
        const returnBoolRecipientAddress = await returnBoolRecipient.getAddress()

        // (ERC20 _coToken, address _minter, string memory _name, string memory _symbol, uint8 _decimals)
        const CrosschainERC677 = await ethers.getContractFactory("CrosschainERC677")
        const token = await CrosschainERC677.deploy(ZeroAddress, ZeroAddress, minter.address, "TestToken", "TEST", 18)
        await token.waitForDeployment()

        await expect(token.connect(minter).mint(signer.address, parseEther("10"))).to.emit(token, "Transfer(address,address,uint256)")

        // revert in callback => should revert transferAndCall
        await expect(token.transferAndCall(recipientAddress, parseEther("1"), errData)).to.be.reverted

        // no callback => should revert transferAndCall
        await expect(token.transferAndCall(nonReceiverRecipientAddress, parseEther("1"), "0x")).to.be.reverted

        // contract that implements ERC677Receiver executes the callback
        const txsBefore = await recipient.txCount()
        await token.transferAndCall(recipientAddress, parseEther("1"), "0x6c6f6c")
        const txsAfter = await recipient.txCount()

        // callback returns true or false but doesn't revert => should NOT revert
        const txsBeforeBool = await returnBoolRecipient.txCount()
        await token.transferAndCall(returnBoolRecipientAddress, parseEther("1"), errData)
        await token.transferAndCall(returnBoolRecipientAddress, parseEther("1"), "0x")
        const txsAfterBool = await returnBoolRecipient.txCount()

        expect(txsAfter).to.equal(txsBefore + 1n)
        expect(txsAfterBool).to.equal(txsBeforeBool + 2n)
    })

    it("transferAndCall just does normal transfer for non-contract accounts", async () => {
        const [signer, minter] = await ethers.getSigners()
        const targetAddress = "0x0000000000000000000000000000000000000001"

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.waitForDeployment()

        await expect(token.grantRole(id("MINTER_ROLE"), minter.address)).to.emit(token, "RoleGranted")
        await expect(token.connect(minter).mint(signer.address, parseEther("1"))).to.emit(token, "Transfer(address,address,uint256)")

        const balanceBefore = await token.balanceOf(targetAddress)
        await token.transferAndCall(targetAddress, parseEther("1"), "0x6c6f6c")
        const balanceAfter = await token.balanceOf(targetAddress)

        expect(balanceAfter - balanceBefore).to.equal(parseEther("1"))
    })
})
