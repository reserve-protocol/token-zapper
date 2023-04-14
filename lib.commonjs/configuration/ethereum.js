"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CTokens_1 = require("../action/CTokens");
const RTokens_1 = require("../action/RTokens");
const SATokens_1 = require("../action/SATokens");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const ChainLinkOracle_1 = require("../oracles/ChainLinkOracle");
const StaticConfig_1 = require("./StaticConfig");
const WrappedNative_1 = require("../action/WrappedNative");
const TokenBasket_1 = require("../entities/TokenBasket");
const loadTokens_1 = require("./loadTokens");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const chainLinkETH = Address_1.Address.from('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
const chainLinkBTC = Address_1.Address.from('0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB');
const underlyingTokens = require('./data/ethereum/underlying.json');
const loadCompoundTokens = async (cEther, comptrollerAddress, universe) => {
    const allCTokens = await contracts_1.IComptroller__factory.connect(comptrollerAddress, universe.provider).getAllMarkets();
    return await Promise.all(allCTokens
        .map(Address_1.Address.from)
        .filter((address) => address !== cEther.address)
        .map(async (address) => {
        const [cToken, underlying] = await Promise.all([
            universe.getToken(address),
            universe.getToken(Address_1.Address.from(underlyingTokens[address.address])),
        ]);
        return { underlying, cToken };
    }));
};
const initialize = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, require('./data/ethereum/tokens.json'));
    const chainLinkOracle = new ChainLinkOracle_1.ChainLinkOracle(universe, Address_1.Address.from('0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'));
    chainLinkOracle.mapTokenTo(universe.commonTokens.ERC20ETH, chainLinkETH);
    chainLinkOracle.mapTokenTo(universe.commonTokens.WBTC, chainLinkBTC);
    chainLinkOracle.mapTokenTo(universe.nativeToken, chainLinkETH);
    const ETH = universe.nativeToken;
    const USDT = universe.commonTokens.USDT;
    const USDC = universe.commonTokens.USDC;
    const WETH = universe.commonTokens.ERC20GAS;
    universe.defineMintable(new WrappedNative_1.DepositAction(universe, WETH), new WrappedNative_1.WithdrawAction(universe, WETH));
    const saUSDT = await universe.getToken(Address_1.Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'));
    const saUSDC = await universe.getToken(Address_1.Address.from('0x60C384e226b120d93f3e0F4C502957b2B9C32B15'));
    // Set up cETH independently
    const cEther = await universe.getToken(Address_1.Address.from('0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'));
    await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, contracts_1.ICToken__factory, cEther, async (cEthRate, cInst) => {
        return {
            fetchRate: async () => (await cInst.exchangeRateStored()).toBigInt(),
            mint: new CTokens_1.MintCTokenAction(universe, ETH, cEther, cEthRate),
            burn: new CTokens_1.MintCTokenAction(universe, cEther, ETH, cEthRate),
        };
    });
    const saTokens = [
        { underlying: USDT, wrapped: saUSDT },
        { underlying: USDC, wrapped: saUSDC },
    ];
    const cTokens = await loadCompoundTokens(cEther, '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', universe);
    for (const { wrapped, underlying } of saTokens) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, contracts_1.IStaticATokenLM__factory, wrapped, async (rate, saInst) => {
            return {
                fetchRate: async () => (await saInst.rate()).toBigInt(),
                mint: new SATokens_1.MintSATokensAction(universe, underlying, wrapped, rate),
                burn: new SATokens_1.BurnSATokensAction(universe, underlying, wrapped, rate),
            };
        });
    }
    for (const { cToken, underlying } of cTokens) {
        await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, contracts_1.ICToken__factory, cToken, async (rate, inst) => {
            return {
                fetchRate: async () => (await inst.exchangeRateStored()).toBigInt(),
                mint: new CTokens_1.MintCTokenAction(universe, underlying, cToken, rate),
                burn: new CTokens_1.BurnCTokenAction(universe, underlying, cToken, rate),
            };
        });
    }
    universe.oracles.push(chainLinkOracle);
    if (universe.config.addresses.rtokens.eUSD != null) {
        const eUSD = universe.createToken(universe.config.addresses.rtokens.eUSD, 'eUSD', 'eUSD', 18);
        const basketHandler = new TokenBasket_1.TokenBasket(universe, Address_1.Address.fromHexString('0x6d309297ddDFeA104A6E89a132e2f05ce3828e07'), eUSD);
        await basketHandler.update();
        universe.createRefreshableEntitity(basketHandler.address, () => basketHandler.update());
        universe.defineMintable(new RTokens_1.MintRTokenAction(universe, basketHandler), new RTokens_1.BurnRTokenAction(universe, basketHandler));
    }
};
const ethereumConfig = {
    config: new StaticConfig_1.StaticConfig({
        symbol: 'ETH',
        decimals: 18,
        name: 'Ether',
    }, {
        zapperAddress: Address_1.Address.fromHexString('0xfa81b1a2f31786bfa680a9B603c63F25A2F9296b'),
        executorAddress: Address_1.Address.fromHexString('0x7fA27033835d48ea32feB34Ab7a66d05bf38DE11'),
        rtokens: {
            eUSD: Address_1.Address.fromHexString('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'),
        },
        // Points to aave address providers
        aavev2: Address_1.Address.fromHexString('0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'),
        aavev3: Address_1.Address.fromHexString('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'),
        // Just points to their vault
        balancer: Address_1.Address.fromHexString('0xBA12222222228d8Ba445958a75a0704d566BF2C8'),
        // Curve does it's own thing..
        curve: true,
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
//# sourceMappingURL=ethereum.js.map