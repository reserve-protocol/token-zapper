import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const networks: Record<number, {
    weth: string,
    permit2: string
}> = {
    1: {
        weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3"
    },
    8453: {
        weth: "0x4200000000000000000000000000000000000006",
        permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3"
    }
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const network = await hre.ethers.provider.getNetwork()
    const { deployer } = (await hre.getNamedAccounts())
    const executor = await hre.deployments.deploy("ZapperExecutor", {
        from: deployer
    })
    const config = networks[network.chainId]
    await hre.deployments.deploy("Zapper", {
        from: deployer,
        args: [
            config.weth,
            config.permit2,
            executor.address
        ]
    })
};
export default func;