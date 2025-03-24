import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const networks: Record<
  number,
  {
    weth: string
    slug: string
    permit2: string
  }
> = {
  1: {
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    slug: 'mainnet',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  8453: {
    weth: '0x4200000000000000000000000000000000000006',
    slug: 'base',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
  42161: {
    weth: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    slug: 'arbitrum',
    permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  },
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const network = await hre.ethers.provider.getNetwork()
  const { deployer } = await hre.getNamedAccounts()
  const config = networks[network.chainId]
  const executor = await hre.deployments.deploy('ZapperExecutor', {
    from: deployer,
  })
  const zapper = await hre.deployments.deploy('Zapper2', {
    from: deployer,
    args: [config.weth, executor.address],
  })

  const nTo1Zapper = await hre.deployments.deploy('NTo1Zapper', {
    from: deployer,
    args: [config.weth, executor.address],
  })

  console.log(`Run the following commands to verify the contracts:`)
  console.log(
    `npx hardhat verify "${executor.address}" --network ${config.slug}`
  )
  console.log(
    `npx hardhat verify "${nTo1Zapper.address}" "${config.weth}" "${executor.address}" --network ${config.slug}`
  )
}
func.tags = ['zapper']
export default func
