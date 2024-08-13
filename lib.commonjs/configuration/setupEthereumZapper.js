"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEthereumZapper = void 0;
const CTokens_1 = require("../action/CTokens");
const Lido_1 = require("../action/Lido");
const Address_1 = require("../base/Address");
const constants_1 = require("../base/constants");
const ethereum_1 = require("./ethereum");
const setupAaveV2_1 = require("./setupAaveV2");
const setupAaveV3_1 = require("./setupAaveV3");
const setupChainLink_1 = require("./setupChainLink");
const setupCompV3_1 = require("./setupCompV3");
const setupConvexStakingWrappers_1 = require("./setupConvexStakingWrappers");
const setupCurve_1 = require("./setupCurve");
const setupERC4626_1 = require("./setupERC4626");
const setupEthereumTokenList_1 = require("./setupEthereumTokenList");
const setupFrxETH_1 = require("./setupFrxETH");
const setupRETH_1 = require("./setupRETH");
const setupUniswapRouter_1 = require("./setupUniswapRouter");
const setupWrappedGasToken_1 = require("./setupWrappedGasToken");
const setupEthereumZapper = async (universe) => {
    await (0, setupEthereumTokenList_1.loadEthereumTokenList)(universe);
    const eth = universe.nativeToken;
    const commonTokens = universe.commonTokens;
    // Searcher depends on a way to price tokens
    // Below we set up the chainlink registry to price tokens
    await universe.addSingleTokenPriceOracle({
        token: commonTokens.apxETH,
        oracleAddress: Address_1.Address.from('0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea'),
        priceToken: eth,
    });
    (0, setupChainLink_1.setupChainlinkRegistry)(universe, ethereum_1.PROTOCOL_CONFIGS.chainLinkRegistry, [
        [commonTokens.WBTC, constants_1.CHAINLINK.BTC],
        [commonTokens.WETH, constants_1.CHAINLINK.ETH],
        [eth, constants_1.CHAINLINK.ETH],
        [commonTokens.pxETH, constants_1.CHAINLINK.ETH],
    ], [
        [
            commonTokens.reth,
            {
                uoaToken: eth,
                derivedTokenUnit: constants_1.CHAINLINK.ETH,
            },
        ],
    ]);
    await (0, setupWrappedGasToken_1.setupWrappedGasToken)(universe);
    // Set up compound
    universe.addIntegration('compoundV2', await (0, CTokens_1.loadCompV2Deployment)('CompV2', universe, ethereum_1.PROTOCOL_CONFIGS.compoundV2));
    universe.addIntegration('fluxFinance', await (0, CTokens_1.loadCompV2Deployment)('FluxFinance', universe, ethereum_1.PROTOCOL_CONFIGS.fluxFinance));
    // Load compound v3
    universe.addIntegration('compoundV3', await (0, setupCompV3_1.setupCompoundV3)('CompV3', universe, ethereum_1.PROTOCOL_CONFIGS.compV3));
    // Set up AAVEV2
    universe.addIntegration('aaveV2', await (0, setupAaveV2_1.setupAaveV2)(universe, ethereum_1.PROTOCOL_CONFIGS.aavev2));
    // console.log(aaveV2.describe().join('\n'))
    const curve = await setupCurve_1.CurveIntegration.load(universe, ethereum_1.PROTOCOL_CONFIGS.curve);
    universe.integrations.curve = curve;
    universe.addTradeVenue(curve.venue);
    universe.addIntegration('convex', await (0, setupConvexStakingWrappers_1.setupConvexStakingWrappers)(universe, curve, ethereum_1.PROTOCOL_CONFIGS.convex));
    universe.addIntegration('aaveV3', await (0, setupAaveV3_1.setupAaveV3)(universe, ethereum_1.PROTOCOL_CONFIGS.aaveV3));
    // console.log(aaveV3.describe().join('\n'))
    const uniswap = universe.addIntegration('uniswapV3', await (0, setupUniswapRouter_1.setupUniswapRouter)(universe));
    universe.addTradeVenue(uniswap);
    // Set up RETH
    const reth = universe.addIntegration('rocketpool', await (0, setupRETH_1.setupRETH)(universe, ethereum_1.PROTOCOL_CONFIGS.rocketPool));
    universe.addTradeVenue(reth);
    // Set up Lido
    universe.addIntegration('lido', await Lido_1.LidoDeployment.load(universe, ethereum_1.PROTOCOL_CONFIGS.lido));
    await (0, setupFrxETH_1.setupFrxETH)(universe, ethereum_1.PROTOCOL_CONFIGS.frxETH);
    // Set up various ERC4626 tokens
    await Promise.all(ethereum_1.PROTOCOL_CONFIGS.erc4626.map(async ([addr, proto]) => {
        const vault = await (0, setupERC4626_1.setupERC4626)(universe, {
            vaultAddress: addr,
            protocol: proto,
            slippage: 5n,
        });
        return vault;
    }));
    console.log('Etheruem zapper setup complete');
};
exports.setupEthereumZapper = setupEthereumZapper;
//# sourceMappingURL=setupEthereumZapper.js.map