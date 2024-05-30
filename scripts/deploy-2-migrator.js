const { ContractFactory, Wallet, getDefaultProvider } = require("ethers")

const DataTokenMigratorJson = require("../artifacts/contracts/DataTokenMigrator.sol/DataTokenMigrator.json")

const { KEY } = process.env

if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = getDefaultProvider()
const deployer = new Wallet(KEY, provider)
console.log("Deploying contracts from %s", deployer.address)

const oldTokenAddress = "0x0cf0ee63788a0849fe5297f3407f701e122cc023"
const newTokenAddress = "0x8f693ca8D21b157107184d29D398A8D082b38b76"

async function main() {

    const DataTokenMigrator = new ContractFactory(DataTokenMigratorJson.abi, DataTokenMigratorJson.bytecode, deployer)
    const migrator = await DataTokenMigrator.deploy(oldTokenAddress, newTokenAddress)
    console.log("Follow deployment: https://etherscan.io/tx/%s", migrator.deploymentTransaction().hash)

    await migrator.waitForDeployment()

    console.log("DataTokenMigrator deployed to:", await migrator.getAddress())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
