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
import { ChainIds } from './configuration/ReserveAddresses';
import { Universe } from './Universe';
export const configuration = {
    utils: {
        loadTokens,
    },
    makeConfig,
};
export { Searcher } from './searcher/Searcher';
export { Universe } from './Universe';
export { loadRToken } from './configuration/setupRTokens';
export { createKyberswap } from './aggregators/Kyberswap';
export { createEnso } from './aggregators/Enso';
const CHAIN_ID_TO_CONFIG = {
    [ChainIds.Mainnet]: {
        config: ethereumConfig,
        blockTime: 12,
        setup: setupEthereumZapper,
    },
    [ChainIds.Arbitrum]: {
        config: arbiConfig,
        blockTime: 0.25,
        setup: setupArbitrumZapper,
    },
    [ChainIds.Base]: {
        config: baseConfig,
        blockTime: 2,
        setup: setupBaseZapper,
    },
};
export const fromProvider = async (provider, chainId) => {
    const network = await provider.getNetwork();
    if (chainId !== network.chainId) {
        throw new Error(`provider chainId (${network.chainId}) does not match requested chainId (${chainId})`);
    }
    const { config, setup } = CHAIN_ID_TO_CONFIG[chainId];
    const universe = await Universe.createWithConfig(provider, config, async (uni) => {
        await setup(uni);
    });
    return universe;
};
//# sourceMappingURL=index.js.map