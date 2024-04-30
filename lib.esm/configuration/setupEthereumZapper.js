import { Address } from '../base/Address';
import { CHAINLINK_BTC_TOKEN_ADDRESS, GAS_TOKEN_ADDRESS, } from '../base/constants';
import { convertWrapperTokenAddressesIntoWrapperTokenPairs } from './convertWrapperTokenAddressesIntoWrapperTokenPairs';
import wrappedToUnderlyingMapping from './data/ethereum/underlying.json';
import { PROTOCOL_CONFIGS } from './ethereum';
import { setupAaveV3 } from './setupAaveV3';
import { setupChainLink as setupChainLinkRegistry } from './setupChainLink';
import { setupCompoundLike } from './setupCompound';
import { initCurveOnEthereum } from './setupCurveOnEthereum';
import { setupERC4626 } from './setupERC4626';
import { loadEthereumTokenList } from './setupEthereumTokenList';
import { setupLido } from './setupLido';
import { setupRETH } from './setupRETH';
import { loadRTokens } from './setupRTokens';
import { setupCompoundV3 } from './setupCompV3';
import { setupSAToken } from './setupSAToken';
import { setupUniswapRouter } from './setupUniswapRouter';
import { setupWrappedGasToken } from './setupWrappedGasToken';
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
    setupWrappedGasToken(universe);
    // Set up compound
    const cTokens = await Promise.all((await convertWrapperTokenAddressesIntoWrapperTokenPairs(universe, PROTOCOL_CONFIGS.compound.markets, wrappedToUnderlyingMapping)).map(async (a) => ({
        ...a,
        collaterals: await Promise.all((PROTOCOL_CONFIGS.compound.collaterals[a.wrappedToken.address.address] ?? []).map((a) => universe.getToken(Address.from(a)))),
    })));
    await setupCompoundLike(universe, {
        cEth: await universe.getToken(Address.from(PROTOCOL_CONFIGS.compound.cEther)),
        comptroller: Address.from(PROTOCOL_CONFIGS.compound.comptroller),
    }, cTokens);
    // Set up flux finance
    const fTokens = await Promise.all((await convertWrapperTokenAddressesIntoWrapperTokenPairs(universe, PROTOCOL_CONFIGS.fluxFinance.markets, wrappedToUnderlyingMapping)).map(async (a) => ({
        ...a,
        collaterals: await Promise.all((PROTOCOL_CONFIGS.fluxFinance.collaterals[a.wrappedToken.address.address] ?? []).map((a) => universe.getToken(Address.from(a)))),
    })));
    await setupCompoundLike(universe, {
        comptroller: Address.from(PROTOCOL_CONFIGS.fluxFinance.comptroller),
    }, fTokens);
    // Load compound v3
    const [comets, cTokenWrappers] = await Promise.all([
        Promise.all(PROTOCOL_CONFIGS.compV3.comets.map((a) => universe.getToken(Address.from(a)))),
        Promise.all(PROTOCOL_CONFIGS.compV3.wrappers.map((a) => universe.getToken(Address.from(a)))),
    ]);
    const compV3 = await setupCompoundV3(universe, {
        comets,
        cTokenWrappers,
    });
    // Set up AAVEV2
    const saTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(universe, PROTOCOL_CONFIGS.aavev2.tokenWrappers, wrappedToUnderlyingMapping);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => setupSAToken(universe, wrappedToken, underlying)));
    // Set up RETH
    // if (0) {
    await setupRETH(universe, PROTOCOL_CONFIGS.rocketPool.reth, PROTOCOL_CONFIGS.rocketPool.router);
    // }
    // Set up Lido
    await setupLido(universe, PROTOCOL_CONFIGS.lido.steth, PROTOCOL_CONFIGS.lido.wsteth);
    await Promise.all(PROTOCOL_CONFIGS.erc4626.map(([addr, proto]) => setupERC4626(universe, [addr], proto, 30000000n)));
    // Set up RTokens defined in the config
    await loadRTokens(universe);
    const curve = await initCurveOnEthereum(universe, PROTOCOL_CONFIGS.convex.booster, 10n).catch((e) => {
        console.log('Failed to intialize curve');
        console.log(e);
        return null;
    });
    const aaveV3 = await setupAaveV3(universe, Address.from(PROTOCOL_CONFIGS.aaveV3.pool), await Promise.all(PROTOCOL_CONFIGS.aaveV3.wrappers.map((a) => universe.getToken(Address.from(a)))));
    const uni = await setupUniswapRouter(universe);
    // const internallyTradeableTokens = [
    //   universe.commonTokens.DAI,
    //   universe.commonTokens.USDC,
    //   // universe.commonTokens.USDT,
    //   // universe.commonTokens.WETH,
    //   // universe.commonTokens.WBTC,
    //   universe.commonTokens.reth,
    //   universe.commonTokens.steth
    // ]
    // for(const input of internallyTradeableTokens) {
    //   for(const output of internallyTradeableTokens) {
    //     if(input === output) {
    //       continue
    //     }
    //     uni.addTradeAction(input, output)
    //   }
    // }
    return {
        aaveV3,
        compV3,
        uni,
        curve,
    };
};
//# sourceMappingURL=setupEthereumZapper.js.map