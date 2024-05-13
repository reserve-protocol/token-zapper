import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import { ChainIds } from './configuration/ReserveAddresses';
import { Address, createEnso, createKyberswap, fromProvider } from './index';
dotenv.config();
const run = async () => {
    const provider = new ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_ARBI);
    const testUserAddr = Address.from(ethers.Wallet.createRandom().connect(provider).address);
    {
        const universe = await fromProvider(provider, ChainIds.Arbitrum);
        await universe.initialized;
        fs.writeFileSync('./src.ts/configuration/data/arbitrum/tokens.json', JSON.stringify([...universe.tokens.values()].map((i) => i.toJson()), null, 2));
        universe.addTradeVenue(createEnso('enso', universe, 1));
        universe.addTradeVenue(createKyberswap('Kyber', universe));
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