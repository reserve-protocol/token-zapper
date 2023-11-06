"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const ethers_1 = require("ethers");
const DefaultMap_1 = require("./base/DefaultMap");
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const index_1 = require("./index");
const controlflow_1 = require("./base/controlflow");
const DefiLlama_1 = require("./aggregators/DefiLlama");
dotenv.config();
const run = async () => {
    const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_BASE);
    const counts = new DefaultMap_1.DefaultMap(() => 0);
    provider.on('debug', (event) => {
        if (event.action === 'request' && event.request.method === 'eth_call') {
            const { to, data } = event.request.params[0];
            const val = counts.get(to + '.' + data) + 1;
            counts.set(to + '.' + data, val);
        }
    });
    const walletDeployer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = index_1.Address.from(walletDeployer.address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, base_1.baseConfig, async (uni) => {
            await (0, setupBaseZapper_1.setupBaseZapper)(uni);
        });
        await universe.initialized;
        universe.dexAggregators.push((0, index_1.createDefillama)('DefiLlama:macha', universe, 10, DefiLlama_1.protocol.Matcha));
        universe.dexAggregators.push((0, index_1.createKyberswap)('KyberSwap', universe, 50));
        universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        const searcher = new index_1.Searcher(universe);
        // const inputs = [
        //   universe.nativeToken.from('0.1'),
        //   universe.commonTokens.USDbC.from('0.1'),
        // ]
        // const rtokensToMint = [universe.rTokens.hyUSD]
        // console.log('Testing mints')
        // for (const input of inputs) {
        //   for (const rtoken of rtokensToMint) {
        //     try {
        //       const resMint = await searcher.findSingleInputToRTokenZap(
        //         input,
        //         rtoken,
        //         testUserAddr,
        //         0.0
        //       )
        //       const zapTx = await resMint.toTransaction({
        //         returnDust: false,
        //         outputSlippage: 100000n,
        //       })
        //       console.log(`${input} -> ${rtoken}`)
        //       console.log(zapTx.describe().join('\n'))
        //     } catch (e) {
        //       console.log(`${input} -> ${rtoken}`)
        //       console.log('Failed')
        //       console.log(e)
        //     }
        //   }
        // }
        console.log('Testing redeem');
        for (const rtoken of [
            universe.rTokens.hyUSD.from('1.0'),
            universe.rTokens.hyUSD.from('2.0'),
            universe.rTokens.hyUSD.from('3.0'),
            universe.rTokens.hyUSD.from('4.0'),
            universe.rTokens.hyUSD.from('5.0'),
            universe.rTokens.hyUSD.from('10.0'),
        ]) {
            for (const output of [
                universe.commonTokens.USDbC,
                // universe.commonTokens.USDC,
                // universe.commonTokens.WETH,
            ]) {
                try {
                    let resBurn = await searcher.findRTokenIntoSingleTokenZap(rtoken, output, testUserAddr, 0.0);
                    const redeemTx = await resBurn.toTransaction({
                        returnDust: true,
                        outputSlippage: 10000000n,
                    });
                    console.log(`${rtoken} -> ${output}`);
                    console.log(redeemTx.describe().join('\n'));
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    await (0, controlflow_1.wait)(10000);
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunBase.js.map