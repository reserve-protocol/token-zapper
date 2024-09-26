import { Address } from '../base/Address';
import { PROTOCOL_CONFIGS } from './base';
import { loadBaseTokenList } from './loadBaseTokenList';
import { setupStargate } from './setupStargate';
import { setupStargateWrapper } from './setupStargateWrapper';
import { setupWrappedGasToken } from './setupWrappedGasToken';
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry';
import { setupCompoundV3 } from './setupCompV3';
import { setupAaveV3 } from './setupAaveV3';
import { setupUniswapRouter } from './setupUniswapRouter';
import { setupAerodromeRouter } from './setupAerodromeRouter';
export const setupBaseZapper = async (universe) => {
    await loadBaseTokenList(universe);
    const wsteth = await universe.getToken(Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452'));
    const registry = new OffchainOracleRegistry(universe.config.requoteTolerance, 'BaseOracles', async (token) => {
        if (token === universe.wrappedNativeToken) {
            const oracle = registry.getOracle(universe.nativeToken.address, universe.usd.address);
            if (oracle == null) {
                return null;
            }
            return universe.usd.from(await oracle.callStatic.latestAnswer());
        }
        if (token === wsteth) {
            const oraclewstethToEth = registry.getOracle(token.address, universe.nativeToken.address);
            const oracleethToUsd = registry.getOracle(universe.nativeToken.address, universe.usd.address);
            if (oraclewstethToEth == null || oracleethToUsd == null) {
                return null;
            }
            const oneWSTInETH = universe.nativeToken.from(await oraclewstethToEth.callStatic.latestAnswer());
            const oneETHInUSD = (await universe.fairPrice(universe.nativeToken.one));
            const priceOfOnewsteth = oneETHInUSD.mul(oneWSTInETH.into(universe.usd));
            return priceOfOnewsteth;
        }
        const oracle = registry.getOracle(token.address, universe.usd.address);
        if (oracle == null) {
            return null;
        }
        return universe.usd.from(await oracle.callStatic.latestAnswer());
    }, () => universe.currentBlock, universe.provider);
    Object.entries(PROTOCOL_CONFIGS.usdPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address.from(tokenAddress), universe.usd.address, Address.from(oracleAddress));
    });
    Object.entries(PROTOCOL_CONFIGS.ethPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address.from(tokenAddress), universe.nativeToken.address, Address.from(oracleAddress));
    });
    universe.oracles.push(registry);
    await setupWrappedGasToken(universe);
    // Load compound v3
    universe.addIntegration('compoundV3', await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3));
    // Set up AAVEV2
    universe.addIntegration('aaveV3', await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3));
    universe.addTradeVenue(universe.addIntegration('uniswapV3', await setupUniswapRouter(universe)));
    universe.addTradeVenue(universe.addIntegration('aerodrome', await setupAerodromeRouter(universe)));
    // universe.preferredRTokenInputToken.set(
    //   universe.rTokens.bsd,
    //   universe.commonTokens.WETH
    // )
    // universe.preferredRTokenInputToken.set(
    //   universe.rTokens.hyUSD,
    //   universe.commonTokens.USDC
    // )
    // Set up stargate
    await setupStargate(universe, PROTOCOL_CONFIGS.stargate.tokens, PROTOCOL_CONFIGS.stargate.router, {});
    await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {});
};
//# sourceMappingURL=setupBaseZapper.js.map