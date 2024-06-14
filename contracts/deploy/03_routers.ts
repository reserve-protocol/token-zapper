import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts()
  // const uniV3RouterCall = await hre.deployments.deploy('UniV3RouterCall', {
  //   from: deployer,
  // })
  // console.log('uniV3RouterCall deployed to:', uniV3RouterCall.address)

  // const CurveStableSwapNGHelper = await hre.deployments.deploy(
  //   'CurveStableSwapNGHelper',
  //   {
  //     from: deployer,
  //   }
  // )
  // console.log(
  //   'CurveStableSwapNGHelper deployed to:',
  //   CurveStableSwapNGHelper.address
  // )

  const CurveCryptoFactoryHelper = await hre.deployments.deploy(
    'CurveCryptoFactoryHelper',
    {
      from: deployer,
    }
  )
  console.log(
    'CurveCryptoFactoryHelper deployed to:',
    CurveCryptoFactoryHelper.address
  )
}
func.tags = ['routers']
export default func
