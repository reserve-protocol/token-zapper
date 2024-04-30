"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEthereumZapper = void 0;
const tslib_1 = require("tslib");
const Address_1 = require("../base/Address");
const constants_1 = require("../base/constants");
const convertWrapperTokenAddressesIntoWrapperTokenPairs_1 = require("./convertWrapperTokenAddressesIntoWrapperTokenPairs");
const underlying_json_1 = tslib_1.__importDefault(require("./data/ethereum/underlying.json"));
const ethereum_1 = require("./ethereum");
const setupAaveV3_1 = require("./setupAaveV3");
const setupChainLink_1 = require("./setupChainLink");
const setupCompound_1 = require("./setupCompound");
const setupCurveOnEthereum_1 = require("./setupCurveOnEthereum");
const setupERC4626_1 = require("./setupERC4626");
const setupEthereumTokenList_1 = require("./setupEthereumTokenList");
const setupLido_1 = require("./setupLido");
const setupRETH_1 = require("./setupRETH");
const setupRTokens_1 = require("./setupRTokens");
const setupCompV3_1 = require("./setupCompV3");
const setupSAToken_1 = require("./setupSAToken");
const setupUniswapRouter_1 = require("./setupUniswapRouter");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
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
    const [comets, cTokenWrappers] = await Promise.all([
        Promise.all(ethereum_1.PROTOCOL_CONFIGS.compV3.comets.map((a) => universe.getToken(Address_1.Address.from(a)))),
        Promise.all(ethereum_1.PROTOCOL_CONFIGS.compV3.wrappers.map((a) => universe.getToken(Address_1.Address.from(a)))),
    ]);
    const compV3 = await (0, setupCompV3_1.setupCompoundV3)(universe, {
        comets,
        cTokenWrappers,
    });
    // Set up AAVEV2
    const saTokens = await (0, convertWrapperTokenAddressesIntoWrapperTokenPairs_1.convertWrapperTokenAddressesIntoWrapperTokenPairs)(universe, ethereum_1.PROTOCOL_CONFIGS.aavev2.tokenWrappers, underlying_json_1.default);
    await Promise.all(saTokens.map(({ underlying, wrappedToken }) => (0, setupSAToken_1.setupSAToken)(universe, wrappedToken, underlying)));
    // Set up RETH
    // if (0) {
    await (0, setupRETH_1.setupRETH)(universe, ethereum_1.PROTOCOL_CONFIGS.rocketPool.reth, ethereum_1.PROTOCOL_CONFIGS.rocketPool.router);
    // }
    // Set up Lido
    await (0, setupLido_1.setupLido)(universe, ethereum_1.PROTOCOL_CONFIGS.lido.steth, ethereum_1.PROTOCOL_CONFIGS.lido.wsteth);
    await Promise.all(ethereum_1.PROTOCOL_CONFIGS.erc4626.map(([addr, proto]) => (0, setupERC4626_1.setupERC4626)(universe, [addr], proto, 30000000n)));
    // Set up RTokens defined in the config
    await (0, setupRTokens_1.loadRTokens)(universe);
    const curve = await (0, setupCurveOnEthereum_1.initCurveOnEthereum)(universe, ethereum_1.PROTOCOL_CONFIGS.convex.booster, 10n).catch((e) => {
        console.log('Failed to intialize curve');
        console.log(e);
        return null;
    });
    const aaveV3 = await (0, setupAaveV3_1.setupAaveV3)(universe, Address_1.Address.from(ethereum_1.PROTOCOL_CONFIGS.aaveV3.pool), await Promise.all(ethereum_1.PROTOCOL_CONFIGS.aaveV3.wrappers.map((a) => universe.getToken(Address_1.Address.from(a)))));
    const uni = await (0, setupUniswapRouter_1.setupUniswapRouter)(universe);
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
exports.setupEthereumZapper = setupEthereumZapper;
//# sourceMappingURL=setupEthereumZapper.js.map