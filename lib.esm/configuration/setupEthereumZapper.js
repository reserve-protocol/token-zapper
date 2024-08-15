import { loadCompV2Deployment } from '../action/CTokens';
import { LidoDeployment } from '../action/Lido';
import { Address } from '../base/Address';
import { CHAINLINK } from '../base/constants';
import { PROTOCOL_CONFIGS } from './ethereum';
import { setupAaveV2 } from './setupAaveV2';
import { setupAaveV3 } from './setupAaveV3';
import { setupChainlinkRegistry } from './setupChainLink';
import { setupCompoundV3 } from './setupCompV3';
import { setupConvexStakingWrappers } from './setupConvexStakingWrappers';
import { CurveIntegration } from './setupCurve';
import { setupERC4626 } from './setupERC4626';
import { loadEthereumTokenList } from './setupEthereumTokenList';
import { setupFrxETH } from './setupFrxETH';
import { setupRETH } from './setupRETH';
import { setupUniswapRouter } from './setupUniswapRouter';
import { setupWrappedGasToken } from './setupWrappedGasToken';
export const setupEthereumZapper = async (universe) => {
    await loadEthereumTokenList(universe);
    const eth = universe.nativeToken;
    const commonTokens = universe.commonTokens;
    // Searcher depends on a way to price tokens
    // Below we set up the chainlink registry to price tokens
    await universe.addSingleTokenPriceOracle({
        token: commonTokens.apxETH,
        oracleAddress: Address.from('0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea'),
        priceToken: eth,
    });
    setupChainlinkRegistry(universe, PROTOCOL_CONFIGS.chainLinkRegistry, [
        [commonTokens.WBTC, CHAINLINK.BTC],
        [commonTokens.WETH, CHAINLINK.ETH],
        [eth, CHAINLINK.ETH],
        [commonTokens.pxETH, CHAINLINK.ETH],
    ], [
        [
            commonTokens.reth,
            {
                uoaToken: eth,
                derivedTokenUnit: CHAINLINK.ETH,
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
    // console.log(aaveV2.describe().join('\n'))
    const curve = await CurveIntegration.load(universe, PROTOCOL_CONFIGS.curve);
    universe.integrations.curve = curve;
    universe.addTradeVenue(curve.venue);
    universe.addIntegration('convex', await setupConvexStakingWrappers(universe, curve, PROTOCOL_CONFIGS.convex));
    universe.addIntegration('aaveV3', await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3));
    // console.log(aaveV3.describe().join('\n'))
    const uniswap = universe.addIntegration('uniswapV3', await setupUniswapRouter(universe));
    universe.addTradeVenue(uniswap);
    // Set up RETH
    const reth = universe.addIntegration('rocketpool', await setupRETH(universe, PROTOCOL_CONFIGS.rocketPool));
    universe.addTradeVenue(reth);
    // Set up Lido
    universe.addIntegration('lido', await LidoDeployment.load(universe, PROTOCOL_CONFIGS.lido));
    await setupFrxETH(universe, PROTOCOL_CONFIGS.frxETH);
    // Set up various ERC4626 tokens
    await Promise.all(PROTOCOL_CONFIGS.erc4626.map(async ([addr, proto]) => {
        const vault = await setupERC4626(universe, {
            vaultAddress: addr,
            protocol: proto,
            slippage: 5n,
        });
        return vault;
    }));
    console.log('Etheruem zapper setup complete');
};
//# sourceMappingURL=setupEthereumZapper.js.map