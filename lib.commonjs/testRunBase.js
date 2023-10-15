"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const ethers_1 = require("ethers");
const oneInchRegistry_1 = require("./aggregators/oneInch/oneInchRegistry");
const DefaultMap_1 = require("./base/DefaultMap");
const base_1 = require("./configuration/base");
const setupBaseZapper_1 = require("./configuration/setupBaseZapper");
const index_1 = require("./index");
const controlflow_1 = require("./base/controlflow");
dotenv.config();
const ONE_INCH_PROXIES = [
    'https://cold-mouse-7d43.mig2151.workers.dev/',
    'https://blue-cake-3548.mig2151.workers.dev/',
    'https://bitter-tree-ed5a.mig2151.workers.dev/',
    'https://square-morning-0921.mig2151.workers.dev/',
];
const createProxiedOneInchAggregator = (universe, proxies) => {
    const aggregators = proxies.map((proxy) => (0, oneInchRegistry_1.createOneInchDexAggregator)(universe, {
        baseUrl: proxy,
        retryConfig: {
            maxRetries: 3,
            retryDelay: 250,
            backoff: 'CONST',
            timeout: 2000,
        },
    }));
    return new oneInchRegistry_1.DexAggregator('aggregator.1inch.proxied.' + universe.chainId, async (payerAddress, recipientDestination, input, output, slippage) => {
        try {
            for (let i = 0; i < aggregators.length; i++) {
                try {
                    const aggregator = aggregators[i];
                    return await aggregator.swap(payerAddress, recipientDestination, input, output, slippage);
                }
                catch (e) {
                    console.log(e);
                    continue;
                }
            }
            throw new Error('All aggregators failed');
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    });
};
const run = async () => {
    const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(process.env.PROVIDER_BASE);
    const counts = new DefaultMap_1.DefaultMap(() => 0);
    provider.on('debug', (event) => {
        if (event.action === 'request' && event.request.method === 'eth_call') {
            const { to, data } = event.request.params[0];
            const val = counts.get(to + '.' + data) + 1;
            counts.set(to + '.' + data, val);
        }
    });
    const walletDeployer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);
    const testUserAddr = index_1.Address.from(walletDeployer.address);
    {
        const universe = await index_1.Universe.createWithConfig(provider, base_1.baseConfig, async (uni) => {
            await (0, setupBaseZapper_1.setupBaseZapper)(uni);
        });
        await universe.initialized;
        // console.log(
        //   JSON.stringify(
        //     [...universe.tokens.values()].map(tok => tok.toJson()),
        //     null,
        //     2
        //   )
        // )
        // for(const [base, wrapped] of universe.wrappedTokens.entries()) {
        //   console.log(`  ${wrapped.mint.input.join(", ")} -> ${wrapped.mint.output.join(", ")}`)
        // }
        universe.dexAggregators.push(createProxiedOneInchAggregator(universe, ONE_INCH_PROXIES));
        universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
        const searcher = new index_1.Searcher(universe);
        try {
            console.log(await provider.getBlockNumber());
            console.log("Finding");
            let res = await searcher.findSingleInputToRTokenZap(universe.nativeToken.from("0.0005"), universe.rTokens.hyUSD, testUserAddr, 0.0);
            // console.log("???")
            // console.log(res)
            // console.log(res.describe().join("\n"))
            const tx = await res.toTransaction();
            const resp = await provider.sendTransaction(await walletDeployer.signTransaction({
                data: tx.tx.data,
                to: tx.tx.to,
                value: tx.tx.value,
                gasPrice: await provider.getGasPrice(),
                chainId: tx.tx.chainId,
                nonce: await walletDeployer.getTransactionCount(),
                type: 0,
                gasLimit: tx.gasEstimate + tx.gasEstimate / 10n,
            }));
            console.log(resp.hash);
            const receipt = await resp.wait(1);
            console.log(receipt.status);
            // let i = 0
            // while (true) {
            //   await res.toTransaction({
            //     returnDust: false
            //   })
            //   console.log("WAITING 12 SECONDS: (" + (i++) + ")")
            //   await wait(12000)
            // }
        }
        catch (e) {
            console.log(e);
        }
    }
    await (0, controlflow_1.wait)(10000);
};
run().catch(e => {
    console.log(e);
});
//# sourceMappingURL=testRunBase.js.map