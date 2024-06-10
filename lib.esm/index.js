export { Address } from './base/Address';
export { Token, TokenQuantity } from './entities/Token';
export { arbiConfig } from './configuration/arbitrum';
export { setupArbitrumZapper } from './configuration/setupArbitrumZapper';
export { baseConfig } from './configuration/base';
export { setupBaseZapper } from './configuration/setupBaseZapper';
export { ethereumConfig } from './configuration/ethereum';
export { setupEthereumZapper } from './configuration/setupEthereumZapper';
import { arbiConfig } from './configuration/arbitrum';
import { setupArbitrumZapper } from './configuration/setupArbitrumZapper';
import { baseConfig } from './configuration/base';
import { setupBaseZapper } from './configuration/setupBaseZapper';
import { ethereumConfig } from './configuration/ethereum';
import { setupEthereumZapper } from './configuration/setupEthereumZapper';
import { loadTokens } from './configuration/loadTokens';
import { makeConfig } from './configuration/ChainConfiguration';
import { ChainIds, isChainIdSupported } from './configuration/ReserveAddresses';
import { Universe } from './Universe';
import { createKyberswap } from './aggregators/Kyberswap';
import { createEnso } from './aggregators/Enso';
export const configuration = {
    utils: {
        loadTokens,
    },
    makeConfig,
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
export { createKyberswap } from './aggregators/Kyberswap';
export { createEnso } from './aggregators/Enso';
const CHAIN_ID_TO_CONFIG = {
    [ChainIds.Mainnet]: {
        config: ethereumConfig,
        blockTime: 12,
        setup: setupEthereumZapper,
        setupWithDexes: async (uni) => {
            uni.addTradeVenue(createKyberswap("Kyberswap", uni));
            uni.addTradeVenue(createEnso("Enso", uni, 1));
            await setupEthereumZapper(uni);
        }
    },
    [ChainIds.Arbitrum]: {
        config: arbiConfig,
        blockTime: 0.25,
        setup: setupArbitrumZapper,
        setupWithDexes: async (uni) => {
            uni.addTradeVenue(createKyberswap("Kyberswap", uni));
            uni.addTradeVenue(createEnso("Enso", uni, 1));
            await setupArbitrumZapper(uni);
        }
    },
    [ChainIds.Base]: {
        config: baseConfig,
        blockTime: 2,
        setup: setupBaseZapper,
        setupWithDexes: async (uni) => {
            uni.addTradeVenue(createKyberswap("Kyberswap", uni));
            uni.addTradeVenue(createEnso("Enso", uni, 1));
            await setupBaseZapper(uni);
        }
    },
};
export const fromProvider = async (provider, withDexes = true) => {
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    if (isChainIdSupported(chainId) === false) {
        throw new Error(`chainId ${chainId} is not supported`);
    }
    if (chainId !== network.chainId) {
        throw new Error(`provider chainId (${network.chainId}) does not match requested chainId (${chainId})`);
    }
    const { config, setup, setupWithDexes } = CHAIN_ID_TO_CONFIG[chainId];
    const universe = await Universe.createWithConfig(provider, config, async (uni) => {
        if (withDexes) {
            await setupWithDexes(uni);
        }
        else {
            await setup(uni);
        }
    });
    await universe.updateBlockState(await provider.getBlockNumber(), (await provider.getGasPrice()).toBigInt());
    return universe;
};
//# sourceMappingURL=index.js.map