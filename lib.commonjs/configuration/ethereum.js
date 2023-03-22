"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CTokens_1 = require("../action/CTokens");
const RTokens_1 = require("../action/RTokens");
const SATokens_1 = require("../action/SATokens");
const Address_1 = require("../base/Address");
const contracts_1 = require("../contracts");
const oneInchRegistry_1 = require("../aggregators/oneInch/oneInchRegistry");
const ChainLinkOracle_1 = require("../oracles/ChainLinkOracle");
const StaticConfig_1 = require("./StaticConfig");
const DexAggregator_1 = require("../aggregators/DexAggregator");
const OneInch_1 = require("../action/OneInch");
const Swap_1 = require("../searcher/Swap");
const WrappedNative_1 = require("../action/WrappedNative");
const TokenBasket_1 = require("../entities/TokenBasket");
const loadTokens = async (universe) => {
    const tokens = require('./data/ethereum/tokens.json');
    for (const token of tokens) {
        universe.createToken(Address_1.Address.from(token.address), token.symbol, token.name, token.decimals);
    }
};
const initialize = async (universe) => {
    await loadTokens(universe);
    const rTokenSymbols = Object.keys(universe.rTokens);
    await Promise.all(rTokenSymbols.map(async (key) => {
        const addr = universe.chainConfig.config.addresses.rtokens[key];
        if (addr == null) {
            return;
        }
        universe.rTokens[key] = await universe.getToken(addr);
    }));
    const commonTokenSymbols = Object.keys(universe.commonTokens);
    await Promise.all(commonTokenSymbols.map(async (key) => {
        const addr = universe.chainConfig.config.addresses.commonTokens[key];
        if (addr == null) {
            return;
        }
        universe.commonTokens[key] = await universe.getToken(addr);
    }));
    // const mainInst = IMain__factory.connect(
    //   '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
    //   universe.provider
    // )
    const oneInchRouter = (0, oneInchRegistry_1.createEthereumRouter)();
    universe.dexAggregators.push(new DexAggregator_1.DexAggregator('1inch', async (user, destination, input, output, slippage) => {
        const swap = await oneInchRouter.swap(user, destination, input, output, slippage);
        return await new Swap_1.SwapPlan(universe, [
            OneInch_1.OneInchAction.createAction(universe, input.token, output, swap),
        ]).quote([input], destination);
    }));
    const chainLinkETH = Address_1.Address.fromHexString('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
    const chainLinkBTC = Address_1.Address.fromHexString('0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB');
    const chainLinkOracle = new ChainLinkOracle_1.ChainLinkOracle(universe, Address_1.Address.fromHexString('0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'));
    if (universe.commonTokens.ERC20ETH != null) {
        chainLinkOracle.mapTokenTo(universe.commonTokens.ERC20ETH, chainLinkETH);
    }
    if (universe.commonTokens.WBTC != null) {
        chainLinkOracle.mapTokenTo(universe.commonTokens.WBTC, chainLinkBTC);
    }
    chainLinkOracle.mapTokenTo(universe.nativeToken, chainLinkETH);
    const USDT = await universe.getToken(Address_1.Address.fromHexString('0xdac17f958d2ee523a2206206994597c13d831ec7'));
    const saUSDT = await universe.getToken(Address_1.Address.fromHexString('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'));
    const cEth = await universe.getToken(Address_1.Address.from('0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'));
    const weth = universe.commonTokens.ERC20GAS;
    const eth = universe.nativeToken;
    const cInst = contracts_1.ICToken__factory.connect(cEth.address.address, universe.provider);
    const cEthRate = {
        value: (await cInst.exchangeRateStored()).toBigInt(),
    };
    universe.createRefreshableEntitity(cEth.address, async () => {
        cEthRate.value = (await cInst.exchangeRateStored()).toBigInt();
    });
    universe.defineMintable(new CTokens_1.MintCTokenAction(universe, eth, cEth, cEthRate), new CTokens_1.MintCTokenAction(universe, cEth, eth, cEthRate));
    const saTokens = [{ underlying: USDT, saToken: saUSDT }];
    if (weth) {
        universe.defineMintable(new WrappedNative_1.DepositAction(universe, weth), new WrappedNative_1.WithdrawAction(universe, weth));
    }
    const allCTokens = await contracts_1.IComptroller__factory.connect('0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', universe.provider).getAllMarkets();
    const cTokens = await Promise.all(allCTokens
        .map(Address_1.Address.from)
        .filter((address) => address !== cEth.address)
        .map(async (address) => {
        const [cToken, underlyingAddress] = await Promise.all([
            universe.getToken(address),
            contracts_1.ICToken__factory.connect(address.address, universe.provider)
                .underlying()
                .then(Address_1.Address.from),
        ]);
        const underlying = await universe.getToken(underlyingAddress);
        return { underlying, cToken };
    }));
    for (const { saToken, underlying } of saTokens) {
        const saInst = contracts_1.IStaticATokenLM__factory.connect(saToken.address.address, universe.provider);
        const rate = {
            value: (await saInst.rate()).toBigInt(),
        };
        universe.createRefreshableEntitity(saToken.address, async () => {
            rate.value = (await cInst.exchangeRateStored()).toBigInt();
        });
        universe.defineMintable(new SATokens_1.MintSATokensAction(universe, underlying, saToken, rate), new SATokens_1.BurnSATokensAction(universe, underlying, saToken, rate));
    }
    for (const { cToken, underlying } of cTokens) {
        const cInst = contracts_1.ICToken__factory.connect(cToken.address.address, universe.provider);
        const value = (await cInst.exchangeRateStored()).toBigInt();
        const rate = {
            value,
        };
        universe.createRefreshableEntitity(cToken.address, async () => {
            rate.value = (await cInst.exchangeRateStored()).toBigInt();
        });
        universe.defineMintable(new CTokens_1.MintCTokenAction(universe, underlying, cToken, rate), new CTokens_1.BurnCTokenAction(universe, underlying, cToken, rate));
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