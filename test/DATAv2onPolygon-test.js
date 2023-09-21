const { utils: { hexZeroPad, parseEther } } = require("ethers")
const { expect } = require("chai")
const { ethers: hardhatEthers } = require("hardhat")

describe("DATAv2onPolygon", () => {
    it("deposit mints tokens as expected", async () => {
        const [bridge] = await hardhatEthers.getSigners()
        const targetUser = "0x1234567890123456789012345678901234567890"
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.deployed()

        expect((await token.balanceOf(targetUser)).toString()).to.equal("0")

        const amountBytes = hexZeroPad(parseEther("1"), 32)
        await expect(token.connect(bridge).deposit(targetUser, amountBytes)).to.emit(token, "Transfer(address,address,uint256)")

        expect((await token.balanceOf(targetUser)).toString()).to.equal(parseEther("1").toString())
    })

    it("only bridge is allowed to deposit", async () => {
        const [bridge, another] = await hardhatEthers.getSigners()
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.deployed()
        await expect(token.connect(another).deposit(another.address, parseEther("1").toHexString())).to.be.revertedWith("error_onlyBridge")
    })

    it("withdraw burns tokens", async () => {
        const [bridge, user] = await hardhatEthers.getSigners()
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.deployed()

        expect((await token.balanceOf(user.address)).toString()).to.equal("0")
        const amountWei = parseEther("1")
        const amountBytes = hexZeroPad(amountWei, 32)
        // await expect(token.connect(bridge).deposit(user.address, amountBytes)).to.emit(token, "Transfer(address,address,uint256,bytes)")
        await (await token.connect(bridge).deposit(user.address, amountBytes)).wait()
        expect((await token.balanceOf(user.address)).toString()).to.equal(amountWei.toString())

        await expect(token.connect(user).withdraw(parseEther("1"))).to.emit(token, "Transfer(address,address,uint256)")
            .withArgs(user.address, "0x0000000000000000000000000000000000000000", amountWei.toHexString())

        expect((await token.balanceOf(user.address)).toString()).to.equal("0")
    })
})
