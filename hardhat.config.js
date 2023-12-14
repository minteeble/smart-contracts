require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

dotenv.config();

let privateKeyPlaceHolder = "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    compilers: [{
      version: "0.8.14",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    }, {
      version: "0.4.26",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },]
  },
  networks: {
    testnet: {
      url: process.env.TESTNET_URL || "",
      accounts: [process.env.TESTNET_ACCOUNT || privateKeyPlaceHolder],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: [process.env.MAINNET_ACCOUNT || privateKeyPlaceHolder],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || "",
  },
};
