#!/usr/bin/env node

// Binance Smart Chain
const providerUrl = "https://bsc-dataseed.binance.org/"
const explorerUrl = "https://bscscan.com/tx"

// Matic's Polygon
// const providerUrl = "https://polygon-rpc.com"
// const explorerUrl = "https://polygonscan.com/tx"

// Plain token, same as mainnet
const DATAv2Json = require("../artifacts/contracts/DATAv2.sol/DATAv2.json")

// Matic's Polygon wants a special token for the bridge
// const DATAv2Json = require("../artifacts/contracts/DATAv2onPolygon.sol/DATAv2onPolygon.json")


const { ContractFactory, Wallet, providers: { JsonRpcProvider }, utils: { id } } = require("ethers")

const { KEY } = process.env
if (!KEY) { throw new Error("Please provide env variable KEY") }

const provider = new JsonRpcProvider(providerUrl)
const deployer = new Wallet(KEY, provider)
console.log("Deploying contracts from %s", deployer.address)

const adminAddress = "0x42355e7dc0A872C465bE9DE4AcAAAcB5709Ce813"

async function main() {

    const DATAv2 = new ContractFactory(DATAv2Json.abi, DATAv2Json.bytecode, deployer)
    const token = await DATAv2.deploy() // plain token
    // const token = await DATAv2.deploy("0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa")  // Matic's Polygon version of the token
    console.log("Follow deployment: %s/%s", explorerUrl, token.deployTransaction.hash)

    await token.deployed()
    console.log("DATAv2 deployed to:", token.address)

    const tx1 = await token.grantRole(id("MINTER_ROLE"), adminAddress)
    console.log("Follow grant minter tx: %s/%s", explorerUrl, tx1.hash)
    const tr1 = await tx1.wait()
    console.log("Transaction receipt: ", tr1)

    const tx2 = await token.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", adminAddress)
    console.log("Follow grant admin tx: %s/%s", explorerUrl, tx2.hash)
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
