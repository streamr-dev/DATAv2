const { ContractFactory, Wallet, getDefaultProvider } = require("ethers")

const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

const { KEY } = process.env

if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = getDefaultProvider()
const deployer = new Wallet(KEY, provider)
console.log("Deploying contracts from %s", deployer.address)

async function main() {

    const DATAv2 = new ContractFactory(DATAv2Json.abi, DATAv2Json.bytecode, deployer)
    const token = await DATAv2.deploy()
    console.log("Follow deployment: https://etherscan.io/tx/%s", token.deployTransaction.hash)

    await token.waitForDeployment()

    console.log("DATAv2 deployed to:", token.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
