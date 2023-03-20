import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  typechain: {
    outDir: '../src/contracts',
    target: 'ethers-v5',
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
    ]
  }
};

export default config;
