const { Contract, Wallet, getDefaultProvider, utils: { formatEther } } = require("ethers")

const OldTokenJson = require("../artifacts/contracts/CrowdsaleToken.sol/CrowdsaleToken.json")
const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

const { KEY } = process.env

if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = getDefaultProvider()
const hodler = new Wallet(KEY, provider)
console.log("Sending tx from %s", hodler.address)

const oldTokenAddress = "0x0cf0ee63788a0849fe5297f3407f701e122cc023"
const newTokenAddress = "0x8f693ca8D21b157107184d29D398A8D082b38b76"

async function main() {
    const oldToken = new Contract(oldTokenAddress, OldTokenJson.abi, hodler)
    console.log("Using old %s token deployed at: %s", await oldToken.symbol(), oldToken.address)

    const newToken = new Contract(newTokenAddress, DATAv2Json.abi, hodler)
    console.log("Using new %s token deployed at: %s", await newToken.symbol(), newToken.address)

    const oldTokenBalance = await oldToken.balanceOf(hodler.address)
    console.log("Old token balance: %s", formatEther(oldTokenBalance))
    console.log("Old token totalSupply: %s", formatEther(await oldToken.totalSupply()))
    console.log("New token balance: %s", formatEther(await newToken.balanceOf(hodler.address)))

    const tx = await oldToken.upgrade(oldTokenBalance)
    console.log("Follow upgrade tx: https://etherscan.io/tx/%s", tx.hash)
    const tr = await tx.wait()
    console.log("Transaction receipt: ", tr)

    console.log("Old token balance: %s", formatEther(await oldToken.balanceOf(hodler.address)))
    console.log("Old token totalSupply: %s", formatEther(await oldToken.totalSupply()))
    console.log("New token balance: %s", formatEther(await newToken.balanceOf(hodler.address)))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
