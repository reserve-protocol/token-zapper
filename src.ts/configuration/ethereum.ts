import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens'
import { Address } from '../base/Address'
import { IStaticATokenLM__factory } from '../contracts'
import { ChainLinkOracle } from '../oracles/ChainLinkOracle'
import { Universe } from '../Universe'
import {
  PostTradeAction,
  SourcingRule,
  BasketTokenSourcingRuleApplication,
} from '../searcher/BasketTokenSourcingRules'
import { type ChainConfiguration } from './ChainConfiguration'
import { StaticConfig } from './StaticConfig'
import { DepositAction, WithdrawAction } from '../action/WrappedNative'
import { loadTokens, JsonTokenEntry } from './loadTokens'
import { setupMintableWithRate } from './setupMintableWithRate'
import { ETHToRETH, RETHToETH, REthRouter } from '../action/REth'
import { BurnWStETH, WStETHRateProvider, MintWStETH } from '../action/WStEth'
import { BurnStETH, MintStETH, StETHRateProvider } from '../action/StEth'
import { setupCompoundLike } from './loadCompound'
import { loadCurve } from '../action/Curve'
import { setupConvexEdges as setupConvexEdge } from '../action/Convex'
import { Action } from '../action'
import { TokenQuantity } from '../entities'
import { SwapPlan } from '../searcher'
import { IRoute } from '@curvefi/api/lib/interfaces'
import { GAS_TOKEN_ADDRESS } from '../base/constants'

