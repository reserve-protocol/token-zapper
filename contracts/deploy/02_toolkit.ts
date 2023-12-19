import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  const balanceOf = await hre.deployments.deploy('BalanceOf', {
    from: deployer,
  })

  console.log('BalanceOf deployed to:', balanceOf.address)
  
}
func.tags = ["toolkit"]
export default func
