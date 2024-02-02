import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { DefaultMap } from './base/DefaultMap';
import { baseConfig } from './configuration/base';
import { setupBaseZapper } from './configuration/setupBaseZapper';
import { Address, Searcher, Universe, createEnso } from './index';
import { wait } from './base/controlflow';
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
    const walletDeployer = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = Address.from(walletDeployer.address);
    {
        const universe = await Universe.createWithConfig(provider, baseConfig, async (uni) => {
            await setupBaseZapper(uni);
        });
        await universe.initialized;
        // universe.dexAggregators.push(
        //   createDefillama('DefiLlama:macha', universe, 10, protocol.Matcha)
        // )
        universe.dexAggregators.push(createEnso('Enso', universe, 300));
        universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        const searcher = new Searcher(universe);
        const inputs = [
            // universe.nativeToken.from('0.1'),
            // universe.nativeToken.from('0.2'),
            // universe.nativeToken.from('0.5'),
            universe.commonTokens.USDbC.from('1'),
            universe.commonTokens.USDbC.from('5'),
            universe.commonTokens.USDbC.from('10'),
            universe.commonTokens.USDbC.from('90'),
        ];
        const rtokensToMint = [universe.rTokens.hyUSD];
        console.log('Testing mints');
        for (const input of inputs) {
            for (const rtoken of rtokensToMint) {
                try {
                    const resMint = (await searcher.findTokenZapViaIssueance(input, rtoken, testUserAddr))[0];
                    const zapTx = await resMint.toTransaction({
                        returnDust: true,
                        outputSlippage: 100000n,
                    });
                    console.log(`${input} -> ${rtoken}`);
                    console.log(zapTx.describe().join('\n'));
                }
                catch (e) {
                    console.log(`${input} -> ${rtoken}`);
                    console.log('Failed');
                    console.log(e);
                }
            }
        }
        // for (const rtoken of [
        //   // universe.rTokens.hyUSD.from('1.0'),
        //   // universe.rTokens.hyUSD.from('2.0'),
        //   // universe.rTokens.hyUSD.from('3.0'),
        //   // universe.rTokens.hyUSD.from('4.0'),
        //   // universe.rTokens.hyUSD.from('5.0'),
        //   // universe.rTokens.hyUSD.from('10.0'),
        //   universe.rTokens.hyUSD.from('10.0'),
        // ]) {
        //   for (const output of [
        //     universe.commonTokens.USDbC,
        //     universe.commonTokens.USDC,
        //     universe.commonTokens.WETH,
        //   ]) {
        //     try {
        //       let resBurn = await searcher.findRTokenIntoSingleTokenZap(
        //         rtoken,
        //         output,
        //         testUserAddr,
        //         0.0
        //       )
        //       const redeemTx = await resBurn.toTransaction({
        //         returnDust: true,
        //         outputSlippage: 100000n,
        //       })
        //       console.log(`${rtoken} -> ${output}`)
        //       console.log(`${redeemTx.input} -> ${redeemTx.output.join(', ')}`)
        //     } catch (e) {
        //       console.log(e)
        //     }
        //   }
        // }
    }
    await wait(10000);
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunBase.js.map