const { parseEther } = require("@ethersproject/units")
const { formatBytes32String, toUtf8Bytes } = require("@ethersproject/strings")
const { id } = require("@ethersproject/hash")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("DATAv2", () => {
    it("transferAndCall triggers ERC677 callback", async () => {
        const [signer, minter] = await ethers.getSigners()

        const MockRecipient = await ethers.getContractFactory("MockRecipient")
        const recipient = await MockRecipient.deploy()
        await recipient.deployed()

        const MockRecipientNotERC677Receiver = await ethers.getContractFactory("MockRecipientNotERC677Receiver")
        const recipient2 = await MockRecipientNotERC677Receiver.deploy()
        await recipient2.deployed()

        const MockRecipientReturnBool = await ethers.getContractFactory("MockRecipientReturnBool")
        const recipient3 = await MockRecipientReturnBool.deploy()
        await recipient3.deployed()
        

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const token = await DATAv2.deploy()
        await token.deployed()

        await expect(token.grantRole(id("MINTER_ROLE"), minter.address)).to.emit(token, "RoleGranted")
        await expect(token.connect(minter).mint(signer.address, parseEther("10"))).to.emit(token, "Transfer(address,address,uint256)")        

        //"err" as bytes
        const errData = "0x657272"
        //revert in callback should revert transferAndCall
        await expect(token.transferAndCall(recipient.address, parseEther("1"), errData)).to.be.reverted
        //no callback should revert transferAndCall
        await expect(token.transferAndCall(recipient2.address, parseEther("1"), "0x")).to.be.reverted
 
        //call to contract that implements ERC677Receiver reverts if onTokensReceived = false
        //await expect().to.be.reverted

        //call to contract that implements ERC677Receiver calls callback
        let before = await recipient.txCount()
        await token.transferAndCall(recipient.address, parseEther("1"), "0x6c6f6c")
        let after = await recipient.txCount()
        expect(after).to.equal(before.add(1))


        before = await recipient3.txCount()

        //if callback returns true or false, shouldnt revert
        await token.transferAndCall(recipient3.address, parseEther("1"), errData)
        await token.transferAndCall(recipient3.address, parseEther("1"), "0x")

        after = await recipient3.txCount()
        expect(after).to.equal(before.add(2))
    
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