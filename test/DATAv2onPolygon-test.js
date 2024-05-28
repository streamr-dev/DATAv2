const { zeroPadValue, parseEther } = require("ethers")
const { expect } = require("chai")
const { ethers: hardhatEthers } = require("hardhat")

describe("DATAv2onPolygon", () => {
    it("deposit mints tokens as expected", async () => {
        const [bridge] = await hardhatEthers.getSigners()
        const targetUser = "0x1234567890123456789012345678901234567890"
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.waitForDeployment()

        expect((await token.balanceOf(targetUser)).toString()).to.equal("0")

        const amountBytes = zeroPadValue("0x" + parseEther("10").toString(16), 32)
        await expect(token.connect(bridge).deposit(targetUser, amountBytes)).to.emit(token, "Transfer(address,address,uint256)")

        expect((await token.balanceOf(targetUser)).toString()).to.equal(parseEther("10").toString())
    })

    it("only bridge is allowed to deposit", async () => {
        const [bridge, another] = await hardhatEthers.getSigners()
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.waitForDeployment()
        const amountBytes = zeroPadValue("0x" + parseEther("10").toString(16), 32)
        await expect(token.connect(another).deposit(another.address, amountBytes)).to.be.revertedWith("error_onlyBridge")
    })

    it("withdraw burns tokens", async () => {
        const [bridge, user] = await hardhatEthers.getSigners()
        const DATAv2onPolygon = await hardhatEthers.getContractFactory("DATAv2onPolygon")
        const token = await DATAv2onPolygon.deploy(bridge.address)
        await token.waitForDeployment()

        expect((await token.balanceOf(user.address)).toString()).to.equal("0")
        const amountWei = parseEther("10")
        const amountBytes = zeroPadValue("0x" + amountWei.toString(16), 32)
        await expect(token.connect(bridge).deposit(user.address, amountBytes)).to.emit(token, "Transfer(address,address,uint256,bytes)")
        expect((await token.balanceOf(user.address)).toString()).to.equal(amountWei.toString())

        await expect(token.connect(user).withdraw(amountWei)).to.emit(token, "Transfer(address,address,uint256)")
            .withArgs(user.address, "0x0000000000000000000000000000000000000000", amountWei)

        expect((await token.balanceOf(user.address)).toString()).to.equal("0")
    })
})
