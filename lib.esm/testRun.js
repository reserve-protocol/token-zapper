import { ethers } from 'ethers';
import { Address } from './base/Address';
import ethereumConfig from './configuration/ethereum';
import { StaticConfig } from './configuration/StaticConfig';
import { Universe } from './Universe';
import { Searcher } from './searcher/Searcher';
import * as dotenv from 'dotenv';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = Address.fromHexString(wallet.address);
    const universe = await Universe.createWithConfig(provider, {
        ...ethereumConfig,
        config: new StaticConfig(ethereumConfig.config.nativeToken, {
            ...ethereumConfig.config.addresses,
            executorAddress: Address.fromHexString('0x1f53E116c31F171e59f45f0752AEc5d1F5aA3714'),
            zapperAddress: Address.fromHexString('0xa31F4c0eF2935Af25370D9AE275169CCd9793DA3'),
        }),
    });
    const searcher = new Searcher(universe);
    const eUSD = universe.rTokens.eUSD;
    const result = await searcher.findSingleInputToRTokenZap(universe.commonTokens.USDT.fromDecimal('50'), eUSD, testUserAddr);
    console.log(result.describe().join('\n'));
    // const tx = await result.toTransaction()
    // const q = await wallet.sendTransaction(tx.tx)
    // await q.wait()
    // const eUSDInst = IERC20__factory.connect(
    //   eUSD.address.address,
    //   universe.provider
    // )
    // console.log(
    //   eUSD
    //     .quantityFromBigInt((await eUSDInst.balanceOf(wallet.address)).toBigInt())
    //     .toString()
    // )
    // console.log(tx)
    // // console.log(result)
    // console.log("Done")
    // const swap = await createEthereumRouter().swap(
    //   USER,
    //   USER,
    //   universe.commonTokens.ERC20GAS!.fromDecimal('0.1'),
    //   universe.commonTokens.USDT!,
    //   0.3
    // )
    // console.log(universe.currentBlock)
    // console.log(JSON.stringify(swap))
    // const searcher = new Searcher(universe)
    // const searcherResult = await searcher.findSingleInputToRTokenZap({
    //   input: universe.nativeToken.fromDecimal('0.1'),
    //   rToken: universe.rTokens.eUSD!,
    //   signerAddress: USER
    // })
    // console.log(searcherResult.describe().join('\n'))
    //   const transaction = await searcherResult.toTransaction()
    //   console.log(transaction.toString())
    //   const signer = provider.getSigner(USER)
    //   const receipt = await IZapper__factory.connect(universe.config.addresses.zapperAddress.address, signer).zapETH(
    //     transaction.params,
    //     {
    //       value: transaction.tx.value,
    //       gasLimit: transaction.gas
    //     }
    //   )
    //   const done = await receipt.wait()
    //   console.log('Gas used', done.gasUsed.toString())
    //   console.log('eUSD minted:')
    //   console.log(
    //     ethers.utils.formatUnits(
    //       await IERC20__factory.connect(
    //         universe.commonTokens.eUSD!.address.address,
    //         universe.provider
    //       ).balanceOf(USER),
    //       18
    //     )
    //   )
};
run();
//# sourceMappingURL=testRun.js.map