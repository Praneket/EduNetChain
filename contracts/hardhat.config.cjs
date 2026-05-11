require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../backend/.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
