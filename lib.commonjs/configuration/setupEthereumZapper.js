"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEthereumZapper = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const constants_1 = require("../base/constants");
const setupCompound_1 = require("./setupCompound");
const setupSAToken_1 = require("./setupSAToken");
const setupLido_1 = require("./setupLido");
const setupRETH_1 = require("./setupRETH");
const setupERC4626_1 = require("./setupERC4626");
const setupCompoundV3_1 = require("./setupCompoundV3");
const setupChainLink_1 = require("./setupChainLink");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const setupCurveOnEthereum_1 = require("./setupCurveOnEthereum");
const setupEthereumTokenList_1 = require("./setupEthereumTokenList");
const setupRTokens_1 = require("./setupRTokens");
const ethereum_1 = require("./ethereum");
const convertWrapperTokenAddressesIntoWrapperTokenPairs_1 = require("./convertWrapperTokenAddressesIntoWrapperTokenPairs");
const underlying_json_1 = tslib_1.__importDefault(require("./data/ethereum/underlying.json"));
const setupSAV3Tokens_1 = require("./setupSAV3Tokens");
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
    ], [
        [
            universe.commonTokens.reth,
            {
                uoaToken: universe.nativeToken,
                derivedTokenUnit: chainLinkETH,
            },
        ],
    ]);
    (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    // Set up compound
    const cTokens = await Promise.all((await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.compound.markets, underlying_json_1.default)).map(async (a) => ({
        ...a,
        collaterals: await Promise.all((ethereum_1.PROTOCOL_CONFIGS.compound.collaterals[a.wrappedToken.address.address] ?? []).map((a) => universe.getToken(Address_1.Address.from(a)))),
    })));
    await (0, setupCompound_1.setupCompoundLike)(universe, {
        cEth: await universe.getToken(Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.compound.cEther)),
        comptroller: Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.compound.comptroller),
    }, cTokens);
    // Set up flux finance
    const fTokens = await Promise.all((await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.fluxFinance.markets, underlying_json_1.default)).map(async (a) => ({
        ...a,
        collaterals: await Promise.all((ethereum_1.PROTOCOL_CONFIGS.fluxFinance.collaterals[a.wrappedToken.address.address] ?? []).map((a) => universe.getToken(Address_1.Address.from(a)))),
    })));
    await (0, setupCompound_1.setupCompoundLike)(universe, {
        comptroller: Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.fluxFinance.comptroller),
    }, fTokens);
    // Load compound v3
    const compoundV3Markets = await Promise.all(ethereum_1.PROTOCOL_CONFIGS.compoundV3.markets.map(async (a) => {
        return {
            baseToken: await universe.getToken(Address_1.Address.from(a.baseToken)),
            receiptToken: await universe.getToken(Address_1.Address.from(a.receiptToken)),
            vaults: await Promise.all(a.vaults.map((vault) => universe.getToken(Address_1.Address.from(vault)))),
        };
    }));
    await (0, setupCompoundV3_1.setupCompoundV3)(universe, compoundV3Markets);
    // Set up AAVEV2
    const saTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.aavev2.tokenWrappers, underlying_json_1.default);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => (0, setupSAToken_1.setupSAToken)(universe, wrappedToken, underlying)));
    // Set up RETH
    // if (0) {
    await (0, setupRETH_1.setupRETH)(universe, ethereum_1.PROTOCOL_CONFIGS.rocketPool.reth, ethereum_1.PROTOCOL_CONFIGS.rocketPool.router);
    // }
    // Set up Lido
    await (0, setupLido_1.setupLido)(universe, ethereum_1.PROTOCOL_CONFIGS.lido.steth, ethereum_1.PROTOCOL_CONFIGS.lido.wsteth);
    await (0, setupERC4626_1.setupERC4626)(universe, ethereum_1.PROTOCOL_CONFIGS.erc4626, underlying_json_1.default);
    // Set up RTokens defined in the config
    await (0, setupRTokens_1.loadRTokens)(universe);
    const curve = await (0, setupCurveOnEthereum_1.initCurveOnEthereum)(universe, ethereum_1.PROTOCOL_CONFIGS.convex.booster).catch((e) => {
        console.log('Failed to intialize curve');
        console.log(e);
        return null;
    });
    const aaveWrapperToUnderlying = {
        '0x093cB4f405924a0C468b43209d5E466F1dd0aC7d': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        '0x1576B2d7ef15a2ebE9C22C8765DD9c1EfeA8797b': '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
    };
    const saV3Tokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.aavev3.tokenWrappers, aaveWrapperToUnderlying);
    await Promise.all(saV3Tokens.map(({ underlying, wrappedToken }) => (0, setupSAV3Tokens_1.setupSAV3Token)(universe, wrappedToken, underlying)));
    return {
        curve,
    };
};
exports.setupEthereumZapper = setupEthereumZapper;
//# sourceMappingURL=setupEthereumZapper.js.map