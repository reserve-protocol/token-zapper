import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = (await hre.getNamedAccounts())
    const lens = await hre.deployments.deploy("RTokenLens", {
        from: deployer
    })

    console.log("Len deployed to", lens.address)
};
func.tags = ["lens"]
export default func;