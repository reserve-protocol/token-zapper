"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBaseZapper = void 0;
const Address_1 = require("../base/Address");
const base_1 = require("./base");
const loadBaseTokenList_1 = require("./loadBaseTokenList");
const setupStargate_1 = require("./setupStargate");
const setupStargateWrapper_1 = require("./setupStargateWrapper");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const OffchainOracleRegistry_1 = require("../oracles/OffchainOracleRegistry");
const setupCompV3_1 = require("./setupCompV3");
const setupAaveV3_1 = require("./setupAaveV3");
const setupUniswapRouter_1 = require("./setupUniswapRouter");
const setupAerodromeRouter_1 = require("./setupAerodromeRouter");
const setupBaseZapper = async (universe) => {
    await (0, loadBaseTokenList_1.loadBaseTokenList)(universe);
    const wsteth = await universe.getToken(Address_1.Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452'));
    const registry = new OffchainOracleRegistry_1.OffchainOracleRegistry(universe.config.requoteTolerance, 'BaseOracles', async (token) => {
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
    Object.entries(base_1.PROTOCOL_CONFIGS.usdPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.usd.address, Address_1.Address.from(oracleAddress));
    });
    Object.entries(base_1.PROTOCOL_CONFIGS.ethPriceOracles).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.nativeToken.address, Address_1.Address.from(oracleAddress));
    });
    universe.oracles.push(registry);
    await (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    // Load compound v3
    universe.addIntegration('compoundV3', await (0, setupCompV3_1.setupCompoundV3)('CompV3', universe, base_1.PROTOCOL_CONFIGS.compV3));
    // Set up AAVEV2
    universe.addIntegration('aaveV3', await (0, setupAaveV3_1.setupAaveV3)(universe, base_1.PROTOCOL_CONFIGS.aaveV3));
    universe.addTradeVenue(universe.addIntegration('uniswapV3', await (0, setupUniswapRouter_1.setupUniswapRouter)(universe)));
    universe.addTradeVenue(universe.addIntegration('aerodrome', await (0, setupAerodromeRouter_1.setupAerodromeRouter)(universe)));
    universe.preferredRTokenInputToken.set(universe.rTokens.bsd, universe.commonTokens.WETH);
    universe.preferredRTokenInputToken.set(universe.rTokens.hyUSD, universe.commonTokens.USDC);
    // Set up stargate
    await (0, setupStargate_1.setupStargate)(universe, base_1.PROTOCOL_CONFIGS.stargate.tokens, base_1.PROTOCOL_CONFIGS.stargate.router, {});
    await (0, setupStargateWrapper_1.setupStargateWrapper)(universe, base_1.PROTOCOL_CONFIGS.stargate.wrappers, {});
};
exports.setupBaseZapper = setupBaseZapper;
//# sourceMappingURL=setupBaseZapper.js.map