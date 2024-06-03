import { HardhatUserConfig } from 'hardhat/config'
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomicfoundation/hardhat-verify'
import 'hardhat-deploy'
import 'hardhat-deploy-ethers'
import * as dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  typechain: {
    outDir: '../src.ts/contracts',
    target: 'ethers-v5',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    local: {
      url: 'http://127.0.0.1:8545/',
    },
    mainnet: {
      url: process.env.PROVIDER!,
      accounts: [process.env.PRIVATE_KEY_DEPLOYER!],
    },
    arbi: {
      url: process.env.PROVIDER_ARBI!,
      accounts: [process.env.PRIVATE_KEY_DEPLOYER!],
    },
    base: {
      url: process.env.PROVIDER_BASE!,
      accounts: [process.env.PRIVATE_KEY_DEPLOYER!],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: '0xF2d98377d80DADf725bFb97E91357F1d81384De2',
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.17',
      },
      {
        version: '0.5.16',
      },
      {
        version: '0.6.12',
      },
      {
        version: '0.4.24',
      },
    ],
  },
}

export default config
