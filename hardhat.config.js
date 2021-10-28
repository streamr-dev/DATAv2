require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")
require("hardhat-gas-reporter")

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
    }
}
