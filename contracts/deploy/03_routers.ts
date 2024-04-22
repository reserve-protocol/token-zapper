import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const uniV3RouterCall = await hre.deployments.deploy('UniV3RouterCall', {
    from: deployer,
  })
  console.log('uniV3RouterCall deployed to:', uniV3RouterCall.address)
}
func.tags = ["routers"]
export default func
