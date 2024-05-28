require("@nomicfoundation/hardhat-chai-matchers")
require("@nomicfoundation/hardhat-ethers")
require("@typechain/hardhat")
require("hardhat-gas-reporter")
require("solidity-coverage")

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
    typechain: {
        outDir: "typechain",
        target: "ethers-v6"
    }
}
