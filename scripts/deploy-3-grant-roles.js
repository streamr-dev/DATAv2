const { Contract, Wallet, getDefaultProvider, utils: { id } } = require("ethers")

const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

const { KEY } = process.env

if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = getDefaultProvider()
const deployer = new Wallet(KEY, provider)
console.log("Sending tx from %s", deployer.address)

const newTokenAddress = "0x8f693ca8D21b157107184d29D398A8D082b38b76"
const adminAddress = "0xc726F659Fc9B3BC5286a584C8976F915BCad2401"

async function main() {
    const token = new Contract(newTokenAddress, DATAv2Json.abi, deployer)
    console.log("Using %s token deployed at: %s", await token.symbol(), token.address)

    const tx1 = await token.grantRole(id("MINTER_ROLE"), adminAddress)
    console.log("Follow grant minter tx: https://etherscan.io/tx/%s", tx1.hash)
    const tr1 = await tx1.wait()
    console.log("Transaction receipt: ", tr1)

    const tx2 = await token.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", adminAddress)
    console.log("Follow grant admin tx: https://etherscan.io/tx/%s", tx2.hash)
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
