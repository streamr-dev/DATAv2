#!/usr/bin/env node

const fs = require("fs")
const { ContractFactory, Wallet, JsonRpcProvider, ZeroAddress } = require("ethers")

const DATAv2Json = require("../artifacts/contracts/CrosschainERC677.sol/CrosschainERC677.json")

const { waitForTx } = require("./waitForTx")

const {
    KEY,
    PROVIDER,
    OUTPUT_FILE,
    MINTER_ADDRESS,
    PREVIOUS_TOKEN_ADDRESS = "0x1ae24d4928a86faaacd71cf414d2b3a499adb29b",
} = process.env
if (!KEY) { throw new Error("Please provide env variable KEY") }
if (!PROVIDER) { throw new Error("Please provide env variable PROVIDER") }
if (!MINTER_ADDRESS) { throw new Error("Please provide env variable MINTER_ADDRESS") }

const { log } = console

const provider = new JsonRpcProvider(PROVIDER)
const deployer = new Wallet(KEY, provider)
log("Deploying contracts from %s", deployer.address)

async function main() {
    log("Connected to network at %s: %s", PROVIDER, JSON.stringify(await provider.getNetwork()))

    const DATAv2 = new ContractFactory(DATAv2Json.abi, DATAv2Json.bytecode, deployer)
    const token = await DATAv2.deploy(
        PREVIOUS_TOKEN_ADDRESS,
        ZeroAddress,
        MINTER_ADDRESS,
        "Streamr",
        "DATA",
        18,
    )
    waitForTx("deployment", token.deploymentTransaction())

    const tokenAddress = await token.getAddress()
    log("DATAv2 deployed to:", tokenAddress)
    if (OUTPUT_FILE) {
        fs.writeFileSync(OUTPUT_FILE, tokenAddress)
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
