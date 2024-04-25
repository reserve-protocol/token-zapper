"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const DefaultMap_1 = require("./base/DefaultMap");
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const index_1 = require("./index");
const setupRTokens_1 = require("./configuration/setupRTokens");
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
    const walletDeployer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).connect(provider);
    const testUserAddr = index_1.Address.from(walletDeployer.address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, base_1.baseConfig, async (uni) => {
            await (0, setupBaseZapper_1.setupBaseZapper)(uni);
        });
        await universe.initialized;
        const tok = await universe.getToken(index_1.Address.from('0x57c7a87077884DECdceA596519d1d6E795C8ae89'));
        await (0, setupRTokens_1.loadRToken)(universe, tok.address, index_1.Address.from('0x64661a3392195F1E9ED0237708905064AaF85AF1'));
        // fs.writeFileSync(
        //   './src.ts/configuration/data/base/tokens.json',
        //   JSON.stringify(
        //     [...universe.tokens.values()].map((i) => i.toJson()),
        //     null,
        //     2
        //   )
        // )
        // universe.dexAggregators.push(
        //   createDefillama('DefiLlama:macha', universe, 10, protocol.Matcha)
        // )
        universe.dexAggregators.push((0, index_1.createEnso)('Enso', universe, 10));
        universe.dexAggregators.push((0, index_1.createKyberswap)('Kyber', universe, 10));
        // while (true) {
        const searcher = new index_1.Searcher(universe);
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            universe.nativeToken.from('10'),
            // universe.commonTokens.USDbC.from('1'),
            universe.commonTokens.USDbC.from('1000'),
            universe.commonTokens.DAI.from('10000'),
            universe.commonTokens.USDC.from('100000'),
            // universe.commonTokens.USDbC.from('10000'),
        ];
        const rtokensToMint = [universe.rTokens.hyUSD, universe.rTokens.bsd];
        provider.on('block', async (block) => {
            universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        // while (1) {
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    counts.clear();
                    const resMint = await searcher.findSingleInputToRTokenZapTx(input, rtoken, testUserAddr, 0, {
                        returnDust: true,
                        outputSlippage: 10000n,
                    });
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(zapTx.describe().join('\n'));
                    console.log(`${input} -> ${zapTx.outputs.join(', ')}`);
                }
                catch (e) {
                    console.log(`${input} -> ${rtoken}`);
                    console.log('Failed');
                    console.log(e);
                }
            }
        }
        // }
        for (const rtoken of [
            universe.rTokens.bsd.from('23'),
            universe.rTokens.hyUSD.from(23032),
        ]) {
            for (const output of [
                universe.commonTokens.WETH,
                universe.commonTokens.USDC,
                universe.commonTokens.DAI,
            ]) {
                try {
                    let resBurn = await searcher.findRTokenIntoSingleTokenZapTx(rtoken, output, testUserAddr, 0.0, {
                        returnDust: true,
                        outputSlippage: 10000n,
                    });
                    const redeemTx = resBurn.bestZapTx.tx;
                    console.log(`${rtoken} -> ${output}`);
                    console.log(redeemTx.describe().join('\n'));
                    console.log(`${redeemTx.input} -> ${redeemTx.outputs.join(', ')}`);
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    // await wait(10000)
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunBase.js.map