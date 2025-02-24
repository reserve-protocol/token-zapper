import { setupBalancer } from '../action/Balancer'
import { loadCompV2Deployment } from '../action/CTokens'
import { DssLitePsm } from '../action/DssLitePsm'
import {
  ERC4626DepositAction,
  ETHTokenVaultDepositAction,
} from '../action/ERC4626'
import { LidoDeployment } from '../action/Lido'
import { StakeDAODepositAction } from '../action/StakeDAO'
import { YearnDepositAction, YearnWithdrawAction } from '../action/Yearn'
import { Address } from '../base/Address'
import { CHAINLINK } from '../base/constants'
import { IGaugeStakeDAO__factory, IVaultYearn__factory } from '../contracts'
import { TokenType } from '../entities/TokenClass'
import { wrapGasToken } from '../searcher/TradeAction'
import { PROTOCOL_CONFIGS, type EthereumUniverse } from './ethereum'
import { setupAaveV2 } from './setupAaveV2'
import { setupAaveV3 } from './setupAaveV3'
import { setupBeefy } from './setupBeefy'
import { setupChainlinkRegistry } from './setupChainLink'
import { setupCompoundV3 } from './setupCompV3'
import { setupConcentrator } from './setupConcentrator'
import { setupConvexStakingWrappers } from './setupConvexStakingWrappers'
import { CurveIntegration } from './setupCurve'
import { setupERC4626 } from './setupERC4626'
import { loadEthereumTokenList } from './setupEthereumTokenList'
import { setupFrxETH } from './setupFrxETH'
import { setupOdosPricing } from './setupOdosPricing'
import { setupPXETH } from './setupPXETH'
import { setupRETH } from './setupRETH'
import { setupStakeDAO } from './setupStakeDAO'
import { setupUniswapV2, UniswapV2Context } from './setupUniswapV2'
import { setupUniswapV3, UniswapV3Context } from './setupUniswapV3'
import { setupWrappedGasToken } from './setupWrappedGasToken'
import { setupYearn } from './setupYearn'

interface IVault {
  earnContractAddress: string
  chain: string
}
const initBeefy = async (universe: EthereumUniverse) => {
  const beefyVaults: IVault[] = await fetch(
    'https://api.beefy.finance/vaults'
  ).then((res) => res.json())

  await setupBeefy(universe, {
    vaults: beefyVaults
      .filter((i) => i.chain === 'ethereum')
      .map((i) => i.earnContractAddress),
  })
}

