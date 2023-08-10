"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEthereumZapper = void 0;
const Address_1 = require("../base/Address");
const constants_1 = require("../base/constants");
const setupCompound_1 = require("./setupCompound");
const setupSAToken_1 = require("./setupSAToken");
const setupLido_1 = require("./setupLido");
const setupRETH_1 = require("./setupRETH");
const setupChainLink_1 = require("./setupChainLink");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const setupCurveOnEthereum_1 = require("./setupCurveOnEthereum");
const setupEthereumTokenList_1 = require("./setupEthereumTokenList");
const setupRTokens_1 = require("./setupRTokens");
const ethereum_1 = require("./ethereum");
const convertWrapperTokenAddressesIntoWrapperTokenPairs_1 = require("./convertWrapperTokenAddressesIntoWrapperTokenPairs");
const setupEthereumZapper = async (universe) => {
    await (0, setupEthereumTokenList_1.loadEthereumTokenList)(universe);
    // Searcher depends on a way to price tokens
    // Below we set up the chainlink registry to price tokens
    const chainLinkETH = Address_1.Address.from(constants_1.GAS_TOKEN_ADDRESS);
    const chainLinkBTC = Address_1.Address.from(constants_1.CHAINLINK_BTC_TOKEN_ADDRESS);
    (0, setupChainLink_1.setupChainLink)(universe, ethereum_1.PROTOCOL_CONFIGS.chainLinkRegistry, [
        [universe.commonTokens.WBTC, chainLinkBTC],
        [universe.commonTokens.WETH, chainLinkETH],
        [universe.nativeToken, chainLinkETH],
    ]);
    (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    const wrappedToUnderlyingMapping = require('./data/ethereum/underlying.json');
    // Set up compound
    const cTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.compound.markets, wrappedToUnderlyingMapping);
    await (0, setupCompound_1.setupCompoundLike)(universe, {
        cEth: await universe.getToken(Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.compound.cEther)),
        comptroller: Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.compound.comptroller),
    }, cTokens);
    // Set up flux finance
    const fTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.fluxFinance.markets, wrappedToUnderlyingMapping);
    await (0, setupCompound_1.setupCompoundLike)(universe, {
        comptroller: Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.fluxFinance.comptroller),
    }, fTokens);
    // Set up AAVEV2
    const saTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.aavev2.tokenWrappers, wrappedToUnderlyingMapping);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => (0, setupSAToken_1.setupSAToken)(universe, wrappedToken, underlying)));
    // Set up RETH
    await (0, setupRETH_1.setupRETH)(universe, ethereum_1.PROTOCOL_CONFIGS.rocketPool.reth, ethereum_1.PROTOCOL_CONFIGS.rocketPool.router);
    // Set up Lido
    await (0, setupLido_1.setupLido)(universe, ethereum_1.PROTOCOL_CONFIGS.lido.steth, ethereum_1.PROTOCOL_CONFIGS.lido.wsteth);
    // Set up RTokens defined in the config
    await (0, setupRTokens_1.loadRTokens)(universe);
    await (0, setupCurveOnEthereum_1.initCurveOnEthereum)(universe, ethereum_1.PROTOCOL_CONFIGS.convex.booster);
};
exports.setupEthereumZapper = setupEthereumZapper;
//# sourceMappingURL=setupEthereumZapper.js.map