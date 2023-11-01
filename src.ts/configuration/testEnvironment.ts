import { DepositAction, WithdrawAction } from '../action/WrappedNative'
import { BurnCTokenAction, MintCTokenAction } from '../action/CTokens'
import { BurnRTokenAction, MintRTokenAction } from '../action/RTokens'
import { BurnSATokensAction, MintSATokensAction } from '../action/SATokens'
import { Address } from '../base/Address'
import { Universe } from '../Universe'
import { PriceOracle } from '../oracles/PriceOracle'
import { Token, TokenQuantity } from '../entities/Token'
import { IBasket } from '../entities/TokenBasket'
import { JsonTokenEntry, loadTokens } from './loadTokens'
import { ETHToRETH, RETHToETH } from '../action/REth'
import { constants, ethers } from 'ethers'
import { ContractCall } from '../base/ContractCall'
import { BurnWStETH, MintWStETH } from '../action/WStEth'
import { BurnStETH, MintStETH } from '../action/StEth'
import { makeConfig } from './ChainConfiguration'
import { ZapperTokenQuantityPrice } from '../oracles/ZapperAggregatorOracle'
import { ApprovalsStore } from '../searcher/ApprovalsStore'

export const testConfig = makeConfig(
  1,
  {
    symbol: 'ETH',
    decimals: 18,
    name: 'Ether',
  },
  {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    WBTC: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ERC20GAS: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  },
  {
    eUSD: {
      main: '0x7697aE4dEf3C3Cd52493Ba3a6F57fc6d8c59108a',
      erc20: "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"
    },
    'ETH+': {
      main: '0xb6A7d481719E97e142114e905E86a39a2Fa0dfD2',
      erc20: "0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8"
    },
    hyUSD: {
      main: '0x2cabaa8010b3fbbDEeBe4a2D0fEffC2ed155bf37',
      erc20: "0xaCdf0DBA4B9839b96221a8487e9ca660a48212be"
    },
    RSD: {
      main: '0xa410AA8304CcBD53F88B4a5d05bD8fa048F42478',
      erc20: "0xF2098092a5b9D25A3cC7ddc76A0553c9922eEA9E"
    },
    iUSD: {
      main: '0x555143D2E6653c80a399f77c612D33D5Bf67F331',
      erc20: "0x9b451BEB49a03586e6995E5A93b9c745D068581e"
    },
  },
  {
    facadeAddress: "0x81b9Ae0740CcA7cDc5211b2737de735FBC4BeB3C",
    zapperAddress: '0xfa81b1a2f31786bfa680a9B603c63F25A2F9296b',
    executorAddress: '0x7fA27033835d48ea32feB34Ab7a66d05bf38DE11',
    wrappedNative: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  },
)
type BaseTestConfigType = typeof testConfig

export type TestUniverse = Universe<BaseTestConfigType>

const defineRToken = (
  universe: Universe<any>,
  rToken: Token,
  basket: TokenQuantity[]
) => {
  const basketHandler: IBasket = {
    basketTokens: basket.map((i) => i.token),
    unitBasket: basket,
    rToken: rToken,
    basketNonce: 0,
    async quote(baskets) {
      return basket.map((i) => i.scalarMul(baskets).scalarDiv(rToken.scale))
    }
  }
  universe.defineMintable(
    new MintRTokenAction(universe, basketHandler),
    new BurnRTokenAction(universe, basketHandler)
  )
  universe.rTokens[rToken.symbol] = rToken
}