const chainLinkETH = Address.from(GAS_TOKEN_ADDRESS)
const chainLinkBTC = Address.from('0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB')
const initialize = async (universe: Universe) => {
  loadTokens(
    universe,
    require('./data/ethereum/tokens.json') as JsonTokenEntry[]
  )
  await Promise.all([
    universe.defineRToken(universe.config.addresses.rTokenDeployments.eUSD!),
    universe.defineRToken(universe.config.addresses.rTokenDeployments['ETH+']!),
    universe.defineRToken(universe.config.addresses.rTokenDeployments.hyUSD!),
    universe.defineRToken(universe.config.addresses.rTokenDeployments.RSD!),
    universe.defineRToken(universe.config.addresses.rTokenDeployments.iUSD!),
  ])

  const chainLinkOracle = new ChainLinkOracle(
    universe,
    Address.from('0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf')
  )

  chainLinkOracle.mapTokenTo(universe.commonTokens.ERC20ETH!, chainLinkETH)
  chainLinkOracle.mapTokenTo(universe.commonTokens.WBTC!, chainLinkBTC)
  chainLinkOracle.mapTokenTo(universe.nativeToken, chainLinkETH)

  const MIM = await universe.getToken(
    Address.from('0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3')
  )!
  const FRAX = await universe.getToken(
    Address.from('0x853d955acef822db058eb8505911ed77f175b99e')
  )
  const USDT = universe.commonTokens.USDT!
  const DAI = universe.commonTokens.DAI!
  const USDC = universe.commonTokens.USDC!
  const WETH = universe.commonTokens.ERC20GAS!

  if (universe.chainConfig.config.curveConfig.enable) {
    const curveApi = await loadCurve(
      universe,
      // Some tokens only really have one way to be soured, like:
      // USDC/USDT -> MIN/eUSD LP
      // This will make UI applications snappier as they will not have to
      // to do any searching
      require('./data/ethereum/precomputed-curve-routes.json') as Record<
        string,
        IRoute
      >
    )
    const eUSD__FRAX_USDC = await universe.getToken(
      Address.from('0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F')
    )
    const mim_3CRV = await universe.getToken(
      Address.from('0x5a6A4D54456819380173272A5E8E9B9904BdF41B')
    )

    const _3CRV = await universe.getToken(
      Address.from('0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490')
    )

    // We will not implement the full curve router,
    // But rather some predefined paths that are likely to be used
    // by users

    curveApi.createRouterEdge(USDC, USDT)
    curveApi.createRouterEdge(USDT, USDC)

    curveApi.createRouterEdge(FRAX, eUSD__FRAX_USDC)
    curveApi.createRouterEdge(MIM, eUSD__FRAX_USDC)
    curveApi.createRouterEdge(USDC, eUSD__FRAX_USDC)
    curveApi.createRouterEdge(USDT, eUSD__FRAX_USDC)
    curveApi.createRouterEdge(DAI, eUSD__FRAX_USDC)

    curveApi.createRouterEdge(FRAX, mim_3CRV)
    curveApi.createRouterEdge(MIM, mim_3CRV)
    curveApi.createRouterEdge(USDC, mim_3CRV)
    curveApi.createRouterEdge(USDT, mim_3CRV)
    curveApi.createRouterEdge(DAI, mim_3CRV)

    curveApi.createRouterEdge(FRAX, _3CRV)
    curveApi.createRouterEdge(MIM, _3CRV)
    curveApi.createRouterEdge(USDC, _3CRV)
    curveApi.createRouterEdge(USDT, _3CRV)
    curveApi.createRouterEdge(DAI, _3CRV)

    // Add convex edges
    const stkcvxeUSD3CRV = await universe.getToken(
      Address.from('0xBF2FBeECc974a171e319b6f92D8f1d042C6F1AC3')
    )

    const stkcvxMIM3LP3CRV = await universe.getToken(
      Address.from('0x8443364625e09a33d793acd03aCC1F3b5DbFA6F6')
    )

    const stkcvx3Crv = await universe.getToken(
      Address.from('0xee0ac49885719DBF5FC1CDAFD9c752127E009fFa')
    )

    const stables = new Set([DAI, MIM, FRAX, USDC, USDT])

    // This is a sourcing rule, it can be used to define 'shortcuts' or better ways to perform a Zap.
    // The rule defined below instructs the zapper to not mint stkcvxeUSD3CRv/stkcvxMIM3LP3CRV tokens
    // from scratch and instead use the curve router via some stable coin.
    // If the user is zapping one of the above stable-coins into hyUSD then we will
    // even skip the initial trade and zap directly into the LP token / staked LP token.
    // Otherwise we try to trade the user input token into USDC first. It should ideally
    // reduce the number of trades needed to perform the zap.
    const makeStkConvexSourcingRule =
      (depositAndStake: Action): SourcingRule =>
        async (input, unitAmount) => {
          const lpTokenQty = unitAmount.into(depositAndStake.input[0])
          if (stables.has(input)) {
            return BasketTokenSourcingRuleApplication.singleBranch(
              [lpTokenQty],
              [PostTradeAction.fromAction(depositAndStake)]
            )
          }
          return BasketTokenSourcingRuleApplication.singleBranch(
            [unitAmount.into(USDC)],
            [
              PostTradeAction.fromAction(
                curveApi.createRouterEdge(USDC, lpTokenQty.token),
                true // Cause the Zapper to recalculate the inputs of the mints for the next step
              ),
              PostTradeAction.fromAction(depositAndStake),
            ]
          )
        }
    const [eUSDConvex, mimConvex, threeCryptoConvex] = await Promise.all([
      setupConvexEdge(universe, stkcvxeUSD3CRV),
      setupConvexEdge(universe, stkcvxMIM3LP3CRV),
      setupConvexEdge(universe, stkcvx3Crv)
    ])

    universe.defineTokenSourcingRule(
      universe.rTokens.hyUSD!,
      stkcvxeUSD3CRV,
      makeStkConvexSourcingRule(eUSDConvex.depositAndStakeAction)
    )

    universe.defineTokenSourcingRule(
      universe.rTokens.hyUSD!,
      stkcvxMIM3LP3CRV,
      makeStkConvexSourcingRule(mimConvex.depositAndStakeAction)
    )

    universe.defineTokenSourcingRule(
      universe.rTokens.RSD!,
      stkcvxeUSD3CRV,
      makeStkConvexSourcingRule(eUSDConvex.depositAndStakeAction)
    )

    universe.defineTokenSourcingRule(
      universe.rTokens.iUSD!,
      stkcvx3Crv,
      makeStkConvexSourcingRule(threeCryptoConvex.depositAndStakeAction)
    )

    for (const stable of stables) {
      universe.tokenTradeSpecialCases.set(
        stable,
        async (input: TokenQuantity, dest: Address) => {
          if (!stables.has(input.token)) {
            return null
          }
          return await new SwapPlan(universe, [
            curveApi.createRouterEdge(input.token, stable),
          ]).quote([input], dest)
        }
      )
    }
  }

  const wethActions = universe.defineMintable(
    new DepositAction(universe, WETH),
    new WithdrawAction(universe, WETH)
  )
  universe.tokenTradeSpecialCases.set(
    universe.nativeToken,
    async (input: TokenQuantity, dest: Address) => {
      if (input.token === WETH) {
        return await new SwapPlan(universe, [wethActions.burn]).quote(
          [input],
          dest
        )
      }
      return null
    }
  )

  universe.tokenTradeSpecialCases.set(
    WETH,
    async (input: TokenQuantity, dest: Address) => {
      if (input.token === universe.nativeToken) {
        return await new SwapPlan(universe, [wethActions.mint]).quote(
          [input],
          dest
        )
      }
      return null
    }
  )
  const wrappedToUnderlyingMapping =
    require('./data/ethereum/underlying.json') as Record<string, string>
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
  ])

  const saUSDT = await universe.getToken(
    Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
  )
  const saUSDC = await universe.getToken(
    Address.from('0x60C384e226b120d93f3e0F4C502957b2B9C32B15')
  )
  const saDAI = await universe.getToken(
    Address.from('0xF6147b4B44aE6240F7955803B2fD5E15c77bD7ea')
  )

  const saTokens = [
    { underlying: USDT, wrapped: saUSDT },
    { underlying: USDC, wrapped: saUSDC },
    { underlying: DAI, wrapped: saDAI },
  ]

  for (const { wrapped, underlying } of saTokens) {
    await setupMintableWithRate(
      universe,
      IStaticATokenLM__factory,
      wrapped,
      async (rate, saInst) => {
        return {
          fetchRate: async () => (await saInst.rate()).toBigInt(),
          mint: new MintSATokensAction(universe, underlying, wrapped, rate),
          burn: new BurnSATokensAction(universe, underlying, wrapped, rate),
        }
      }
    )
  }
  universe.oracles.push(chainLinkOracle)

  const reth = await universe.getToken(
    Address.from('0xae78736Cd615f374D3085123A210448E74Fc6393')
  )
  const rethRouter = new REthRouter(
    universe,
    reth,
    Address.from('0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C')
  )

  const ethToREth = new ETHToRETH(universe, rethRouter)
  const rEthtoEth = new RETHToETH(universe, rethRouter)

  universe.defineMintable(ethToREth, rEthtoEth)

  const stETH = await universe.getToken(
    Address.from('0xae7ab96520de3a18e5e111b5eaab095312d7fe84')
  )
  const stETHRate = new StETHRateProvider(universe, stETH)
  universe.defineMintable(
    new MintStETH(universe, stETH, stETHRate),
    new BurnStETH(universe, stETH, stETHRate)
  )
  const wstETH = await universe.getToken(
    Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0')
  )
  const wstethRates = new WStETHRateProvider(universe, stETH, wstETH)
  universe.defineMintable(
    new MintWStETH(universe, stETH, wstETH, wstethRates),
    new BurnWStETH(universe, stETH, wstETH, wstethRates)
  )
}

const ethereumConfig: ChainConfiguration = {
  config: new StaticConfig(
    {
      symbol: 'ETH',
      decimals: 18,
      name: 'Ether',
    },
    {
      convex: Address.from('0xF403C135812408BFbE8713b5A23a04b3D48AAE31'),
      zapperAddress: Address.from('0xfa81b1a2f31786bfa680a9B603c63F25A2F9296b'),
      executorAddress: Address.from(
        '0x7fA27033835d48ea32feB34Ab7a66d05bf38DE11'
      ),
      // Must be pointing at the 'main' contracts
      rTokenDeployments: {
        eUSD: Address.from('0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a'),
        'ETH+': Address.from('0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2'),
        hyUSD: Address.from('0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37'),
        RSD: Address.from('0xa410AA8304CcBD53F88B4a5d05bD8fa048F42478'),
        iUSD: Address.from('0x555143D2E6653c80a399f77c612D33D5Bf67F331'),
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
    }
  ),
  initialize,
}
export default ethereumConfig
