"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBaseZapper = void 0;
const Address_1 = require("../base/Address");
const base_1 = require("./base");
const convertWrapperTokenAddressesIntoWrapperTokenPairs_1 = require("./convertWrapperTokenAddressesIntoWrapperTokenPairs");
const loadBaseTokenList_1 = require("./loadBaseTokenList");
const setupCompoundV3_1 = require("./setupCompoundV3");
const setupRTokens_1 = require("./setupRTokens");
const setupStargateWrapper_1 = require("./setupStargateWrapper");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const setupStargate_1 = require("./setupStargate");
const setupSAV3Tokens_1 = require("./setupSAV3Tokens");
const ZapperAggregatorOracle_1 = require("../oracles/ZapperAggregatorOracle");
const OffchainOracleRegistry_1 = require("../oracles/OffchainOracleRegistry");
const setupBaseZapper = async (universe) => {
    await (0, loadBaseTokenList_1.loadBaseTokenList)(universe);
    const wsteth = await universe.getToken(Address_1.Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452'));
    const registry = new OffchainOracleRegistry_1.OffchainOracleRegistry('BaseOracles', async (token) => {
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
    Object.entries(base_1.PROTOCOL_CONFIGS.usdPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.usd.address, Address_1.Address.from(oracleAddress));
    });
    Object.entries(base_1.PROTOCOL_CONFIGS.ethPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.nativeToken.address, Address_1.Address.from(oracleAddress));
    });
    universe.oracles.push(registry);
    universe.oracle = new ZapperAggregatorOracle_1.ZapperTokenQuantityPrice(universe);
    await (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    // Load compound v3
    const compoundV3Markets = await Promise.all(base_1.PROTOCOL_CONFIGS.compoundV3.markets.map(async (a) => {
        return {
            baseToken: await universe.getToken(Address_1.Address.from(a.baseToken)),
            receiptToken: await universe.getToken(Address_1.Address.from(a.receiptToken)),
            vaults: await Promise.all(a.vaults.map((vault) => universe.getToken(Address_1.Address.from(vault)))),
        };
    }));
    await (0, setupCompoundV3_1.setupCompoundV3)(universe, compoundV3Markets);
    const aaveWrapperToUnderlying = {
        '0x308447562442Cc43978f8274fA722C9C14BafF8b': '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        '0x184460704886f9F2A7F3A0c2887680867954dC6E': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    };
    // Set up AAVEV3
    const saTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, base_1.PROTOCOL_CONFIGS.aave.tokenWrappers, aaveWrapperToUnderlying);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => (0, setupSAV3Tokens_1.setupSAV3Token)(universe, wrappedToken, underlying)));
    // Set up stargate
    await (0, setupStargate_1.setupStargate)(universe, base_1.PROTOCOL_CONFIGS.stargate.tokens, base_1.PROTOCOL_CONFIGS.stargate.router, {});
    await (0, setupStargateWrapper_1.setupStargateWrapper)(universe, base_1.PROTOCOL_CONFIGS.stargate.wrappers, {});
    // Set up RTokens defined in the config
    await (0, setupRTokens_1.loadRTokens)(universe);
    return {
        curve: null,
    };
};
exports.setupBaseZapper = setupBaseZapper;
//# sourceMappingURL=setupBaseZapper.js.map