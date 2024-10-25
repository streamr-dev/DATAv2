require("@nomicfoundation/hardhat-chai-matchers")
require("@nomicfoundation/hardhat-ethers")
require("@typechain/hardhat")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("@nomicfoundation/hardhat-verify")

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.4.11"
            }
        ]
    },
    networks: {
        hardhat: {},
        polygon: {
            chainId: 137,
            url: "https://polygon-rpc.com",
            // gasPrice: 80000000000,
        },
        polygonAmoy: {
            chainId: 80002,
            url: process.env.ETHEREUM_RPC || "https://rpc-amoy.polygon.technology",
        },
        ethereum: {
            chainId: 1,
            url: "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY || "",
        },
        peaq: {
            chainId: 3338,
            url: "https://peaq.api.onfinality.io/public",
        },
        iotex: {
            url: "https://babel-api.mainnet.IoTeX.io",
            chainId: 4689,
            gas: 8500000,
            gasPrice: 1000000000000
        },
        iotexTestnet: {
            url: "https://babel-api.testnet.IoTeX.io",
            chainId: 4690,
            gas: 8500000,
            gasPrice: 1000000000000
        },
    },
    typechain: {
        outDir: "typechain",
        target: "ethers-v6"
    },
    etherscan: {
        apiKey: {
            polygon: process.env.VERIFY_API_KEY || "",
            polygonAmoy: process.env.VERIFY_API_KEY || "",
            peaq: process.env.VERIFY_API_KEY || "",
            iotexTestnet: "no key needed!",
            iotex: "no key needed!",
        },
        customChains: [{
            network: "polygonAmoy",
            chainId: 80002,
            urls: {
                apiURL: "https://api-amoy.polygonscan.com/api",
                browserURL: "https://amoy.polygonscan.com"
            },
        }, {
            network: "peaq",
            chainId: 3338,
            urls: {
                apiURL: "https://peaq-testnet.api.subscan.io",
                browserURL: "https://peaq.subscan.io/"
            },
        }, {
            network: "iotex",
            chainId: 4689,
            urls: {
                apiURL: "https://iotexscout.io/api",
                browserURL: "https://iotexscan.io"
            },
        }, {
            network: "iotexTestnet",
            chainId: 4690,
            urls: {
                apiURL: "https://testnet.iotexscout.io/api",
                browserURL: "https://testnet.iotexscan.io"
            },
        }]
    },
}
