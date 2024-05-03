import { Universe } from '../Universe';
import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens';
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { DepositAction, WithdrawAction } from '../action/WrappedNative';
import { Address } from '../base/Address';
// import { IBasket } from '../entities/TokenBasket'
import { constants } from 'ethers';
import { RETHToWETH, WETHToRETH } from '../action/REth';
import { loadTokens } from './loadTokens';
import { BurnStETH, MintStETH } from '../action/StEth';
import { BurnWStETH, MintWStETH } from '../action/WStEth';
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle';
import { ApprovalsStore } from '../searcher/ApprovalsStore';
import { makeConfig } from './ChainConfiguration';
export const testConfig = makeConfig(1, {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
}, {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ERC20GAS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
}, {
    eUSD: '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
    'ETH+': '0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8',
    hyUSD: '0xaCdf0DBA4B9839b96221a8487e9ca660a48212be',
    RSD: '0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E',
    iUSD: '0x9b451BEB49a03586e6995E5A93b9c745D068581e',
}, {
    facadeAddress: '0x2C7ca56342177343A2954C250702Fd464f4d0613',
    oldFacadeAddress: '0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C',
    zapperAddress: '0xcc2b9b55952718b210660b56ca12eb88694dc60f',
    executorAddress: '0x675D37489A7A64c051D0204e5c72a469f6558a47',
    wrappedNative: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    rtokenLens: '0xE787491314A3Da6412Ac4DeEB39c0F8EfdE1b53C',
    balanceOf: '0x6e0A0e7e63ce9622c769655B6733CEcC5AA4038D',
    curveRouterCall: '0xA18ad6dCb6B217A4c3810f865f5eEf45570024dc',
    ethBalanceOf: '0x69b27d52aF3E1012AfcB97BC77B83A7620ABB092',
    uniV3Router: '0x32F59e2881e1DC9a808DE8C37545FE33F2B617A9',
    curveStableSwapNGHelper: '0xb543FD28b0588d0ED317ab746a537840212A95ed',
}, {
    blocktime: 12000,
    blockGasLimit: 30000000n,
    requoteTolerance: 2,
    routerDeadline: 4000,
    searcherMinRoutesToProduce: 4,
    searcherMaxRoutesToProduce: 8,
    searchConcurrency: 6,
    defaultInternalTradeSlippage: 200n,
});
const defineRToken = (universe, rToken, basket) => {
    // const basketHandler: IBasket = {
    //   basketTokens: basket.map((i) => i.token),
    //   unitBasket: basket,
    //   rToken: rToken,
    //   basketNonce: 0,
    //   version: '3.1.0',
    //   async redeem(baskets) {
    //     return basket.map((i) =>
    //       i.scalarMul(baskets.amount).scalarDiv(rToken.scale)
    //     )
    //   },
    // }
    // universe.defineMintable(
    //   new MintRTokenAction(universe, basketHandler),
    //   new BurnRTokenAction(universe, basketHandler)
    // )
    universe.rTokens[rToken.symbol] = rToken;
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
    const USDT = universe.commonTokens.USDT;
    const USDC = universe.commonTokens.USDC;
    const DAI = universe.commonTokens.DAI;
    const WBTC = universe.commonTokens.WBTC;
    const WETH = universe.commonTokens.WETH;
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
        routerInstance: null,
        async optimiseToREth(qtyETH) {
            return {
                portions: mockPortions,
                amountOut: qtyETH.mul(ETHToRETHRate).into(reth),
            };
        },
        async optimiseFromREth(qtyRETH) {
            return {
                portions: mockPortions,
                amountOut: qtyRETH.mul(rETHToETHRate).into(universe.nativeToken),
            };
        },
    };
    const ethToREth = new WETHToRETH(universe, rethRouter);
    const rEthtoEth = new RETHToWETH(universe, rethRouter);
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
    const prices = new Map([
        [USDT, universe.usd.one],
        [WETH, universe.usd.fromDecimal('1750')],
        [reth, universe.usd.fromDecimal('1920')],
        [wstETH, universe.usd.fromDecimal('1900')],
        [WBTC, universe.usd.fromDecimal('29000')],
        [DAI, universe.usd.from('0.999')],
        [USDC, universe.usd.from('1.001')],
        [universe.nativeToken, universe.usd.from('1750')],
    ]);
    // const oracle = new PriceOracle(
    //   'Test',
    //   async (token) => {
    //     return prices.get(token) ?? null
    //   },
    //   () => universe.currentBlock
    // )
    // universe.oracles.push(oracle)
    universe.oracle = new ZapperTokenQuantityPrice(universe);
};
export class MockApprovalsStore extends ApprovalsStore {
    constructor() {
        super(null);
    }
    async needsApproval(token, owner, spender, amount) {
        return true;
    }
}
export const createForTest = async (c = testConfig) => {
    const universe = await Universe.createWithConfig(null, c, initialize, {
        approvalsStore: new MockApprovalsStore(),
        tokenLoader: async (_) => {
            throw new Error('Not implemented');
        },
    });
    await universe.initialized;
    return universe;
};
//# sourceMappingURL=testEnvironment.js.map