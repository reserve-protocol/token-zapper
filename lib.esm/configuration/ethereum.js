import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens';
import { Address } from '../base/Address';
import { IStaticATokenLM__factory } from '../contracts';
import { ChainLinkOracle } from '../oracles/ChainLinkOracle';
import { PostTradeAction, BasketTokenSourcingRuleApplication, } from '../searcher/BasketTokenSourcingRules';
import { StaticConfig } from './StaticConfig';
import { DepositAction, WithdrawAction } from '../action/WrappedNative';
import { loadTokens } from './loadTokens';
import { setupMintableWithRate } from './setupMintableWithRate';
import { ETHToRETH, RETHToETH, REthRouter } from '../action/REth';
import { BurnWStETH, WStETHRateProvider, MintWStETH } from '../action/WStEth';
import { BurnStETH, MintStETH, StETHRateProvider } from '../action/StEth';
import { setupCompoundLike } from './loadCompound';
import { loadCurve } from '../action/Curve';
import { setupConvexEdges as setupConvexEdge } from '../action/Convex';
import { SwapPlan } from '../searcher';
import { GAS_TOKEN_ADDRESS } from '../base/constants';
const chainLinkETH = Address.from(GAS_TOKEN_ADDRESS);
const chainLinkBTC = Address.from('0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB');
const initialize = async (universe) => {
    loadTokens(universe, require('./data/ethereum/tokens.json'));
    await Promise.all([
        universe.defineRToken(universe.config.addresses.rTokenDeployments.eUSD),
        universe.defineRToken(universe.config.addresses.rTokenDeployments['ETH+']),
        universe.defineRToken(universe.config.addresses.rTokenDeployments.hyUSD),
    ]);
    const chainLinkOracle = new ChainLinkOracle(universe, Address.from('0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf'));
    chainLinkOracle.mapTokenTo(universe.commonTokens.ERC20ETH, chainLinkETH);
    chainLinkOracle.mapTokenTo(universe.commonTokens.WBTC, chainLinkBTC);
    chainLinkOracle.mapTokenTo(universe.nativeToken, chainLinkETH);
    const MIM = await universe.getToken(Address.from('0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3'));
    const FRAX = await universe.getToken(Address.from('0x853d955acef822db058eb8505911ed77f175b99e'));
    const USDT = universe.commonTokens.USDT;
    const DAI = universe.commonTokens.DAI;
    const USDC = universe.commonTokens.USDC;
    const WETH = universe.commonTokens.ERC20GAS;
    const eUSD__FRAX_USDC = await universe.getToken(Address.from('0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F'));
    const mim_3CRV = await universe.getToken(Address.from('0x5a6A4D54456819380173272A5E8E9B9904BdF41B'));
    if (universe.chainConfig.config.curveConfig.enable) {
        const curveApi = await loadCurve(universe, 
        // Some tokens only really have one way to be soured, like:
        // USDC/USDT -> MIN/eUSD LP
        // This will make UI applications snappier as they will not have to
        // to do any searching
        require('./data/ethereum/precomputed-curve-routes.json'));
        // We will not implement the full curve router,
        // But rather some predefined paths that are likely to be used
        // by users
        curveApi.createRouterEdge(FRAX, eUSD__FRAX_USDC);
        curveApi.createRouterEdge(MIM, eUSD__FRAX_USDC);
        curveApi.createRouterEdge(USDC, eUSD__FRAX_USDC);
        curveApi.createRouterEdge(USDT, eUSD__FRAX_USDC);
        curveApi.createRouterEdge(DAI, eUSD__FRAX_USDC);
        curveApi.createRouterEdge(FRAX, mim_3CRV);
        curveApi.createRouterEdge(MIM, mim_3CRV);
        curveApi.createRouterEdge(USDC, mim_3CRV);
        curveApi.createRouterEdge(USDT, mim_3CRV);
        curveApi.createRouterEdge(DAI, mim_3CRV);
        // Add convex edges
        const stkcvxeUSD3CRV = await universe.getToken(Address.from('0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3'));
        const stkcvxMIM3LP3CRV = await universe.getToken(Address.from('0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6'));
        const stables = new Set([DAI, MIM, FRAX, USDC, USDT]);
        // This is a sourcing rule, it can be used to define 'shortcuts' or better ways to perform a Zap.
        // The rule defined below instructs the zapper to not mint stkcvxeUSD3CRv/stkcvxMIM3LP3CRV tokens
        // from scratch and instead use the curve router via some stable coin.
        // If the user is zapping one of the above stable-coins into hyUSD then we will
        // even skip the initial trade and zap directly into the LP token / staked LP token.
        // Otherwise we try to trade the user input token into USDC first. It should ideally
        // reduce the number of trades needed to perform the zap.
        const makeStkConvexSourcingRule = (depositAndStake) => async (input, unitAmount) => {
            const lpTokenQty = unitAmount.into(depositAndStake.input[0]);
            if (stables.has(input)) {
                return BasketTokenSourcingRuleApplication.singleBranch([lpTokenQty], [PostTradeAction.fromAction(depositAndStake)]);
            }
            return BasketTokenSourcingRuleApplication.singleBranch([unitAmount.into(USDC)], [
                PostTradeAction.fromAction(curveApi.createRouterEdge(USDC, lpTokenQty.token), true // Cause the Zapper to recalculate the inputs of the mints for the next step
                ),
                PostTradeAction.fromAction(depositAndStake),
            ]);
        };
        const [eUSDConvex, mimConvex] = await Promise.all([
            setupConvexEdge(universe, stkcvxeUSD3CRV),
            setupConvexEdge(universe, stkcvxMIM3LP3CRV),
        ]);
        universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxeUSD3CRV, makeStkConvexSourcingRule(eUSDConvex.depositAndStakeAction));
        universe.defineTokenSourcingRule(universe.rTokens.hyUSD, stkcvxMIM3LP3CRV, makeStkConvexSourcingRule(mimConvex.depositAndStakeAction));
        for (const stable of stables) {
            universe.tokenTradeSpecialCases.set(stable, async (input, dest) => {
                if (!stables.has(input.token)) {
                    return null;
                }
                return await new SwapPlan(universe, [
                    curveApi.createRouterEdge(input.token, stable),
                ]).quote([input], dest);
            });
        }
    }
    const wethActions = universe.defineMintable(new DepositAction(universe, WETH), new WithdrawAction(universe, WETH));
    universe.tokenTradeSpecialCases.set(universe.nativeToken, async (input, dest) => {
        if (input.token === WETH) {
            return await new SwapPlan(universe, [wethActions.burn]).quote([input], dest);
        }
        return null;
    });
    universe.tokenTradeSpecialCases.set(WETH, async (input, dest) => {
        if (input.token === universe.nativeToken) {
            return await new SwapPlan(universe, [wethActions.mint]).quote([input], dest);
        }
        return null;
    });
    const wrappedToUnderlyingMapping = require('./data/ethereum/underlying.json');
    // Compound
    await Promise.all([
        setupCompoundLike(universe, wrappedToUnderlyingMapping, {
            cEth: Address.from('0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'),
            comptroller: Address.from('0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B'),
        }),
        // // Flux finance
        setupCompoundLike(universe, wrappedToUnderlyingMapping, {
            comptroller: Address.from('0x95Af143a021DF745bc78e845b54591C53a8B3A51'),
        }),
    ]);
    const saUSDT = await universe.getToken(Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9'));
    const saUSDC = await universe.getToken(Address.from('0x60C384e226b120d93f3e0F4C502957b2B9C32B15'));
    const saTokens = [
        { underlying: USDT, wrapped: saUSDT },
        { underlying: USDC, wrapped: saUSDC },
    ];
    for (const { wrapped, underlying } of saTokens) {
        await setupMintableWithRate(universe, IStaticATokenLM__factory, wrapped, async (rate, saInst) => {
            return {
                fetchRate: async () => (await saInst.rate()).toBigInt(),
                mint: new MintSATokensAction(universe, underlying, wrapped, rate),
                burn: new BurnSATokensAction(universe, underlying, wrapped, rate),
            };
        });
    }
    universe.oracles.push(chainLinkOracle);
    const reth = await universe.getToken(Address.from('0xae78736Cd615f374D3085123A210448E74Fc6393'));
    const rethRouter = new REthRouter(universe, reth, Address.from('0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C'));
    const ethToREth = new ETHToRETH(universe, rethRouter);
    const rEthtoEth = new RETHToETH(universe, rethRouter);
    universe.defineMintable(ethToREth, rEthtoEth);
    const stETH = await universe.getToken(Address.from('0xae7ab96520de3a18e5e111b5eaab095312d7fe84'));
    const stETHRate = new StETHRateProvider(universe, stETH);
    universe.defineMintable(new MintStETH(universe, stETH, stETHRate), new BurnStETH(universe, stETH, stETHRate));
    const wstETH = await universe.getToken(Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'));
    const wstethRates = new WStETHRateProvider(universe, stETH, wstETH);
    universe.defineMintable(new MintWStETH(universe, stETH, wstETH, wstethRates), new BurnWStETH(universe, stETH, wstETH, wstethRates));
};
const ethereumConfig = {
    config: new StaticConfig({
        symbol: 'ETH',
        decimals: 18,
        name: 'Ether',
    }, {
        convex: Address.from('0xF403C135812408BFbE8713b5A23a04b3D48AAE31'),
        zapperAddress: Address.from('0xfa81b1a2f31786bfa680a9B603c63F25A2F9296b'),
        executorAddress: Address.from('0x7fA27033835d48ea32feB34Ab7a66d05bf38DE11'),
        // Must be pointing at the 'main' contracts
        rTokenDeployments: {
            eUSD: Address.from('0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a'),
            'ETH+': Address.from('0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2'),
            hyUSD: Address.from('0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37'),
        },
        // Points to aave address providers
        aavev2: Address.from('0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5'),
        aavev3: Address.from('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'),
        // Just points to their vault
        balancer: Address.from('0xBA12222222228d8Ba445958a75a0704d566BF2C8'),
        commonTokens: {
            USDC: Address.from('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
            USDT: Address.from('0xdac17f958d2ee523a2206206994597c13d831ec7'),
            DAI: Address.from('0x6b175474e89094c44da98b954eedeac495271d0f'),
            WBTC: Address.from('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'),
            // These two are the same on eth, arbi, opti, but will differ on polygon
            ERC20ETH: Address.from('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
            ERC20GAS: Address.from('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        },
    }, 
    // Curve does it's own thing..
    {
        enable: false,
    }),
    initialize,
};
export default ethereumConfig;
//# sourceMappingURL=ethereum.js.map