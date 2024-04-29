"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBaseZapper = void 0;
const Address_1 = require("../base/Address");
const base_1 = require("./base");
const loadBaseTokenList_1 = require("./loadBaseTokenList");
const setupRTokens_1 = require("./setupRTokens");
const setupStargate_1 = require("./setupStargate");
const setupStargateWrapper_1 = require("./setupStargateWrapper");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const OffchainOracleRegistry_1 = require("../oracles/OffchainOracleRegistry");
const ZapperAggregatorOracle_1 = require("../oracles/ZapperAggregatorOracle");
const setupAaveV3_1 = require("./setupAaveV3");
const setupAerodromeRouter_1 = require("./setupAerodromeRouter");
const setupCompV3_1 = require("./setupCompV3");
const setupUniswapRouter_1 = require("./setupUniswapRouter");
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
    const [comets, cTokenWrappers] = await Promise.all([
        Promise.all(base_1.PROTOCOL_CONFIGS.compV3.comets.map((a) => universe.getToken(Address_1.Address.from(a)))),
        Promise.all(base_1.PROTOCOL_CONFIGS.compV3.wrappers.map((a) => universe.getToken(Address_1.Address.from(a)))),
    ]);
    const compV3 = await (0, setupCompV3_1.setupCompoundV3)(universe, {
        comets,
        cTokenWrappers,
    });
    const aaveV3 = await (0, setupAaveV3_1.setupAaveV3)(universe, Address_1.Address.from(base_1.PROTOCOL_CONFIGS.aaveV3.pool), await Promise.all(base_1.PROTOCOL_CONFIGS.aaveV3.wrappers.map((a) => universe.getToken(Address_1.Address.from(a)))));
    // Set up stargate
    await (0, setupStargate_1.setupStargate)(universe, base_1.PROTOCOL_CONFIGS.stargate.tokens, base_1.PROTOCOL_CONFIGS.stargate.router, {});
    await (0, setupStargateWrapper_1.setupStargateWrapper)(universe, base_1.PROTOCOL_CONFIGS.stargate.wrappers, {});
    // Set up RTokens defined in the config
    await (0, setupRTokens_1.loadRTokens)(universe);
    const uniV3 = await (0, setupUniswapRouter_1.setupUniswapRouter)(universe);
    await (0, setupAerodromeRouter_1.setupAerodromeRouter)(universe);
    return {
        uni: uniV3,
        curve: null,
        compV3,
        aaveV3,
    };
};
exports.setupBaseZapper = setupBaseZapper;
//# sourceMappingURL=setupBaseZapper.js.map