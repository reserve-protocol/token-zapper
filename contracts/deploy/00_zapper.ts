import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployer } = (await hre.getNamedAccounts())
    const executor = await hre.deployments.deploy("ZapperExecutor", {
        from: deployer
    })
    await hre.deployments.deploy("Zapper", {
        from: deployer,
        args: [
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "0x000000000022D473030F116dDEE9F6B43aC78BA3",
            executor.address
        ]
    })
};
export default func;