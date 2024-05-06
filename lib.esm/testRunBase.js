import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { baseConfig } from './configuration/base';
import { setupBaseZapper } from './configuration/setupBaseZapper';
import { Address, Universe, createEnso, createKyberswap, } from './index';
import fs from 'fs';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_BASE);
    const walletDeployer = new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).connect(provider);
    const testUserAddr = Address.from(walletDeployer.address);
    {
        const universe = await Universe.createWithConfig(provider, baseConfig, async (uni) => {
            await setupBaseZapper(uni);
        });
        await universe.initialized;
        fs.writeFileSync('./src.ts/configuration/data/base/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        universe.addTradeVenue(createEnso('enso', universe, 1));
        universe.addTradeVenue(createKyberswap('Kyber', universe));
        const searcher = universe.searcher;
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            // universe.nativeToken.from(50),
            universe.commonTokens.WETH.from(10),
            // universe.commonTokens.USDbC.from('1'),
            // universe.commonTokens.USDbC.from('1000'),
            universe.commonTokens.DAI.from(100000),
            universe.commonTokens.USDC.from(100000),
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
                    const resMint = await searcher.findSingleInputToRTokenZapTx(input, rtoken, testUserAddr);
                    const zapTx = resMint.bestZapTx.tx;
                    console.log(`OK [${resMint.timeTaken}ms]: ${zapTx.stats}`);
                }
                catch (e) {
                    console.log(`Failed: ${input} -> ${rtoken}`);
                }
            }
        }
        for (const rtoken of [
            universe.rTokens.bsd.from(10),
            universe.rTokens.hyUSD.from(50000),
        ]) {
            for (const output of [
                universe.commonTokens.WETH,
                universe.commonTokens.USDC,
                universe.commonTokens.DAI,
            ]) {
                try {
                    let resBurn = await searcher.findRTokenIntoSingleTokenZapTx(rtoken, output, testUserAddr);
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