export const setupEthereumZapper = async (universe: EthereumUniverse) => {
  const logger = universe.logger.child({
    module: 'setupEthereumZapper',
  })
  await universe.provider.getNetwork()
  await loadEthereumTokenList(universe)
  const eth = universe.nativeToken
  const commonTokens = universe.commonTokens
  setupOdosPricing(universe)

  // Searcher depends on a way to price tokens
  // Below we set up the chainlink registry to price tokens

  setupChainlinkRegistry(
    universe,
    PROTOCOL_CONFIGS.chainLinkRegistry,
    [
      [commonTokens.WBTC, CHAINLINK.BTC],
      [commonTokens.WETH, CHAINLINK.ETH],
      [eth, CHAINLINK.ETH],
      [commonTokens.pxETH, CHAINLINK.ETH],
    ],
    [
      [
        commonTokens.reth,
        {
          uoaToken: eth,
          derivedTokenUnit: CHAINLINK.ETH,
        },
      ],
    ]
  )

  await setupWrappedGasToken(universe)

  // Set up compound
  universe.addIntegration(
    'compoundV2',
    await loadCompV2Deployment('CompV2', universe, PROTOCOL_CONFIGS.compoundV2)
  )

  universe.addIntegration(
    'fluxFinance',
    await loadCompV2Deployment(
      'FluxFinance',
      universe,
      PROTOCOL_CONFIGS.fluxFinance
    )
  )

  // Load compound v3
  universe.addIntegration(
    'compoundV3',
    await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3)
  )

  // Set up AAVEV2

  universe.addIntegration(
    'aaveV2',
    await setupAaveV2(universe, PROTOCOL_CONFIGS.aavev2)
  )

  // console.log(aaveV2.describe().join('\n'))

  universe.addIntegration(
    'aaveV3',
    await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3)
  )

  // console.log(aaveV3.describe().join('\n'))

  await setupPXETH(
    universe,
    commonTokens.pxETH,
    commonTokens.apxETH,
    Address.from('0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea')
  )

  let uniswapV3Ctx: UniswapV3Context
  let uniswapV2Ctx: UniswapV2Context

  const initUniswapV3 = async () => {
    try {
      uniswapV3Ctx = await setupUniswapV3(universe)
      const venue = await uniswapV3Ctx.venue()
      const uniswap = universe.addIntegration('uniswapV3', venue)
      universe.addTradeVenue(uniswap)
    } catch (e) {
      console.log('Failed to load uniswapV3')
      console.log(e)
    }
  }

  const initUniswapV2 = async () => {
    try {
      const ctx = await setupUniswapV2(universe)
      if (ctx) {
        uniswapV2Ctx = ctx
      }
    } catch (e) {
      console.log('Failed to load uniswapV2')
      console.log(e)
    }
  }

  // Set up RETH
  await setupRETH(universe, PROTOCOL_CONFIGS.rocketPool)

  // Set up Lido
  universe.addIntegration(
    'lido',
    await LidoDeployment.load(universe, PROTOCOL_CONFIGS.lido)
  )

  await setupFrxETH(universe, PROTOCOL_CONFIGS.frxETH)

  // Set up various ERC4626 tokens
  await Promise.all(
    PROTOCOL_CONFIGS.erc4626.map(async ([addr, proto]) => {
      const vault = await setupERC4626(universe, {
        vaultAddress: addr,
        protocol: proto,
        slippage: 1n,
      })
      return vault
    })
  )

  const daiMint = new DssLitePsm(
    universe,
    Address.from('0xf6e72db5454dd049d0788e411b06cfaf16853042'),
    universe.commonTokens.USDC,
    universe.commonTokens.DAI,
    async (input) => input * 1000000000000n
  )

  universe.addAction(daiMint)

  universe.mintRateProviders.set(universe.commonTokens.DAI, () =>
    Promise.resolve(universe.commonTokens.USDC.one)
  )

  const depositToETHX = wrapGasToken(
    universe,
    new ETHTokenVaultDepositAction(
      universe,
      universe.commonTokens.ETHx,
      Address.from('0xcf5EA1b38380f6aF39068375516Daf40Ed70D299'),
      1n,
      'ETHX'
    )
  )
  await initBeefy(universe)
  await setupYearn(universe, PROTOCOL_CONFIGS.yearn)
  await setupConcentrator(universe, PROTOCOL_CONFIGS.concentrator)
  await setupStakeDAO(universe, PROTOCOL_CONFIGS.stakeDAO)
  universe.addAction(depositToETHX)
  universe.mintableTokens.set(universe.commonTokens.ETHx, depositToETHX)

  // universe.defineMintable(depositToBeefy, beefyWithdraw, true)

  const stakeDAOVault = await IGaugeStakeDAO__factory.connect(
    commonTokens['sdETH+ETH-f'].address.address,
    universe.provider
  ).callStatic.vault()

  const depositToStakeDAO = new StakeDAODepositAction(
    universe,
    commonTokens['ETH+ETH-f'],
    commonTokens['sdETH+ETH-f'],
    Address.from(stakeDAOVault)
  )
  universe.addAction(depositToStakeDAO)
  universe.mintableTokens.set(commonTokens['sdETH+ETH-f'], depositToStakeDAO)

  const yearnContract = IVaultYearn__factory.connect(
    commonTokens['yvCurve-ETH+-f'].address.address,
    universe.provider
  )
  const getYearnRate = universe.createCachedProducer(async () => {
    const rate = await yearnContract.callStatic.pricePerShare()
    return rate.toBigInt()
  })
  const depositToYearn = new YearnDepositAction(
    universe,
    commonTokens['ETH+ETH-f'],
    commonTokens['yvCurve-ETH+-f'],
    getYearnRate
  )
  const withdrawFromYearn = new YearnWithdrawAction(
    universe,
    commonTokens['ETH+ETH-f'],
    commonTokens['yvCurve-ETH+-f'],
    getYearnRate
  )
  universe.addAction(depositToYearn)
  universe.addAction(withdrawFromYearn)
  universe.mintableTokens.set(commonTokens['yvCurve-ETH+-f'], depositToYearn)

  const depositTosUSDe = new (ERC4626DepositAction('USDe'))(
    universe,
    universe.commonTokens.USDe,
    universe.commonTokens.sUSDe,
    1n
  )

  universe.tokenType.set(
    universe.commonTokens.USDe,
    Promise.resolve(TokenType.OtherMintable)
  )
  universe.tokenClass.set(
    universe.commonTokens.sUSDe,
    Promise.resolve(universe.commonTokens.USDe)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDe,
    Promise.resolve(universe.commonTokens.USDT)
  )

  universe.addAction(depositTosUSDe)
  universe.mintableTokens.set(universe.commonTokens.sUSDe, depositTosUSDe)

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens['sdETH+ETH-f'],
    priceFn: async () => {
      const lpPrice = await universe.fairPrice(
        universe.commonTokens['ETH+ETH-f'].one
      )
      if (lpPrice == null) {
        throw Error(
          `Failed to price ${universe.commonTokens['sdETH+ETH-f']}: Missing price for ETH+ETH-f`
        )
      }
      return lpPrice
    },
  })

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens['yvCurve-ETH+-f'],
    priceFn: async () => {
      const [output] = await withdrawFromYearn.quote([
        universe.commonTokens['yvCurve-ETH+-f'].one,
      ])
      const burn = universe.getBurnAction(output.token)
      const out = await burn.quote([output])
      const prices = await Promise.all([out[0].price(), out[1].price()])
      const outUSD = prices[0].add(prices[1]).into(universe.usd)
      return outUSD
    },
  })

  universe.addSingleTokenPriceOracle({
    token: universe.commonTokens.ETHx,
    oracleAddress: Address.from('0xC5f8c4aB091Be1A899214c0C3636ca33DcA0C547'),
    priceToken: universe.commonTokens.WETH,
  })

  universe.defineYieldPositionZap(
    universe.commonTokens.sdgnETH,
    universe.rTokens.dgnETH
  )

  universe.defineYieldPositionZap(
    universe.commonTokens['ETH+ETH-f'],
    universe.rTokens['ETH+']
  )

  for (const token of [
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x867a9cf57c36de171a036de4a0a364f6990f6248',
    '0x8cf0e5399fedf0fa6918d8c8a5e54e94c28a7989',
    '0x90d5b65af52654a2b230244a61dd4ce3cfa4835f',
    '0xc51b8e7c50f83d4e77708ff0fa931f655a07afb2',
    '0x17e7c7379fa5c121c4898760eacffa7d73a0d160',
    '0xbb085d1387706ce477c4e752c76c38070ac226cb',
    '0x575b2e325ad326f6cc11fc7e1dc389cbd96d2ff0',
    '0x354278eb9c0a8b1f4ab8231c0c4741da05a76206',
    '0xeedd1b2dc2f30e55eaa3db1cf70f1c409b86368e',
    '0x365accfca291e7d3914637abf1f7635db165bb09',
  ]) {
    universe.zeroBeforeApproval.add(
      await universe.getToken(Address.from(token))
    )
  }

  universe.defineYieldPositionZap(
    await universe.getToken(
      Address.from(PROTOCOL_CONFIGS.convex.wrappers['stkcvxETH+ETH-f'])
    ),
    universe.rTokens['ETH+']
  )

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.cbeth,
    priceFn: async () => {
      return (await universe.fairPrice(universe.commonTokens.WETH.one))!
    },
  })

  universe.tokenType.set(
    universe.commonTokens.ETHx,
    Promise.resolve(TokenType.ETHLST)
  )
  universe.tokenType.set(
    universe.commonTokens.reth,
    Promise.resolve(TokenType.ETHLST)
  )
  universe.tokenType.set(
    universe.commonTokens.steth,
    Promise.resolve(TokenType.ETHLST)
  )
  universe.tokenType.set(
    universe.commonTokens.wsteth,
    Promise.resolve(TokenType.OtherMintable)
  )
  universe.tokenType.set(
    universe.commonTokens.frxeth,
    Promise.resolve(TokenType.ETHLST)
  )
  universe.tokenType.set(
    universe.commonTokens.sfrxeth,
    Promise.resolve(TokenType.OtherMintable)
  )
  const initCurve = async () => {
    console.log('Loading curve')

    try {
      const curve = await CurveIntegration.load(
        universe,
        PROTOCOL_CONFIGS.curve
      )
      universe.integrations.curve = curve
      universe.addIntegration(
        'convex',
        await setupConvexStakingWrappers(
          universe,
          curve,
          PROTOCOL_CONFIGS.convex
        )
      )
    } catch (e) {
      console.log(e)
      console.log('Failed to load curve')
    }
  }
  const initBalancer = async () => {
    console.log('Loading balancer')

    try {
      await setupBalancer(universe)
    } catch (e) {
      console.log(e)
      console.log('Failed to load balancer')
    }
  }

  const initMaverick = async () => {
    try {
      // await setupMaverick(universe)
    } catch (e) {
      console.log(e)
      console.log('Failed to load maverick')
    }
  }

  const tasks = [
    initUniswapV3,
    initBalancer,
    initCurve,
    initUniswapV2,
    initMaverick,
  ]
  await Promise.all(tasks.map((task) => task()))

  universe.tokenClass.set(
    universe.rTokens.USD3,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.eUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.hyUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens['ETH+'],
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDC,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDT,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.DAI,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.dgnETH,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.rTokens.eUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.hyUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.USD3,
    Promise.resolve(universe.commonTokens.USDC)
  )

  universe.preferredToken.set(universe.rTokens.eUSD, universe.commonTokens.USDC)
  universe.preferredToken.set(
    universe.rTokens.hyUSD,
    universe.commonTokens.USDC
  )
  universe.preferredToken.set(universe.rTokens.USD3, universe.commonTokens.USDC)

  universe.addSingleTokenPriceOracle({
    token: universe.commonTokens.sUSD,
    oracleAddress: Address.from('0xfF30586cD0F29eD462364C7e81375FC0C71219b1'),
    priceToken: universe.usd,
  })

  const v3Pools = [
    '0x764510ab1d39cf300e7abe8f5b8977d18f290628',
    '0xDa99F4f2FE926b90F07f5F4EB0Ce773f7173c6a0',
    '0xBd2A7aD26f70b64898BBdd06fB5D6ddf72E72A77',
  ]
  const v2Pools = ['0x2621CC0B3F3c079c1Db0E80794AA24976F0b9e3c']

  for (const pool of v2Pools) {
    const poolV2 = await uniswapV2Ctx!.loadPool(Address.from(pool))
    universe.addAction(poolV2.swap01)
    universe.addAction(poolV2.swap10)
  }

  for (const pool of v3Pools) {
    const poolV3 = await uniswapV3Ctx!.loadPool(Address.from(pool))
    universe.addAction(poolV3.swap01)
    universe.addAction(poolV3.swap10)
  }

  if (!universe.config.dynamicConfigURL) {
    console.log('Ethereum zapper setup complete')

    return
  }
  try {
    universe.logger.info(
      `Loading dynamic pool data from ${universe.config.dynamicConfigURL}`
    )
    const config = await fetch(universe.config.dynamicConfigURL)
    const configJson: {
      uniswap: {
        v2: string[]
        v3: string[]
      }
      aerodrome: {
        stableOrVolatile: string[]
      }
    } = await config.json()

    await Promise.all(
      configJson.uniswap.v2.map(async (poolAddr) => {
        try {
          const pool = await uniswapV2Ctx!.loadPool(
            Address.from(poolAddr.toLowerCase())
          )
          universe.addAction(pool.swap01)
          universe.addAction(pool.swap10)
        } catch (e) {}
      })
    )
    await Promise.all(
      configJson.uniswap.v3.map(async (poolAddr) => {
        try {
          const pool = await uniswapV3Ctx!.loadPool(
            Address.from(poolAddr.toLowerCase())
          )
          universe.addAction(pool.swap01)
          universe.addAction(pool.swap10)
        } catch (e) {
          console.log(e)
        }
      })
    )
  } catch (e) {
    logger.error('Failed to load dynamic pool data')
    logger.error(e)
  }
  console.log('Ethereum zapper setup complete')
}
