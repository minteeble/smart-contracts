require("@nomiclabs/hardhat-etherscan");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    testnet: {
      url: process.env.TESTNET_URL,
      accounts: [process.env.TESTNET_ACCOUNT],
    },
    mainnet: {
      url: process.env.MAINNET_URL,
      accounts: [process.env.MAINNET_ACCOUNT],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
   
  },
  
};
