"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const ethers_1 = require("ethers");
const fs_1 = tslib_1.__importDefault(require("fs"));
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const ZapSimulation_1 = require("./configuration/ZapSimulation");
const index_1 = require("./index");
dotenv.config();
const whales = {
    // main base toks
    '0xab36452dbac151be02b16ca17d8919826072f64a': '0x796d2367af69deb3319b8e10712b8b65957371c3', // rsr
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': '0xcdac0d6c6c59727a65f871236188350531885c43', // usdc
    '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': '0x3bf93770f2d4a794c3d9ebefbaebae2a8f09a5e5', // cbeth
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': '0x0b25c51637c43decd6cc1c1e3da4518d54ddb528', // usdbc
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': '0x73b06d8d18de422e269645eace15400de7462417', // dai
    '0x4200000000000000000000000000000000000006': '0xcdac0d6c6c59727a65f871236188350531885c43', // weth
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452': '0x99cbc45ea5bb7ef3a5bc08fb1b7e56bb2442ef0d', // wsteth
    // rtokens
    '0xcc7ff230365bd730ee4b352cc2492cedac49383e': '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // hyusd
    '0xcb327b99ff831bf8223cced12b1338ff3aa322ff': '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb', // bsdeth
    '0xfe0d6d83033e313691e96909d2188c150b834285': '0x1ef46018244179810dec43291d693cb2bf7f40e5', // iusdc
    '0xc9a3e2b3064c1c0546d3d0edc0a748e9f93cf18d': '0x6f1d6b86d4ad705385e751e6e88b0fdfdbadf298', // vaya
};
const run = async () => {
    const provider = new ethers_1.ethers.providers.WebSocketProvider(process.env.BASE_PROVIDER);
    const walletDeployer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).connect(provider);
    const testUserAddr = index_1.Address.from(walletDeployer.address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, base_1.baseConfig, async (uni) => {
            uni.addTradeVenue((0, index_1.createEnso)('enso', uni, 1));
            uni.addTradeVenue((0, index_1.createKyberswap)('Kyber', uni));
            // uni.addTradeVenue(createParaswap('paraswap', uni))
            await (0, setupBaseZapper_1.setupBaseZapper)(uni);
        }, {
            simulateZapFn: (0, ZapSimulation_1.makeCustomRouterSimulator)('http://127.0.0.1:7781/api/v1/simulate', whales, base_1.baseConfig.addresses),
        });
        await universe.initialized;
        const toks = [...universe.tokens.values()].map((i) => i.toJson());
        toks.sort((a, b) => a.address.localeCompare(b.address));
        fs_1.default.writeFileSync('./src.ts/configuration/data/base/tokens.json', JSON.stringify(toks, null, 2));
        const searcher = universe.searcher;
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            universe.nativeToken.from(50),
            // universe.commonTokens.cbETH.from(10.0),
            // universe.commonTokens.USDbC.from('1'),
            // universe.commonTokens.USDbC.from('1000'),
            // universe.commonTokens.DAI.from(10000.0),
            universe.commonTokens.USDC.from(10000.0),
            universe.commonTokens.USDbC.from(10000.0),
        ];
        const rtokensToMint = [universe.rTokens.bsd, universe.rTokens.hyUSD];
        await universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        provider.on('block', async (block) => {
            await universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    console.log(`Testing ${input} -> ${rtoken}`);
                    const resMint = await searcher.zapIntoRToken(input, rtoken, testUserAddr, {
                        enableTradeZaps: false,
                        outputSlippage: 10000n,
                    });
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`OK [${resMint.timeTaken}ms]: ${zapTx.stats}`);
                }
                catch (e) {
                    console.log(e.message);
                    console.log(`Failed: ${input} -> ${rtoken}`);
                }
            }
        }
        if (1) {
            return;
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
                    console.log(`Testing ${rtoken} -> ${output}`);
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