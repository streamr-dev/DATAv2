const { parseEther } = require("@ethersproject/units")
const { id } = require("@ethersproject/hash")
const { expect } = require("chai")
const { ethers } = require("hardhat")

// "err" as bytes, induces a simulated error in MockRecipient.sol and MockRecipientReturnBool.sol
const errData = "0x657272"

describe("DATAv2", () => {
    it("transferAndCall triggers ERC677 callback", async () => {
        const [signer, minter] = await ethers.getSigners()

        const MockRecipient = await ethers.getContractFactory("MockRecipient")
        const recipient = await MockRecipient.deploy()
        await recipient.deployed()

        const MockRecipientNotERC677Receiver = await ethers.getContractFactory("MockRecipientNotERC677Receiver")
        const nonReceiverRecipient = await MockRecipientNotERC677Receiver.deploy()
        await nonReceiverRecipient.deployed()

        const MockRecipientReturnBool = await ethers.getContractFactory("MockRecipientReturnBool")
        const returnBoolRecipient = await MockRecipientReturnBool.deploy()
        await returnBoolRecipient.deployed()

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.deployed()

        await expect(token.grantRole(id("MINTER_ROLE"), minter.address)).to.emit(token, "RoleGranted")
        await expect(token.connect(minter).mint(signer.address, parseEther("10"))).to.emit(token, "Transfer(address,address,uint256)")

        // revert in callback => should revert transferAndCall
        await expect(token.transferAndCall(recipient.address, parseEther("1"), errData)).to.be.reverted

        // no callback => should revert transferAndCall
        await expect(token.transferAndCall(nonReceiverRecipient.address, parseEther("1"), "0x")).to.be.reverted

        // contract that implements ERC677Receiver executes the callback
        const txsBefore = await recipient.txCount()
        await token.transferAndCall(recipient.address, parseEther("1"), "0x6c6f6c")
        const txsAfter = await recipient.txCount()

        // callback returns true or false but doesn't revert => should NOT revert
        const txsBeforeBool = await returnBoolRecipient.txCount()
        await token.transferAndCall(returnBoolRecipient.address, parseEther("1"), errData)
        await token.transferAndCall(returnBoolRecipient.address, parseEther("1"), "0x")
        const txsAfterBool = await returnBoolRecipient.txCount()

        expect(txsAfter).to.equal(txsBefore.add(1))
        expect(txsAfterBool).to.equal(txsBeforeBool.add(2))
    })

    it("transferAndCall just does normal transfer for non-contract accounts", async () => {
        const [signer, minter] = await ethers.getSigners()
        const targetAddress = "0x0000000000000000000000000000000000000001"

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.deployed()

        await expect(token.grantRole(id("MINTER_ROLE"), minter.address)).to.emit(token, "RoleGranted")
        await expect(token.connect(minter).mint(signer.address, parseEther("1"))).to.emit(token, "Transfer(address,address,uint256)")

        const balanceBefore = await token.balanceOf(targetAddress)
        await token.transferAndCall(targetAddress, parseEther("1"), "0x6c6f6c")
        const balanceAfter = await token.balanceOf(targetAddress)

        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(parseEther("1"))
    })

    it("minting uses MINTER_ROLE", async () => {
        const [signer] = await ethers.getSigners()
        const targetAddress = "0x0000000000000000000000000000000000000002"

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.deployed()

        await expect(token.mint(targetAddress, "1000")).to.be.revertedWith("Transaction signer is not a minter")
        await expect(token.grantRole(id("MINTER_ROLE"), signer.address)).to.emit(token, "RoleGranted")

        const balanceBefore = await token.balanceOf(targetAddress)
        await expect(token.mint(targetAddress, "1000")).to.emit(token, "Transfer(address,address,uint256)")
        const balanceAfter = await token.balanceOf(targetAddress)

        await expect(token.revokeRole(id("MINTER_ROLE"), signer.address)).to.emit(token, "RoleRevoked")
        await expect(token.mint(targetAddress, "1000")).to.be.revertedWith("Transaction signer is not a minter")

        expect(balanceAfter.sub(balanceBefore).toString()).to.equal("1000")
    })

    it("name and symbol can be changed by admin", async () => {
        const [, notAdmin] = await ethers.getSigners()

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.deployed()

        await expect(token.connect(notAdmin).setTokenInformation("Test token", "TEST")).to.be.revertedWith("Transaction signer is not an admin")
        await expect(token.setTokenInformation("Test token", "TEST")).to.emit(token, "UpdatedTokenInformation")

        expect(await token.name()).to.equal("Test token")
        expect(await token.symbol()).to.equal("TEST")
    })
})