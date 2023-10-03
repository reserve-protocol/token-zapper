import hre from 'hardhat'
import { ethers } from 'hardhat'

const run = async () => {
  const Executor = await ethers.getContractFactory("ZapperExecutor")
  const Zapper = await ethers.getContractFactory("Zapper")

}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
