import { Address } from '../base/Address';
import { PROTOCOL_CONFIGS } from './base';
import { convertWrapperTokenAddressesIntoWrapperTokenPairs } from './convertWrapperTokenAddressesIntoWrapperTokenPairs';
import { loadBaseTokenList } from './loadBaseTokenList';
import { setupCompoundV3 } from "./setupCompoundV3";
import { loadRTokens } from './setupRTokens';
import { setupStargateWrapper } from './setupStargateWrapper';
import { setupWrappedGasToken } from './setupWrappedGasToken';
import { setupStargate } from './setupStargate';
import { setupSAV3Token } from './setupSAV3Tokens';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry';
export const setupBaseZapper = async (universe) => {
    await loadBaseTokenList(universe);
    const registry = new OffchainOracleRegistry("BaseOracles", async (token) => {
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
    universe.oracle = new ZapperTokenQuantityPrice(universe);
    await setupWrappedGasToken(universe);
    // Load compound v3
    const compoundV3Markets = await Promise.all(PROTOCOL_CONFIGS.compoundV3.markets.map(async (a) => {
        return {
            baseToken: await universe.getToken(Address.from(a.baseToken)),
            receiptToken: await universe.getToken(Address.from(a.receiptToken)),
            vaults: await Promise.all(a.vaults.map(vault => universe.getToken(Address.from(vault))))
        };
    }));
    await setupCompoundV3(universe, compoundV3Markets);
    const aaveWrapperToUnderlying = {
        "0x308447562442Cc43978f8274fA722C9C14BafF8b": "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA"
    };
    // Set up AAVEV3
    const saTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(universe, PROTOCOL_CONFIGS.aave.tokenWrappers, aaveWrapperToUnderlying);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => setupSAV3Token(universe, wrappedToken, underlying)));
    // Set up stargate
    await setupStargate(universe, PROTOCOL_CONFIGS.stargate.tokens, PROTOCOL_CONFIGS.stargate.router, {});
    await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {});
    // Set up RTokens defined in the config
    await loadRTokens(universe);
    return {
        curve: null
    };
};
//# sourceMappingURL=setupBaseZapper.js.map