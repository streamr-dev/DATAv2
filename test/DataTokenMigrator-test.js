const { parseEther, id } = require("ethers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("DataTokenMigrator", () => {
    it("hands out the new tokens in the upgrade", async function() {
        this.timeout(100000)
        const [signer, hodler, minter] = await ethers.getSigners()

        // Current DATA token supply
        // See totalSupply at https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#readContract
        const oldSupply = parseEther("987154514")

        // Set up the old token into a valid upgrade state by simulating the crowdsale: hodler gets all, then token is released
        const CrowdsaleToken = await ethers.getContractFactory("CrowdsaleToken")
        const oldToken = await CrowdsaleToken.deploy("Streamr DATAcoin", "DATA", 0, 18, true)
        await oldToken.waitForDeployment()
        const oldTokenAddress = await oldToken.getAddress()
        await oldToken.setReleaseAgent(signer.address)
        await oldToken.setMintAgent(signer.address, true)
        await oldToken.mint(hodler.address, oldSupply)
        expect(await oldToken.getUpgradeState()).to.equal(1n) // NotAllowed
        await oldToken.releaseTokenTransfer()
        expect(await oldToken.getUpgradeState()).to.equal(2n) // WaitingForAgent

        // WaitingForAgent is also the current pre-migration state of the DATA token in mainnet,
        // verify that getUpgradeState=2 at https://etherscan.io/address/0x0cf0ee63788a0849fe5297f3407f701e122cc023#readContract

        // Migration process step 1: Deploy the contracts
        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const newToken = await DATAv2.deploy()
        await newToken.waitForDeployment()
        const newTokenAddress = await newToken.getAddress()
        const DataTokenMigrator = await ethers.getContractFactory("DataTokenMigrator")
        const migrator = await DataTokenMigrator.deploy(oldTokenAddress, newTokenAddress)
        await migrator.waitForDeployment()
        const migratorAddress = await migrator.getAddress()

        // Step 2: Create/enable the minter
        await expect(newToken.grantRole(id("MINTER_ROLE"), minter.address)).to.emit(newToken, "RoleGranted")

        // Step 3: Mint the tokens belonging to old DATA holders into the DataTokenMigrator contract
        await expect(newToken.connect(minter).mint(migratorAddress, oldSupply)).to.emit(newToken, "Transfer(address,address,uint256)")

        // Step 4: Set the migrator as the upgrade agent in the DATA token contract to start the upgrade
        await expect(oldToken.setUpgradeAgent(migratorAddress)).to.emit(oldToken, "UpgradeAgentSet")
        expect(await oldToken.getUpgradeState()).to.equal(3) // ReadyToUpgrade

        // Step 5: Hodler upgrades some tokens
        const oldTokensBefore = await oldToken.balanceOf(hodler.address)
        const newTokensBefore = await newToken.balanceOf(hodler.address)
        await expect(oldToken.connect(hodler).upgrade(parseEther("1"))).to.emit(oldToken, "Upgrade")
        await expect(oldToken.connect(hodler).upgrade(parseEther("20"))).to.emit(oldToken, "Upgrade")
        await expect(oldToken.connect(hodler).upgrade(parseEther("300"))).to.emit(oldToken, "Upgrade")
        const oldTokensAfter = await oldToken.balanceOf(hodler.address)
        const newTokensAfter = await newToken.balanceOf(hodler.address)

        // Old token is in "Upgrading" state and new tokens were dispensed correctly
        expect(await oldToken.getUpgradeState()).to.equal(4) // Upgrading
        expect(newTokensAfter - newTokensBefore).to.equal(parseEther("321"))
        expect(oldTokensBefore - oldTokensAfter).to.equal(parseEther("321"))

        // this invariant should hold at all times
        expect(await oldToken.totalSupply()).to.equal(await newToken.balanceOf(migratorAddress))
    })

    it("can't be called by the others than the old token contract", async () => {
        const [signer] = await ethers.getSigners()

        const DATAv2 = await ethers.getContractFactory("DATAv2")
        const newToken = await DATAv2.deploy()
        await newToken.waitForDeployment()
        const newTokenAddress = await newToken.getAddress()
        const DataTokenMigrator = await ethers.getContractFactory("DataTokenMigrator")
        const migrator = await DataTokenMigrator.deploy(newTokenAddress, newTokenAddress)
        await migrator.waitForDeployment()

        await expect(migrator.upgradeFrom(signer.address, parseEther("1"))).to.be.revertedWith("Call not permitted, UpgradableToken only")
    })
})
