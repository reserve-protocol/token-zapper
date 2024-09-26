import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import { makeCustomRouterSimulator } from './configuration/ZapSimulation';
import { Address, Universe, arbiConfig, createEnso, createKyberswap, createParaswap, setupArbitrumZapper, } from './index';
dotenv.config();
const arbiTokens = {
    usdc: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    dai: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    usdt: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    wbtc: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    usdm: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
    knox: "0x0bbf664d46becc28593368c97236faa0fb397595",
    arb: "0x912ce59144191c1204e64559fe8253a0e49e6548"
};
export const arbiWhales = {
    // Main base toks
    [arbiTokens.usdc]: "0xb38e8c17e38363af6ebdcb3dae12e0243582891d",
    [arbiTokens.usdt]: "0xb38e8c17e38363af6ebdcb3dae12e0243582891d",
    [arbiTokens.dai]: "0x2d070ed1321871841245d8ee5b84bd2712644322",
    [arbiTokens.wbtc]: "0x47c031236e19d024b42f8ae6780e44a573170703",
    [arbiTokens.weth]: "0xc3e5607cd4ca0d5fe51e09b60ed97a0ae6f874dd",
    [arbiTokens.knox]: "0x86ea1191a219989d2da3a85c949a12a92f8ed3db",
    [arbiTokens.usdm]: "0x426c4966fc76bf782a663203c023578b744e4c5e",
    [arbiTokens.arb]: "0xf3fc178157fb3c87548baa86f9d24ba38e649b588"
};
const run = async () => {
    const provider = new ethers.providers.WebSocketProvider(process.env.PROVIDER_ARBI_WS);
    const testUserAddr = Address.from(ethers.Wallet.createRandom().connect(provider).address);
    const universe = await Universe.createWithConfig(provider, arbiConfig, async (uni) => {
        uni.addTradeVenue(createEnso('enso', uni, 1));
        uni.addTradeVenue(createKyberswap('Kyber', uni));
        uni.addTradeVenue(createParaswap('para', uni));
        await setupArbitrumZapper(uni);
    }, {
        simulateZapFn: makeCustomRouterSimulator('http://127.0.0.1:7781/api/v1/simulate', arbiWhales, arbiConfig.addresses),
    });
    await universe.initialized;
    const wyUSDM = await universe.defineRToken(Address.from("0x635f80eea9df5936772165740120e677878b55a6"));
    if (1) {
        console.log((await universe.zap(universe.commonTokens.USDM.from(100.0), wyUSDM, testUserAddr, {
            enableTradeZaps: false
        })).describe().join("\n"));
        return;
    }
    const toks = [...universe.tokens.values()].map((i) => i.toJson());
    toks.sort((a, b) => a.address.localeCompare(b.address));
    fs.writeFileSync('./src.ts/configuration/data/arbitrum/tokens.json', JSON.stringify(toks, null, 2));
    const searcher = universe.searcher;
    const inputs = [
        universe.commonTokens.USDC.from(100000),
        universe.commonTokens.USDT.from(50000),
        universe.commonTokens.DAI.from(50000),
        universe.commonTokens.WETH.from(3),
    ];
    const rtokensToMint = [
        universe.rTokens.KNOX,
        // universe.rTokens._rTokenWithWUSDM,
    ];
    provider.on('block', async (block) => {
        universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
    });
    // await universe.searcher.redeem(
    //   universe.rTokens._rTokenWithWUSDM.from(3),
    //   universe.commonTokens.USDC,
    //   Address.from('0x8e0507c16435caca6cb71a7fb0e0636fd3891df4'),
    //   {
    //     outputSlippage: 10000n,
    //   }
    // )
    for (const input of inputs) {
        for (const rtoken of rtokensToMint) {
            try {
                console.log(`TEST: ${input} -> ${rtoken}`);
                const start = Date.now();
                const resMint = await searcher.zapIntoRToken(input, rtoken, testUserAddr);
                const zapTx = resMint.bestZapTx.tx;
                console.log(`OK [${Date.now() - start}]: ${zapTx.stats}`);
                // console.log(printPlan(zapTx.planner, universe).join('\n'))
            }
            catch (e) {
                console.log(`Failed: ${input} -> ${rtoken}`);
            }
        }
        await universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
    }
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunArbi.js.map