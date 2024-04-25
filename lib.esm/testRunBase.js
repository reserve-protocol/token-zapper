import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { DefaultMap } from './base/DefaultMap';
import fs from 'fs';
import { baseConfig } from './configuration/base';
import { setupBaseZapper } from './configuration/setupBaseZapper';
import { Address, Searcher, Universe, createEnso, createKyberswap, } from './index';
import { loadRToken } from './configuration/setupRTokens';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_BASE);
    const counts = new DefaultMap(() => 0);
    provider.on('debug', (event) => {
        if (event.action === 'request' && event.request.method === 'eth_call') {
            const { to, data } = event.request.params[0];
            const val = counts.get(to + '.' + data) + 1;
            counts.set(to + '.' + data, val);
        }
    });
    const walletDeployer = new ethers.Wallet(process.env.PRIVATE_KEY_DEPLOYER).connect(provider);
    const testUserAddr = Address.from(walletDeployer.address);
    {
        const universe = await Universe.createWithConfig(provider, baseConfig, async (uni) => {
            await setupBaseZapper(uni);
        });
        await universe.initialized;
        const tok = await universe.getToken(Address.from('0x57c7a87077884DECdceA596519d1d6E795C8ae89'));
        await loadRToken(universe, tok.address, Address.from('0x64661a3392195F1E9ED0237708905064AaF85AF1'));
        fs.writeFileSync('./src.ts/configuration/data/base/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        // universe.dexAggregators.push(
        //   createDefillama('DefiLlama:macha', universe, 10, protocol.Matcha)
        // )
        universe.dexAggregators.push(createEnso('Enso', universe, 10));
        universe.dexAggregators.push(createKyberswap('Kyber', universe, 10));
        // while (true) {
        const searcher = new Searcher(universe);
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            universe.nativeToken.from('10'),
            // universe.commonTokens.USDbC.from('1'),
            // universe.commonTokens.USDbC.from('5'),
            universe.commonTokens.DAI.from('1000'),
            universe.commonTokens.USDC.from('1000'),
            // universe.commonTokens.USDbC.from('10000'),
        ];
        const rtokensToMint = [universe.rTokens.hyUSD, universe.rTokens.bsd];
        provider.on('block', async (block) => {
            universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        // while (1) {
        // for (const input of inputs) {
        //   for (const rtoken of rtokensToMint) {
        //     try {
        //       counts.clear()
        //       const resMint = await searcher.findSingleInputToRTokenZap(
        //         input,
        //         rtoken,
        //         testUserAddr
        //       )
        //       const zapTx = await resMint.toTransactionWithRetry({
        //         returnDust: true,
        //         outputSlippage: 10000n,
        //       })
        //       // console.log(zapTx.describe().join('\n'))
        //       console.log(`${input} -> ${rtoken}`)
        //       console.log(zapTx.output.join(', '))
        //     } catch (e) {
        //       console.log(`${input} -> ${rtoken}`)
        //       console.log('Failed')
        //       console.log(e)
        //     }
        //   }
        // }
        // }
        for (const rtoken of [universe.rTokens.bsd.from('23')]) {
            for (const output of [
                universe.commonTokens.WETH,
                universe.commonTokens.USDC,
                universe.commonTokens.DAI,
            ]) {
                try {
                    let resBurn = await searcher.findRTokenIntoSingleTokenZapTx(rtoken, output, testUserAddr, 0.0, {
                        returnDust: true,
                        outputSlippage: 100000n,
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