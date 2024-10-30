import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts()
    const consETHETHf = await hre.deployments.deploy('VirtualERC20', {
        from: deployer,
        args: [
            "0x59866ec5650e9ba00c51f6d681762b48b0ada3de",
            14,
            "Concentrator: ETH+ETH-f",
            "consETHETH-f",
            18
        ]
    })
    console.log('consETHETHf deployed to:', consETHETHf.address)

}
func.tags = ["virtual-erc20s"]
export default func
