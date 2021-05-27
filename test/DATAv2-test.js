const { parseEther } = require("@ethersproject/units")
const { id } = require("@ethersproject/hash")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("DATAv2", () => {
    it("transferAndCall triggers ERC677 callback", async () => {
        const [signer] = await ethers.getSigners()

        const MockRecipient = await ethers.getContractFactory("MockRecipient")
        const recipient = await MockRecipient.deploy()
        await recipient.deployed()

        const TestToken = await ethers.getContractFactory("DATAv2")
        const token = await TestToken.deploy(signer.address) // mint tokens to signer
        await token.deployed()

        const before = await recipient.txCount()
        await token.transferAndCall(recipient.address, parseEther("1"), "0x6c6f6c")
        const after = await recipient.txCount()

        expect(after).to.equal(before.add(1))
    })

    it("transferAndCall just does normal transfer for non-contract accounts", async () => {
        const [signer] = await ethers.getSigners()
        const targetAddress = "0x0000000000000000000000000000000000000001"

        const TestToken = await ethers.getContractFactory("DATAv2")
        const token = await TestToken.deploy(signer.address)
        await token.deployed()

        const balanceBefore = await token.balanceOf(targetAddress)
        await token.transferAndCall(targetAddress, parseEther("1"), "0x6c6f6c")
        const balanceAfter = await token.balanceOf(targetAddress)

        expect(balanceAfter.sub(balanceBefore).toString()).to.equal(parseEther("1"))
    })

    it("minting uses MINTER_ROLE", async () => {
        const [signer] = await ethers.getSigners()
        const targetAddress = "0x0000000000000000000000000000000000000002"

        const TestToken = await ethers.getContractFactory("DATAv2")
        const token = await TestToken.deploy("0x0000000000000000000000000000000000000666")
        await token.deployed()

        await expect(token.mint(targetAddress, "1000")).to.be.revertedWith("Sender is not minter")
        await expect(token.grantRole(id("MINTER_ROLE"), signer.address)).to.emit(token, "RoleGranted")

        const balanceBefore = await token.balanceOf(targetAddress)
        await expect(token.mint(targetAddress, "1000")).to.emit(token, "Transfer(address,address,uint256)")
        const balanceAfter = await token.balanceOf(targetAddress)

        await expect(token.revokeRole(id("MINTER_ROLE"), signer.address)).to.emit(token, "RoleRevoked")
        await expect(token.mint(targetAddress, "1000")).to.be.revertedWith("Sender is not minter")

        expect(balanceAfter.sub(balanceBefore).toString()).to.equal("1000")
    })
})