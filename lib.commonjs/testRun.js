"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const Address_1 = require("./base/Address");
const Universe_1 = require("./Universe");
const Searcher_1 = require("./searcher/Searcher");
const dotenv = tslib_1.__importStar(require("dotenv"));
const contracts_1 = require("./contracts");
const oneInchRegistry_1 = require("./aggregators/oneInch/oneInchRegistry");
dotenv.config();
const run = async () => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER);
    const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = Address_1.Address.fromHexString(wallet.address);
    const universe = await Universe_1.Universe.create(provider);
    (0, oneInchRegistry_1.initOneInch)(universe, "https://api.1inch.io");
    const searcher = new Searcher_1.Searcher(universe);
    const eUSD = universe.rTokens.eUSD;
    const result = await searcher.findSingleInputToRTokenZap(universe.commonTokens.USDT.fromDecimal('50'), eUSD, testUserAddr);
    console.log(result.describe().join('\n'));
    const tx = await result.toTransaction();
    const q = await wallet.sendTransaction(tx.tx);
    await q.wait();
    console.log(tx.toString());
    const eUSDInst = contracts_1.IERC20__factory.connect(eUSD.address.address, universe.provider);
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