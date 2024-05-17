"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const fs_1 = tslib_1.__importDefault(require("fs"));
const index_1 = require("./index");
dotenv.config();
const run = async () => {
    const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_ARBI);
    const testUserAddr = index_1.Address.from(ethers_1.ethers.Wallet.createRandom().connect(provider).address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, index_1.arbiConfig, async (uni) => {
            uni.addTradeVenue((0, index_1.createEnso)('enso', uni, 1));
            uni.addTradeVenue((0, index_1.createKyberswap)('Kyber', uni));
            await (0, index_1.setupArbitrumZapper)(uni);
        });
        await universe.initialized;
        fs_1.default.writeFileSync('./src.ts/configuration/data/arbitrum/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        const searcher = universe.searcher;
        const inputs = [
            universe.commonTokens.USDC.from(50000),
            universe.commonTokens.USDT.from(50000),
            universe.commonTokens.DAI.from(10000),
            universe.commonTokens.WETH.from(3),
        ];
        const rtokensToMint = [universe.rTokens.KNOX];
        provider.on('block', async (block) => {
            universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    const start = Date.now();
                    const resMint = await searcher.zapIntoRToken(input, rtoken, testUserAddr, {
                        outputSlippage: 1000n,
                    });
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`OK [${Date.now() - start}]: ${zapTx.stats}`);
                }
                catch (e) {
                    console.log(`Failed: ${input} -> ${rtoken}`);
                }
            }
            await universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        }
    }
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunArbi.js.map