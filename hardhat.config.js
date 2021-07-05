/*global task, ethers */

require("@nomiclabs/hardhat-waffle")
require("solidity-coverage")

//require("hardhat-erc1820") // this was for ERC777 token study, required for ERC777 tokens

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

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
            },
            {
                version: "0.4.11"
            }
        ]
    }

    // solidity: {
    //   version: "0.8.3",
    //   overrides: {
    //     "contracts/CrowdsaleToken.sol": {
    //       version: "0.4.8"
    //     }
    //   }
    // }

    // this seriously breaks things because lots of things don't wait for transactions, also there's no way to do that for HardhatProvider, apparently
    // networks: {
    //   hardhat: {
    //     mining: {
    //       auto: false,
    //       interval: 1000,
    //     },
    //   },
    // },
}