const initialize = async (universe: TestUniverse) => {
  loadTokens(
    universe,
    require('./data/ethereum/tokens.json') as JsonTokenEntry[]
  )

  const fUSDC = await universe.getToken(
    Address.from('0x465a5a630482f3abD6d3b84B39B29b07214d19e5')
  )
  const fDAI = await universe.getToken(
    Address.from('0xe2bA8693cE7474900A045757fe0efCa900F6530b')
  )

  const saUSDT = await universe.getToken(
    Address.from('0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9')
  )
  const cUSDT = await universe.getToken(
    Address.from('0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9')
  )
  const saUSDC = await universe.getToken(
    Address.from('0x8f471832C6d35F2a51606a60f482BCfae055D986')
  )
  const cUSDC = await universe.getToken(
    Address.from('0x39aa39c021dfbae8fac545936693ac917d5e7563')
  )

  const eUSD = universe.createToken(
    Address.from('0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F'),
    'eUSD',
    'Electric Dollar',
    18
  )
  const ETHPlus = universe.createToken(
    Address.from('0xE72B141DF173b999AE7c1aDcbF60Cc9833Ce56a8'),
    'ETH+',
    'ETH Plus',
    18
  )


  const USDT = universe.commonTokens.USDT
  const USDC = universe.commonTokens.USDC
  const DAI = universe.commonTokens.DAI
  const WBTC = universe.commonTokens.WBTC
  const WETH = universe.commonTokens.WETH
  
  universe.defineMintable(
    new DepositAction(universe, WETH),
    new WithdrawAction(universe, WETH)
  )

  const saTokens = [
    { underlying: USDT, saToken: saUSDT, rate: 1110924415157506442300940896n },
    { underlying: USDC, saToken: saUSDC, rate: 1084799248366747993839600567n },
  ]
  const cTokens = [
    { underlying: USDT, cToken: cUSDT, rate: 222352483123917n },
    { underlying: USDC, cToken: cUSDC, rate: 227824756984310n },

    { underlying: USDC, cToken: fUSDC, rate: 20173073936250n },
    { underlying: DAI, cToken: fDAI, rate: 201658648975913110959308192n },
  ]

  for (const saToken of saTokens) {
    const rate = {
      value: saToken.rate,
    }
    universe.defineMintable(
      new MintSATokensAction(
        universe,
        saToken.underlying,
        saToken.saToken,
        rate
      ),
      new BurnSATokensAction(
        universe,
        saToken.underlying,
        saToken.saToken,
        rate
      )
    )
  }

  for (const cToken of cTokens) {
    const rate = {
      value: cToken.rate,
    }
    universe.defineMintable(
      new MintCTokenAction(universe, cToken.underlying, cToken.cToken, rate),
      new BurnCTokenAction(universe, cToken.underlying, cToken.cToken, rate)
    )
  }

  const reth = await universe.getToken(
    Address.from('0xae78736Cd615f374D3085123A210448E74Fc6393')
  )
  const rethRouterAddress = Address.from(
    '0x16D5A408e807db8eF7c578279BEeEe6b228f1c1C'
  )

  const mockPortions = [constants.Zero, constants.Zero] as [
    ethers.BigNumber,
    ethers.BigNumber
  ]
  const rETHToETHRate = reth.from('1.06887')
  const ETHToRETHRate = universe.nativeToken.one.div(
    rETHToETHRate.into(universe.nativeToken)
  )
  const rethRouter = {
    reth,
    gasEstimate(): bigint {
      return 250000n
    },
    async optimiseToREth(qtyETH: TokenQuantity) {
      return {
        portions: mockPortions,
        amountOut: qtyETH.mul(ETHToRETHRate).into(reth),
        contractCall: new ContractCall(
          Buffer.alloc(0),
          rethRouterAddress,
          qtyETH.amount,
          0n
        ),
      }
    },
    async optimiseFromREth(qtyRETH: TokenQuantity) {
      return {
        portions: mockPortions,
        amountOut: qtyRETH.mul(rETHToETHRate).into(universe.nativeToken),
        contractCall: new ContractCall(
          Buffer.alloc(0),
          rethRouterAddress,
          0n,
          0n
        ),
      }
    },
  }

  const ethToREth = new ETHToRETH(universe, rethRouter)
  const rEthtoEth = new RETHToETH(universe, rethRouter)

  universe.defineMintable(ethToREth, rEthtoEth)

  const stETH = await universe.getToken(
    Address.from('0xae7ab96520de3a18e5e111b5eaab095312d7fe84')
  )

  const wstETH = await universe.getToken(
    Address.from('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0')
  )

  universe.defineMintable(
    new MintStETH(universe, stETH, {
      async quoteMint(qtyEth) {
        return qtyEth.into(stETH)
      },
    }),
    new BurnStETH(universe, stETH, {
      async quoteBurn(qtyStETH) {
        return qtyStETH.into(universe.nativeToken)
      },
    })
  )

  // Test env exchange rate is harded to:
  const stEthPrWStEth = stETH.from('1.1189437171')
  const wstEthPrStEth = stETH.one.div(stEthPrWStEth).into(wstETH)

  universe.defineMintable(
    new MintWStETH(universe, stETH, wstETH, {
      async quoteMint(qtyStEth) {
        return qtyStEth.into(wstETH).mul(wstEthPrStEth)
      },
    }),
    new BurnWStETH(universe, stETH, wstETH, {
      async quoteBurn(qtyWstEth) {
        return qtyWstEth.into(stETH).mul(stEthPrWStEth)
      },
    })
  )
  // Defines the by now 'old' eUSD.
  defineRToken(universe, eUSD, [
    saUSDT.fromDecimal('0.225063'),
    USDT.fromDecimal('0.500004'),
    cUSDT.fromDecimal('11.24340940'),
  ])

  // ETH+
  defineRToken(universe, ETHPlus, [
    reth.from('0.5').div(rETHToETHRate),
    wstETH.from('0.5').mul(wstEthPrStEth),
  ])

  const prices = new Map<Token, TokenQuantity>([
    [USDT, universe.usd.one],
    [WETH, universe.usd.fromDecimal('1750')],
    [reth, universe.usd.fromDecimal('1920')],
    [wstETH, universe.usd.fromDecimal('1900')],
    [WBTC, universe.usd.fromDecimal('29000')],
    [DAI, universe.usd.from("0.999")],
    [USDC, universe.usd.from("1.001")],
    [universe.nativeToken, universe.usd.from("1750")],
  ])
  const oracle = new PriceOracle('Test', async (token) => {
    return prices.get(token) ?? null
  }, () => universe.currentBlock)
  universe.oracles.push(
    oracle
  )
  universe.oracle = new ZapperTokenQuantityPrice(universe)
}



export class MockApprovalsStore extends ApprovalsStore {
  constructor(
  ) {
    super(null as any)
  }
  async needsApproval(
    token: Token,
    owner: Address,
    spender: Address,
    amount: bigint
  ): Promise<boolean> {
    return true
  }
}

export const createForTest = async <const Conf extends BaseTestConfigType>(
  c = testConfig as Conf
) => {
  const universe = await Universe.createWithConfig(
    null as any,
    c,
    initialize,
    {
      approvalsStore: new MockApprovalsStore(),
      tokenLoader: async (_: Address) => {
        throw new Error('Not implemented')
      },
    }
  )

  await universe.initialized

  return universe
}