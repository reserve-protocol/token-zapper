import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const boosterAddress = '0xF403C135812408BFbE8713b5A23a04b3D48AAE31'
const pids = [125, 156, 185, 238, 292, 339, 368, 369, 387]

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()

  const booster = await ethers.getContractAt('IBooster', boosterAddress)

  for (const pid of pids) {
    const poolInfo = await booster.poolInfo(pid)
    const lpToken = await ethers.getContractAt(
      'IERC20Metadata',
      poolInfo.lptoken
    )

    const lpTokenName = await lpToken.name()
    const lpTokenSymbol = await lpToken.symbol()
    const lpTokenDecimals = await lpToken.decimals()

    const name = `Convex CRV ${lpTokenName}`
    const symbol = `crv${lpTokenSymbol}`
    const decimals = lpTokenDecimals

    const deployment = await hre.deployments.deploy(`ConvexVirtualERC20`, {
      from: deployer,
      args: [poolInfo.crvRewards, name, symbol, decimals],
      log: true,
    })

    console.log(
      `ConvexVirtualERC20 for pid ${pid} deployed to:`,
      deployment.address
    )
  }
}

func.tags = ['convex-virtual-erc20s']
export default func
