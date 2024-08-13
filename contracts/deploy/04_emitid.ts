import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const emitId = await hre.deployments.deploy('EmitId', {
    from: deployer,
  })
  console.log('emitId deployed to:', emitId.address)
  
}
func.tags = ["emitid"]
export default func
