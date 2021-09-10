const { ContractFactory, Wallet, providers: { JsonRpcProvider }, utils: { id } } = require("ethers")

const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

const { KEY } = process.env

if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = new JsonRpcProvider("https://bsc-dataseed.binance.org/")
const deployer = new Wallet(KEY, provider)
console.log("Deploying contracts from %s", deployer.address)

const adminAddress = "0x42355e7dc0A872C465bE9DE4AcAAAcB5709Ce813"

async function main() {

    const DATAv2 = new ContractFactory(DATAv2Json.abi, DATAv2Json.bytecode, deployer)
    const token = await DATAv2.deploy()
    console.log("Follow deployment: https://bscscan.com/tx/%s", token.deployTransaction.hash)

    await token.deployed()
    console.log("DATAv2 deployed to:", token.address)

    const tx1 = await token.grantRole(id("MINTER_ROLE"), adminAddress)
    console.log("Follow grant minter tx: https://bscscan.com/tx/%s", tx1.hash)
    const tr1 = await tx1.wait()
    console.log("Transaction receipt: ", tr1)

    const tx2 = await token.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", adminAddress)
    console.log("Follow grant admin tx: https://bscscan.com/tx/%s", tx2.hash)
    const tr2 = await tx2.wait()
    console.log("Transaction receipt: ", tr2)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
