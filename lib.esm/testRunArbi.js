import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import { DefaultMap } from './base/DefaultMap';
import { ChainIds } from './configuration/ReserveAddresses';
import { Address, createEnso, createKyberswap, fromProvider } from './index';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_ARBI);
    const counts = new DefaultMap(() => 0);
    provider.on('debug', (event) => {
        if (event.action === 'request' && event.request.method === 'eth_call') {
            const { to, data } = event.request.params[0];
            const val = counts.get(to + '.' + data) + 1;
            counts.set(to + '.' + data, val);
        }
    });
    const testUserAddr = Address.from(ethers.Wallet.createRandom().connect(provider).address);
    {
        const universe = await fromProvider(provider, ChainIds.Arbitrum);
        await universe.initialized;
        fs.writeFileSync('./src.ts/configuration/data/arbitrum/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        universe.dexAggregators.push(createEnso('Enso', universe, 30));
        universe.dexAggregators.push(createKyberswap('Kyber', universe, 30));
        const searcher = universe.searcher;
        const inputs = [universe.commonTokens.USDC.from(100)];
        const rtokensToMint = [universe.rTokens.TEST_RTOKEN];
        provider.on('block', async (block) => {
            universe.updateBlockState(block, (await provider.getGasPrice()).toBigInt());
        });
        console.log('Testing mints');
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
    }
};
run().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=testRunArbi.js.map