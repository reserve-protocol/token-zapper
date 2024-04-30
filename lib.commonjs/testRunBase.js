"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const DefaultMap_1 = require("./base/DefaultMap");
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const index_1 = require("./index");
const fs_1 = tslib_1.__importDefault(require("fs"));
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
        fs_1.default.writeFileSync('./src.ts/configuration/data/base/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        universe.dexAggregators.push((0, index_1.createEnso)('enso', universe, 1));
        universe.dexAggregators.push((0, index_1.createKyberswap)('Kyber', universe));
        const searcher = universe.searcher;
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            universe.commonTokens.WETH.from(50),
            // universe.commonTokens.USDbC.from('1'),
            // universe.commonTokens.USDbC.from('1000'),
            universe.commonTokens.DAI.from(100000),
            universe.commonTokens.USDC.from(200000),
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
                    const resMint = await searcher.findSingleInputToRTokenZapTx(input, rtoken, testUserAddr);
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`${input} -> ${zapTx.outputs.join(', ')}`);
                }
                catch (e) {
                    console.log(`${input} -> ${rtoken}`);
                    console.log('Failed');
                }
            }
        }
        // }
        for (const rtoken of [
            universe.rTokens.bsd.from(50),
            universe.rTokens.hyUSD.from(200000),
        ]) {
            for (const output of [
                universe.commonTokens.WETH,
                universe.commonTokens.USDC,
                universe.commonTokens.DAI,
            ]) {
                try {
                    let resBurn = await searcher.findRTokenIntoSingleTokenZapTx(rtoken, output, testUserAddr);
                    const redeemTx = resBurn.bestZapTx.tx;
                    // console.log(redeemTx.describe().join('\n'))
                    console.log(`OK: ${redeemTx.input} -> ${redeemTx.outputs.join(', ')}`);
                }
                catch (e) {
                    console.log(`FAILED: ${rtoken.token} -> ${output}`);
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