import { DepositAction, WithdrawAction } from '../action/WrappedNative';
import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens';
import { BurnRTokenAction, MintRTokenAction } from '../action/RTokens';
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { Address } from '../base/Address';
import { StaticConfig } from './StaticConfig';
import { Oracle } from '../oracles';
import { loadTokens } from './loadTokens';
import { ETHToRETH, RETHToETH } from '../action/REth';
import { constants } from 'ethers';
import { ContractCall } from '../base';
import { BurnWStETH, MintWStETH } from '../action/WStEth';
import { BurnStETH, MintStETH } from '../action/StEth';
const defineRToken = (universe, rToken, basket) => {
    const basketHandler = {
        basketTokens: basket.map((i) => i.token),
        unitBasket: basket,
        rToken: rToken,
        basketNonce: 0,
    };
    universe.defineMintable(new MintRTokenAction(universe, basketHandler), new BurnRTokenAction(universe, basketHandler));
};
const initialize = async (universe) => {
    loadTokens(universe, require('./data/ethereum/tokens.json'));
    const fUSDC = await universe.getToken(Address.from('0x465a5a630482f3abD6d3b84B39B29b07214d19e5'));
    const fDAI = await universe.getToken(Address.from('0xe2bA8693cE7474900A045757fe0efCa900F6530b'));
    const saUSDT = await universe.getToken(Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'));
    const cUSDT = await universe.getToken(Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9'));
    const saUSDC = await universe.getToken(Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986'));
    const cUSDC = await universe.getToken(Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563'));
    const eUSD = universe.createToken(Address.from('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'), 'eUSD', 'Electric Dollar', 18);
    const ETHPlus = universe.createToken(Address.from('0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'), 'ETH+', 'ETH Plus', 18);
    universe.rTokens.eUSD = eUSD;
    universe.rTokens['ETH+'] = ETHPlus;
    const USDT = universe.commonTokens.USDT;
    const USDC = universe.commonTokens.USDC;
    const DAI = universe.commonTokens.DAI;
    const WETH = universe.commonTokens.ERC20ETH;
    const prices = new Map([
        [USDT, universe.usd.one],
        [WETH, universe.usd.fromDecimal('1750')],
    ]);
    universe.oracles.push(new Oracle('Test', async (token) => {
        return prices.get(token) ?? null;
    }));
    universe.defineMintable(new DepositAction(universe, WETH), new WithdrawAction(universe, WETH));
    const saTokens = [
        { underlying: USDT, saToken: saUSDT, rate: 1110924415157506442300940896n },
        { underlying: USDC, saToken: saUSDC, rate: 1084799248366747993839600567n },
    ];
    const cTokens = [
        { underlying: USDT, cToken: cUSDT, rate: 222352483123917n },
        { underlying: USDC, cToken: cUSDC, rate: 227824756984310n },
        { underlying: USDC, cToken: fUSDC, rate: 20173073936250n },
        { underlying: DAI, cToken: fDAI, rate: 201658648975913110959308192n },
    ];
    for (const saToken of saTokens) {
        const rate = {
            value: saToken.rate,
        };
        universe.defineMintable(new MintSATokensAction(universe, saToken.underlying, saToken.saToken, rate), new BurnSATokensAction(universe, saToken.underlying, saToken.saToken, rate));
    }
    for (const cToken of cTokens) {
        const rate = {
            value: cToken.rate,
        };
        universe.defineMintable(new MintCTokenAction(universe, cToken.underlying, cToken.cToken, rate), new BurnCTokenAction(universe, cToken.underlying, cToken.cToken, rate));
    }
    const reth = await universe.getToken(Address.from('0xae78736Cd615f374D3085123A210448E74Fc6393'));
    const rethRouterAddress = Address.from('0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C');
    const mockPortions = [constants.Zero, constants.Zero];
    const rETHToETHRate = reth.from('1.06887');
    const ETHToRETHRate = universe.nativeToken.one.div(rETHToETHRate.into(universe.nativeToken));
    const rethRouter = {
        reth,
        gasEstimate() {
            return 250000n;
        },
        async optimiseToREth(qtyETH) {
            return {
                portions: mockPortions,
                amountOut: qtyETH.mul(ETHToRETHRate).into(reth),
                contractCall: new ContractCall(Buffer.alloc(0), rethRouterAddress, qtyETH.amount, 0n),
            };
        },
        async optimiseFromREth(qtyRETH) {
            return {
                portions: mockPortions,
                amountOut: qtyRETH.mul(rETHToETHRate).into(universe.nativeToken),
                contractCall: new ContractCall(Buffer.alloc(0), rethRouterAddress, 0n, 0n),
            };
        },
    };
    const ethToREth = new ETHToRETH(universe, rethRouter);
    const rEthtoEth = new RETHToETH(universe, rethRouter);
    universe.defineMintable(ethToREth, rEthtoEth);
    const stETH = await universe.getToken(Address.from('0xae7ab96520de3a18e5e111b5eaab095312d7fe84'));
    const wstETH = await universe.getToken(Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'));
    universe.defineMintable(new MintStETH(universe, stETH, {
        async quoteMint(qtyEth) {
            return qtyEth.into(stETH);
        },
    }), new BurnStETH(universe, stETH, {
        async quoteBurn(qtyStETH) {
            return qtyStETH.into(universe.nativeToken);
        },
    }));
    // Test env exchange rate is harded to:
    const stEthPrWStEth = stETH.from('1.1189437171');
    const wstEthPrStEth = stETH.one.div(stEthPrWStEth).into(wstETH);
    universe.defineMintable(new MintWStETH(universe, stETH, wstETH, {
        async quoteMint(qtyStEth) {
            return qtyStEth.into(wstETH).mul(wstEthPrStEth);
        },
    }), new BurnWStETH(universe, stETH, wstETH, {
        async quoteBurn(qtyWstEth) {
            return qtyWstEth.into(stETH).mul(stEthPrWStEth);
        },
    }));
    // Defines the by now 'old' eUSD.
    defineRToken(universe, eUSD, [
        saUSDT.fromDecimal('0.225063'),
        USDT.fromDecimal('0.500004'),
        cUSDT.fromDecimal('11.24340940'),
    ]);
    // ETH+
    defineRToken(universe, ETHPlus, [
        reth.from('0.5').div(rETHToETHRate),
        wstETH.from('0.5').mul(wstEthPrStEth),
    ]);
};
const ethereumConfig = {
    config: new StaticConfig({
        symbol: 'ETH',
        decimals: 18,
        name: 'Ether',
    }, {
        convex: Address.from('0xF403C135812408BFbE8713b5A23a04b3D48AAE31'),
        zapperAddress: Address.from('0x0000000000000000000000000000000000000042'),
        executorAddress: Address.from('0x0000000000000000000000000000000000000043'),
        rTokenDeployments: {
            eUSD: null,
            'ETH+': null,
            hyUSD: null,
            RSD: null,
        },
        // Points to aave address providers
        aavev2: Address.from('0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'),
        aavev3: Address.from('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'),
        // Just points to their vault
        balancer: Address.from('0xBA12222222228d8Ba445958a75a0704d566BF2C8'),
        // Curve does it's own thing..
        commonTokens: {
            USDC: Address.from('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
            USDT: Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7'),
            DAI: Address.from('0x6b175474e89094c44da98b954eedeac495271d0f'),
            WBTC: Address.from('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
            // These two are the same on eth, arbi, opti, but will differ on polygon
            ERC20ETH: Address.from('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
            ERC20GAS: Address.from('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        },
    }, {
        enable: false,
    }),
    initialize,
};
export default ethereumConfig;
//# sourceMappingURL=testEnvironment.js.map