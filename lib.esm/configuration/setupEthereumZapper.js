import { Address } from '../base/Address';
import { CHAINLINK_BTC_TOKEN_ADDRESS, GAS_TOKEN_ADDRESS, } from '../base/constants';
import { PROTOCOL_CONFIGS } from './ethereum';
import { setupAaveV3 } from './setupAaveV3';
import { setupChainLink as setupChainLinkRegistry } from './setupChainLink';
import { initCurveOnEthereum } from './setupCurveOnEthereum';
import { setupERC4626 } from './setupERC4626';
import { loadEthereumTokenList } from './setupEthereumTokenList';
import { setupRETH } from './setupRETH';
import { setupCompoundV3 } from './setupCompV3';
import { setupUniswapRouter } from './setupUniswapRouter';
import { setupWrappedGasToken } from './setupWrappedGasToken';
import { loadCompV2Deployment } from '../action/CTokens';
import { setupAaveV2 } from './setupAaveV2';
import { LidoDeployment } from '../action/Lido';
export const setupEthereumZapper = async (universe) => {
    await loadEthereumTokenList(universe);
    // Searcher depends on a way to price tokens
    // Below we set up the chainlink registry to price tokens
    const chainLinkETH = Address.from(GAS_TOKEN_ADDRESS);
    const chainLinkBTC = Address.from(CHAINLINK_BTC_TOKEN_ADDRESS);
    setupChainLinkRegistry(universe, PROTOCOL_CONFIGS.chainLinkRegistry, [
        [universe.commonTokens.WBTC, chainLinkBTC],
        [universe.commonTokens.WETH, chainLinkETH],
        [universe.nativeToken, chainLinkETH],
    ], [
        [
            universe.commonTokens.reth,
            {
                uoaToken: universe.nativeToken,
                derivedTokenUnit: chainLinkETH,
            },
        ],
    ]);
    await setupWrappedGasToken(universe);
    // Set up compound
    universe.addIntegration('compoundV2', await loadCompV2Deployment('CompV2', universe, PROTOCOL_CONFIGS.compoundV2));
    universe.addIntegration('fluxFinance', await loadCompV2Deployment('FluxFinance', universe, PROTOCOL_CONFIGS.fluxFinance));
    // Load compound v3
    universe.addIntegration('compoundV3', await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3));
    // Set up AAVEV2
    universe.addIntegration('aaveV2', await setupAaveV2(universe, PROTOCOL_CONFIGS.aavev2));
    const curve = universe.addIntegration('curve', (await initCurveOnEthereum(universe, PROTOCOL_CONFIGS.convex.booster, 100n))
        .venue);
    universe.addTradeVenue(curve);
    universe.addIntegration('aaveV3', await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3));
    const uniswap = universe.addIntegration('uniswapV3', await setupUniswapRouter(universe));
    universe.addTradeVenue(uniswap);
    // Set up RETH
    const reth = universe.addIntegration('rocketpool', await setupRETH(universe, PROTOCOL_CONFIGS.rocketPool));
    universe.addTradeVenue(reth);
    universe.addIntegration('lido', await LidoDeployment.load(universe, PROTOCOL_CONFIGS.lido));
    // Set up Lido
    await Promise.all(PROTOCOL_CONFIGS.erc4626.map(([addr, proto]) => setupERC4626(universe, [addr], proto, 30n)));
};
//# sourceMappingURL=setupEthereumZapper.js.map