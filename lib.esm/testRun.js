import { ethers } from 'ethers';
import { Address } from './base/Address';
import { Universe } from './Universe';
import { Searcher } from './searcher/Searcher';
import * as dotenv from 'dotenv';
import { IERC20__factory } from './contracts';
import { initOneInch } from './aggregators/oneInch/oneInchRegistry';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = Address.fromHexString(wallet.address);
    const universe = await Universe.create(provider);
    initOneInch(universe, "https://api.1inch.io");
    const searcher = new Searcher(universe);
    const eUSD = universe.rTokens.eUSD;
    const result = await searcher.findSingleInputToRTokenZap(universe.commonTokens.USDT.fromDecimal('50'), eUSD, testUserAddr);
    console.log(result.describe().join('\n'));
    const tx = await result.toTransaction();
    const q = await wallet.sendTransaction(tx.tx);
    await q.wait();
    console.log(tx.toString());
    const eUSDInst = IERC20__factory.connect(eUSD.address.address, universe.provider);
    console.log("Post issue balance: " +
        eUSD
            .quantityFromBigInt((await eUSDInst.balanceOf(wallet.address)).toBigInt())
            .toString());
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