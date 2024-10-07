"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arbiWhales = void 0;
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const fs_1 = tslib_1.__importDefault(require("fs"));
const ZapSimulation_1 = require("./configuration/ZapSimulation");
const index_1 = require("./index");
dotenv.config();
const arbiTokens = {
    usdc: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    dai: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    usdt: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    wbtc: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    weth: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    usdm: '0x59d9356e565ab3a36dd77763fc0d87feaf85508c',
    knox: '0x0bbf664d46becc28593368c97236faa0fb397595',
    arb: '0x912ce59144191c1204e64559fe8253a0e49e6548',
};
exports.arbiWhales = {
    // Main base toks
    [arbiTokens.usdc]: '0xb38e8c17e38363af6ebdcb3dae12e0243582891d',
    [arbiTokens.usdt]: '0xb38e8c17e38363af6ebdcb3dae12e0243582891d',
    [arbiTokens.dai]: '0x2d070ed1321871841245d8ee5b84bd2712644322',
    [arbiTokens.wbtc]: '0x47c031236e19d024b42f8ae6780e44a573170703',
    [arbiTokens.weth]: '0xc3e5607cd4ca0d5fe51e09b60ed97a0ae6f874dd',
    [arbiTokens.knox]: '0x86ea1191a219989d2da3a85c949a12a92f8ed3db',
    [arbiTokens.usdm]: '0x426c4966fc76bf782a663203c023578b744e4c5e',
    [arbiTokens.arb]: '0xf3fc178157fb3c87548baa86f9d24ba38e649b588',
};
process.on('unhandledRejection', (reason, promise) => {
    console.log(reason, promise);
});
const run = async () => {
    const provider = new ethers_1.ethers.providers.WebSocketProvider(process.env.PROVIDER_ARBI_WS);
    const testUserAddr = index_1.Address.from("0x40F37F0933bC3ed35C4fbB0503F9954E5036f971");
    const universe = await index_1.Universe.createWithConfig(provider, index_1.arbiConfig, async (uni) => {
        uni.addTradeVenue((0, index_1.createEnso)('enso', uni, 1));
        uni.addTradeVenue((0, index_1.createKyberswap)('Kyber', uni));
        uni.addTradeVenue((0, index_1.createParaswap)('para', uni));
        await (0, index_1.setupArbitrumZapper)(uni);
    }, {
        simulateZapFn: (0, ZapSimulation_1.makeCustomRouterSimulator)('http://127.0.0.1:7781/api/v1/simulate', exports.arbiWhales, index_1.arbiConfig.addresses),
    });
    await universe.initialized;
    const toks = [...universe.tokens.values()].map((i) => i.toJson());
    toks.sort((a, b) => a.address.localeCompare(b.address));
    fs_1.default.writeFileSync('./src.ts/configuration/data/arbitrum/tokens.json', JSON.stringify(toks, null, 2));
    const searcher = universe.searcher;
    const inputs = [
        universe.commonTokens.USDC.from(10000),
        universe.commonTokens.USDT.from(25000),
        universe.commonTokens.DAI.from(5000),
        universe.commonTokens.WETH.from(3),
    ];
    const rtokensToMint = [
        universe.rTokens.KNOX,
        // universe.rTokens._rTokenWithWUSDM,
    ];
    provider.on('block', async (block) => {
        universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
    });
    if (process.env.MINT) {
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    await universe.updateBlockState(await universe.provider.getBlockNumber(), (await universe.provider.getGasPrice()).toBigInt());
                    console.log(`TEST: ${input} -> ${rtoken}`);
                    const start = Date.now();
                    const resMint = await searcher.zapIntoRToken(input, rtoken, testUserAddr, {
                        enableTradeZaps: false,
                    });
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`OK [${Date.now() - start}]: ${zapTx.stats}`);
                    // console.log(printPlan(zapTx.planner, universe).join('\n'))
                }
                catch (e) {
                    console.log(`Failed: ${input} -> ${rtoken}`);
                }
            }
        }
    }
    if (process.env.REDEEM) {
        for (const rToken of [universe.rTokens.KNOX.from(2203.890026965382276103)]) {
            for (const out of [
                universe.commonTokens.DAI,
                // universe.commonTokens.USDC,
                universe.commonTokens.USDT,
                universe.commonTokens.WETH,
            ]) {
                try {
                    console.log(`Testing ${rToken} -> ${out}`);
                    await universe.updateBlockState(await universe.provider.getBlockNumber(), (await universe.provider.getGasPrice()).toBigInt());
                    const resMint = await universe.searcher.redeem(rToken, out, testUserAddr, {
                        enableTradeZaps: true,
                    });
                    console.log(`OK [${resMint.timeTaken}ms]: ${resMint.bestZapTx.tx.stats}`);
                    console.log(resMint.bestZapTx.tx.describe().join('\n'));
                }
                catch (e) { }
            }
        }
    }
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunArbi.js.map