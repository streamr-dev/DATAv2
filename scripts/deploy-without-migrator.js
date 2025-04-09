#!/usr/bin/env node

// PEAQ chain
// const providerUrl = "https://peaq.api.onfinality.io/public"
// const explorerUrl = "https://peaq.subscan.io"

// Binance Smart Chain
// const providerUrl = "https://bsc-dataseed.binance.org/"
// const explorerUrl = "https://bscscan.com"

// Matic's Polygon
// const providerUrl = "https://polygon-rpc.com"
// const explorerUrl = "https://polygonscan.com"

// Plain token, same as mainnet
const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

// Polygon wants a special token for the bridge
// const DATAv2Json = require("../artifacts/contracts/DATAv2onPolygon.sol/DATAv2onPolygon.json")

const fs = require("fs")
const { ContractFactory, Wallet, JsonRpcProvider, id } = require("ethers")

const { waitForTx } = require("./waitForTx")

const {
    KEY,
    PROVIDER,
    OUTPUT_FILE,
} = process.env
if (!KEY) { throw new Error("Please provide env variable KEY") }
if (!PROVIDER) { throw new Error("Please provide env variable PROVIDER") }

const { log } = console

const provider = new JsonRpcProvider(PROVIDER)
const deployer = new Wallet(KEY, provider)
log("Deploying contracts from %s", deployer.address)

const adminAddress = "0x42355e7dc0A872C465bE9DE4AcAAAcB5709Ce813"

async function main() {
    log("Connected to network at %s: %s", PROVIDER, JSON.stringify(await provider.getNetwork()))

    const DATAv2 = new ContractFactory(DATAv2Json.abi, DATAv2Json.bytecode, deployer)
    const token = await DATAv2.deploy() // plain token
    // const token = await DATAv2.deploy("0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa")  // Polygon version of the token
    waitForTx("deployment", token.deploymentTransaction())

    const tokenAddress = await token.getAddress()
    log("DATAv2 deployed to:", tokenAddress)
    if (OUTPUT_FILE) {
        fs.writeFileSync(OUTPUT_FILE, tokenAddress)
    }

    const tx1 = await token.grantRole(id("MINTER_ROLE"), adminAddress)
    waitForTx("grant minter role", tx1)

    const tx2 = await token.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", adminAddress)
    waitForTx("grant admin role", tx2)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
