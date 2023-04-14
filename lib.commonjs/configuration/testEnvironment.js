"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WrappedNative_1 = require("../action/WrappedNative");
const CTokens_1 = require("../action/CTokens");
const RTokens_1 = require("../action/RTokens");
const SATokens_1 = require("../action/SATokens");
const Address_1 = require("../base/Address");
const StaticConfig_1 = require("./StaticConfig");
const oracles_1 = require("../oracles");
const loadTokens_1 = require("./loadTokens");
const initialize = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, require('./data/ethereum/tokens.json'));
    const saUSDT = await universe.getToken(Address_1.Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'));
    const cUSDT = await universe.getToken(Address_1.Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'));
    const saUSDC = await universe.getToken(Address_1.Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986'));
    const cUSDC = await universe.getToken(Address_1.Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563'));
    const eUSD = universe.rTokens.eUSD;
    const USDT = universe.commonTokens.USDT;
    const USDC = universe.commonTokens.USDC;
    const weth = universe.commonTokens.ERC20ETH;
    const prices = new Map([
        [USDT, universe.usd.one],
        [weth, universe.usd.fromDecimal('1750')],
    ]);
    universe.oracles.push(new oracles_1.Oracle('Test', async (token) => {
        return prices.get(token) ?? null;
    }));
    universe.defineMintable(new WrappedNative_1.DepositAction(universe, weth), new WrappedNative_1.WithdrawAction(universe, weth));
    const quantities = [
        saUSDT.fromDecimal('0.225063'),
        USDT.fromDecimal('0.500004'),
        cUSDT.fromDecimal('11.24340940'),
    ];
    const basketHandler = {
        basketTokens: quantities.map((i) => i.token),
        unitBasket: quantities,
        rToken: eUSD,
        basketNonce: 0,
    };
    const saTokens = [
        { underlying: USDT, saToken: saUSDT, rate: 1110924415157506442300940896n },
        { underlying: USDC, saToken: saUSDC, rate: 1084799248366747993839600567n },
    ];
    const cTokens = [
        { underlying: USDT, cToken: cUSDT, rate: 222352483123917n },
        { underlying: USDC, cToken: cUSDC, rate: 227824756984310n },
    ];
    for (const saToken of saTokens) {
        const rate = {
            value: saToken.rate,
        };
        universe.defineMintable(new SATokens_1.MintSATokensAction(universe, saToken.underlying, saToken.saToken, rate), new SATokens_1.BurnSATokensAction(universe, saToken.underlying, saToken.saToken, rate));
    }
    for (const cToken of cTokens) {
        const rate = {
            value: cToken.rate,
        };
        universe.defineMintable(new CTokens_1.MintCTokenAction(universe, cToken.underlying, cToken.cToken, rate), new CTokens_1.BurnCTokenAction(universe, cToken.underlying, cToken.cToken, rate));
    }
    universe.defineMintable(new RTokens_1.MintRTokenAction(universe, basketHandler), new RTokens_1.BurnRTokenAction(universe, basketHandler));
};
const ethereumConfig = {
    config: new StaticConfig_1.StaticConfig({
        symbol: 'ETH',
        decimals: 18,
        name: 'Ether',
    }, {
        zapperAddress: Address_1.Address.fromHexString('0x0000000000000000000000000000000000000042'),
        executorAddress: Address_1.Address.fromHexString('0x0000000000000000000000000000000000000043'),
        rtokens: {
            eUSD: Address_1.Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'),
        },
        // Points to aave address providers
        aavev2: Address_1.Address.fromHexString('0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'),
        aavev3: Address_1.Address.fromHexString('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'),
        // Just points to their vault
        balancer: Address_1.Address.fromHexString('0xBA12222222228d8Ba445958a75a0704d566BF2C8'),
        // Curve does it's own thing..
        curve: false,
        commonTokens: {
            USDC: Address_1.Address.fromHexString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
            USDT: Address_1.Address.fromHexString('0xdac17f958d2ee523a2206206994597c13d831ec7'),
            DAI: Address_1.Address.fromHexString('0x6b175474e89094c44da98b954eedeac495271d0f'),
            WBTC: Address_1.Address.fromHexString('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
            // These two are the same on eth, arbi, opti, but will differ on polygon
            ERC20ETH: Address_1.Address.fromHexString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
            ERC20GAS: Address_1.Address.fromHexString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        },
    }),
    initialize,
};
exports.default = ethereumConfig;
//# sourceMappingURL=testEnvironment.js.map