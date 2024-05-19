"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupArbitrumZapper = void 0;
const Address_1 = require("../base/Address");
const OffchainOracleRegistry_1 = require("../oracles/OffchainOracleRegistry");
const ZapperAggregatorOracle_1 = require("../oracles/ZapperAggregatorOracle");
const arbitrum_1 = require("./arbitrum");
const loadArbitrumTokenList_1 = require("./loadArbitrumTokenList");
const setupAaveV3_1 = require("./setupAaveV3");
const setupCompV3_1 = require("./setupCompV3");
const setupUniswapRouter_1 = require("./setupUniswapRouter");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const setupArbitrumZapper = async (universe) => {
    // console.log('Loading tokens')
    await (0, loadArbitrumTokenList_1.loadArbitrumTokenList)(universe);
    // console.log('Setting up wrapped gas token')
    await (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    // console.log('Setting up oracles')
    const wsteth = universe.commonTokens.wstETH;
    const registry = new OffchainOracleRegistry_1.OffchainOracleRegistry(universe.config.requoteTolerance, 'ArbiOracles', async (token) => {
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
    Object.entries(arbitrum_1.PROTOCOL_CONFIGS.oracles.USD).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.usd.address, Address_1.Address.from(oracleAddress));
    });
    // console.log('ASSET -> ETH oracles')
    Object.entries(arbitrum_1.PROTOCOL_CONFIGS.oracles.ETH).map(([tokenAddress, oracleAddress]) => {
        registry.register(Address_1.Address.from(tokenAddress), universe.nativeToken.address, Address_1.Address.from(oracleAddress));
    });
    universe.oracles.push(registry);
    universe.oracle = new ZapperAggregatorOracle_1.ZapperTokenQuantityPrice(universe);
    // Load compound v3
    universe.addIntegration('compoundV3', await (0, setupCompV3_1.setupCompoundV3)('CompV3', universe, arbitrum_1.PROTOCOL_CONFIGS.compV3));
    // Set up AAVEV2
    universe.addIntegration('aaveV3', await (0, setupAaveV3_1.setupAaveV3)(universe, arbitrum_1.PROTOCOL_CONFIGS.aaveV3));
    universe.addTradeVenue(universe.addIntegration('uniswapV3', await (0, setupUniswapRouter_1.setupUniswapRouter)(universe)));
};
exports.setupArbitrumZapper = setupArbitrumZapper;
//# sourceMappingURL=setupArbitrumZapper.js.map