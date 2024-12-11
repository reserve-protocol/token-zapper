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

  if ((await hre.ethers.provider.getNetwork()).chainId === 8453) {
    const SlipstreamRouterCall = await hre.deployments.deploy(
      'SlipstreamRouterCall',
      {
        from: deployer,
      }
    )
    console.log(
      'SlipstreamRouterCall deployed to:',
      SlipstreamRouterCall.address
    )
  }

  // const CurveCryptoFactoryHelper = await hre.deployments.deploy(
  //   'CurveCryptoFactoryHelper',
  //   {
  //     from: deployer,
  //   }
  // )
  // console.log(
  //   'CurveCryptoFactoryHelper deployed to:',
  //   CurveCryptoFactoryHelper.address
  // )

  // const BalancerCall = await hre.deployments.deploy('BalancerCall', {
  //   from: deployer,
  // })
  // console.log('BalancerCall deployed to:', BalancerCall.address)
}
func.tags = ['routers']
export default func
