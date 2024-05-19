"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const index_1 = require("./index");
const fs_1 = tslib_1.__importDefault(require("fs"));
dotenv.config();
const run = async () => {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(process.env.PROVIDER_BASE);
    const walletDeployer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).connect(provider);
    const testUserAddr = index_1.Address.from(walletDeployer.address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, base_1.baseConfig, async (uni) => {
            uni.addTradeVenue((0, index_1.createEnso)('enso', uni, 1));
            uni.addTradeVenue((0, index_1.createKyberswap)('Kyber', uni));
            await (0, setupBaseZapper_1.setupBaseZapper)(uni);
        });
        await universe.initialized;
        fs_1.default.writeFileSync('./src.ts/configuration/data/base/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        const searcher = universe.searcher;
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            // universe.nativeToken.from(50),
            universe.commonTokens.WETH.from(25.0),
            // universe.commonTokens.USDbC.from('1'),
            // universe.commonTokens.USDbC.from('1000'),
            universe.commonTokens.DAI.from(75000.0),
            universe.commonTokens.USDC.from(100000.0),
            // universe.commonTokens.USDbC.from('10000'),
        ];
        const rtokensToMint = [
            universe.rTokens.MATT,
            universe.rTokens.bsd,
            universe.rTokens.hyUSD,
        ];
        await universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        provider.on('block', async (block) => {
            await universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    const resMint = await searcher.zapIntoRToken(input, rtoken, testUserAddr);
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`OK [${resMint.timeTaken}ms]: ${zapTx.stats}`);
                }
                catch (e) {
                    console.log(`Failed: ${input} -> ${rtoken}`);
                }
            }
        }
        for (const rtoken of [
            universe.rTokens.bsd.from(50),
            universe.rTokens.hyUSD.from(100000),
        ]) {
            for (const output of [
                universe.commonTokens.WETH,
                universe.commonTokens.USDC,
                universe.commonTokens.DAI,
            ]) {
                try {
                    let resBurn = await searcher.redeem(rtoken, output, testUserAddr);
                    const redeemTx = resBurn.bestZapTx.tx;
                    console.log(`OK [${resBurn.timeTaken}ms]: ${redeemTx.stats}`);
                }
                catch (e) {
                    console.log(`FAILED: ${rtoken.token} -> ${output}`);
                    console.log(e);
                }
            }
        }
        universe.prettyPrintPerfs();
    }
    // await wait(10000)
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunBase.js.map