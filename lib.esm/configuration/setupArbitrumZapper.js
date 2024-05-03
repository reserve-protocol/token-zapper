import { Address } from '../base/Address';
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';
import { PROTOCOL_CONFIGS } from './arbitrum';
import { loadArbitrumTokenList } from './loadArbitrumTokenList';
import { setupAaveV3 } from './setupAaveV3';
import { setupCompoundV3 } from './setupCompV3';
import { loadRTokens } from './setupRTokens';
import { setupUniswapRouter } from './setupUniswapRouter';
import { setupWrappedGasToken } from './setupWrappedGasToken';
export const setupArbitrumZapper = async (universe) => {
    // console.log('Loading tokens')
    await loadArbitrumTokenList(universe);
    // console.log('Setting up wrapped gas token')
    await setupWrappedGasToken(universe);
    // console.log('Setting up oracles')
    const wsteth = universe.commonTokens.wstETH;
    const registry = new OffchainOracleRegistry(universe.config.requoteTolerance, 'ArbiOracles', async (token) => {
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
    // console.log('ASSET -> USD oracles')
    Object.entries(PROTOCOL_CONFIGS.oracles.USD).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address.from(tokenAddress), universe.usd.address, Address.from(oracleAddress));
    });
    // console.log('ASSET -> ETH oracles')
    Object.entries(PROTOCOL_CONFIGS.oracles.ETH).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address.from(tokenAddress), universe.nativeToken.address, Address.from(oracleAddress));
    });
    universe.oracles.push(registry);
    universe.oracle = new ZapperTokenQuantityPrice(universe);
    // console.log('Setting up AAVEV3')
    const aaveV3 = await setupAaveV3(universe, Address.from(PROTOCOL_CONFIGS.aaveV3.pool), await Promise.all(PROTOCOL_CONFIGS.aaveV3.wrappers.map(async (a) => await universe.getToken(Address.from(a)))));
    // console.log('Loading Compound V3 tokens')
    const [comets, cTokenWrappers] = await Promise.all([
        Promise.all(PROTOCOL_CONFIGS.compV3.comets.map(async (a) => await universe.getToken(Address.from(a)))),
        Promise.all(PROTOCOL_CONFIGS.compV3.wrappers.map(async (a) => await universe.getToken(Address.from(a)))),
    ]);
    // console.log('Setting up Compound V3')
    const compV3 = await setupCompoundV3(universe, {
        comets,
        cTokenWrappers,
    });
    // console.log('Loading rTokens')
    await loadRTokens(universe);
    // console.log('Setting up uniswapV3 router')
    const uni = await setupUniswapRouter(universe);
    return {
        uni,
        compV3,
        aaveV3,
    };
};
//# sourceMappingURL=setupArbitrumZapper.js.map