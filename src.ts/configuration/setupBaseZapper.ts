import { Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { PROTOCOL_CONFIGS, type BaseUniverse } from './base'
import { loadBaseTokenList } from './loadBaseTokenList'
import { setupStargate } from './setupStargate'
import { setupStargateWrapper } from './setupStargateWrapper'
import { setupWrappedGasToken } from './setupWrappedGasToken'
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry'
import { setupCompoundV3 } from './setupCompV3'
import { setupAaveV3 } from './setupAaveV3'
import {
  setupUniswapV3,
  SUSHISWAP_V3,
  UNI_V3,
  UniswapV3Context,
} from './setupUniswapV3'
import { setupAerodromeRouter } from './setupAerodromeRouter'
import { setupERC4626 } from './setupERC4626'
import { createProtocolWithWrappers } from '../action/RewardableWrapper'
import { TokenType } from '../entities/TokenClass'
import { setupOdosPricing } from './setupOdosPricing'
import { setupReservePricing } from './setupReservePricing'
import { setupUniswapV2, UniswapV2Context } from './setupUniswapV2'
import { SuperOETHDeposit } from '../action/SuperOETH'
import { wrapGasToken } from '../searcher/TradeAction'
import { setupMaverick } from './maverick'
import { setupPancakeSwap } from '../action/PancakeSwap'

export const setupBaseZapper = async (universe: BaseUniverse) => {
  const logger = universe.logger.child({ prefix: 'setupBaseZapper' })

  setupReservePricing(universe)

  logger.info('Loading base token list')
  await loadBaseTokenList(universe)
  const priceViaOdos = setupOdosPricing(universe)
  setupReservePricing(universe)

  logger.info('Setting up wrapped gas token')
  await setupWrappedGasToken(universe)

  await universe.addSingleTokenPriceOracle({
    token: universe.commonTokens.eUSD,
    oracleAddress: Address.from('0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab'),
    priceToken: universe.usd,
  })

  universe.tokenType.set(
    universe.commonTokens.cbETH,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenType.set(
    universe.commonTokens.wstETH,
    Promise.resolve(TokenType.Asset)
  )

  universe.underlyingToken.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDbC)
  )
  universe.tokenType.set(
    universe.commonTokens.USDbC,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenType.set(
    universe.commonTokens.DEGEN,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.DEGEN,
    priceFn: async () => await priceViaOdos(universe.commonTokens.DEGEN),
  })

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.wstETH,
    priceFn: async () => await priceViaOdos(universe.commonTokens.wstETH),
  })
  universe.preferredToken.set(universe.rTokens.BSDX, universe.commonTokens.WETH)
  universe.preferredToken.set(universe.rTokens.BSDX, universe.commonTokens.WETH)
  universe.preferredToken.set(universe.rTokens.bsd, universe.commonTokens.WETH)
  universe.preferredToken.set(
    universe.rTokens.hyUSD,
    universe.commonTokens.USDC
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.cbETH,
    priceFn: async () => await priceViaOdos(universe.commonTokens.cbETH),
  })

  universe.tokenType.set(
    universe.commonTokens.WELL,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.WELL,
    priceFn: async () => await priceViaOdos(universe.commonTokens.WELL),
  })
  universe.tokenType.set(
    universe.commonTokens.AERO,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.AERO,
    priceFn: async () => await priceViaOdos(universe.commonTokens.AERO),
  })
  universe.tokenType.set(
    universe.commonTokens.MOG,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.MOG,
    priceFn: async () => await priceViaOdos(universe.commonTokens.MOG),
  })
  universe.tokenType.set(
    universe.commonTokens.cbBTC,
    Promise.resolve(TokenType.Asset)
  )
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens.cbBTC,
    priceFn: async () => await priceViaOdos(universe.commonTokens.cbBTC),
  })

  logger.info('Registering USD price oracles')
  const registry: OffchainOracleRegistry = new OffchainOracleRegistry(
    universe.config.requoteTolerance,
    'BaseOracles',
    async (token: Token) => {
      if (token === universe.wrappedNativeToken) {
        const oracle = registry.getOracle(
          universe.nativeToken.address,
          universe.usd.address
        )
        if (oracle == null) {
          return null
        }
        return universe.usd.from(await oracle.callStatic.latestAnswer())
      }

      const oracle = registry.getOracle(token.address, universe.usd.address)
      if (oracle == null) {
        return null
      }
      return universe.usd.from(await oracle.callStatic.latestAnswer())
    },
    () => universe.currentBlock,
    universe.provider
  )

  Object.entries(PROTOCOL_CONFIGS.usdPriceOracles).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.usd.address,
        Address.from(oracleAddress)
      )
    }
  )
  const mintSuperOETH = wrapGasToken(universe, new SuperOETHDeposit(universe))
  universe.addAction(mintSuperOETH)
  // universe.mintableTokens.set(universe.commonTokens.SuperOETH, mintSuperOETH)

  universe.oracles.push(registry)

  // Load compound v3
  const initCompound = async () => {
    universe.addIntegration(
      'compoundV3',
      await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3)
    )
  }

  const initAave = async () => {
    logger.info('Setting up AAVEV3')
    universe.addIntegration(
      'aaveV3',
      await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3)
    )
  }

  let uniswapV3Ctx: UniswapV3Context
  let uniswapV2Ctx: UniswapV2Context
  const initERC4626 = async () => {
    logger.info('Setting up preferred rTokens')
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
  }
  const setupStarGate_ = async () => {
    logger.info('Setting up stargate')
    // Set up stargate
    await setupStargate(
      universe,
      PROTOCOL_CONFIGS.stargate.tokens,
      PROTOCOL_CONFIGS.stargate.router,
      {}
    )
    await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {})
  }
  universe.zeroPriceTokens.add(
    await universe.getToken('0xf04d220b8136e2d3d4be08081dbb565c3c302ffd')
  )
  const setupAero = async () => {
    try {
      await setupAerodromeRouter(universe)
      const aerodromeWrappers = createProtocolWithWrappers(
        universe,
        'aerodrome'
      )

      for (const wrapperAddress of Object.values(
        PROTOCOL_CONFIGS.aerodrome.lpPoolWrappers
      )) {
        const wrapperToken = await universe.getToken(
          Address.from(wrapperAddress)
        )
        await aerodromeWrappers.addWrapper(wrapperToken)
      }
    } catch (e) {
      console.log(e)
    }
  }
  let done = 0

  universe.addPreferredRTokenInputToken(
    universe.commonTokens.SuperOETH,
    universe.commonTokens.WETH
  )
  universe.tokenClass.set(
    universe.commonTokens.SuperOETH,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.addPreferredRTokenInputToken(
    universe.commonTokens.wsuperOETH,
    universe.commonTokens.WETH
  )
  universe.tokenClass.set(
    universe.commonTokens.wsuperOETH,
    Promise.resolve(universe.commonTokens.WETH)
  )
  const tasks = [
    initCompound(),
    initAave(),
    // setupMaverick(universe),
    (async () => {
      uniswapV2Ctx = (await setupUniswapV2(universe))!
    })(),
    (async () => {
      logger.info(`Uniswap V3: loading pools`)
      uniswapV3Ctx = await setupUniswapV3(universe, UNI_V3[8453])
      logger.info(`Uniswap V3: ${uniswapV3Ctx.pools.size} pools loaded`)
    })(),
    (async () => {
      logger.info(`SushiSwap V3: loading pools`)
      const ctx = await setupUniswapV3(universe, SUSHISWAP_V3[8453])
      logger.info(`SushiSwap V3: ${ctx.pools.size} pools loaded`)
    })(),
    (async () => {
      logger.info(`Pancakeswap: loading pools`)
      const ctx = await setupPancakeSwap(universe)
      logger.info(`Pancakeswap: ${ctx.pools.size} pools loaded`)
    })(),
    initERC4626(),
    setupStarGate_(),
    setupAero(),
  ].map((tsk) =>
    tsk
      .catch((e) => {
        logger.error(e)
      })
      .finally(() => {
        done++
        logger.info(`${done}/${tasks.length} done`)
      })
  )

  await Promise.all(tasks)

  universe.tokenClass.set(
    universe.rTokens.hyUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.RIVOTKN,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.DEGEN,
    Promise.resolve(universe.commonTokens.DEGEN)
  )
  universe.tokenClass.set(
    universe.commonTokens.WELL,
    Promise.resolve(universe.commonTokens.WELL)
  )
  universe.tokenClass.set(
    universe.commonTokens.AERO,
    Promise.resolve(universe.commonTokens.AERO)
  )
  universe.tokenClass.set(
    universe.commonTokens.MOG,
    Promise.resolve(universe.commonTokens.MOG)
  )
  universe.tokenClass.set(
    universe.commonTokens.cbBTC,
    Promise.resolve(universe.commonTokens.cbBTC)
  )
  universe.tokenClass.set(
    universe.commonTokens.DAI,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.meUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.eUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )

  universe.tokenClass.set(
    universe.commonTokens.BGCI,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.preferredToken.set(
    universe.commonTokens.BDTF,
    universe.commonTokens.WETH
  )

  universe.tokenClass.set(
    universe.commonTokens.MVDA25,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.MVTT10F,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.VTF,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.AI,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.CLX,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.ABX,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.preferredToken.set(
    universe.commonTokens.BGCI,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.CLUB,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.MVDA25,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.MVTT10F,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.VTF,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.AI,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.CLX,
    universe.commonTokens.WETH
  )
  universe.preferredToken.set(
    universe.commonTokens.ABX,
    universe.commonTokens.WETH
  )

  universe.tokenClass.set(
    universe.rTokens.bsd,
    Promise.resolve(universe.wrappedNativeToken)
  )
  universe.preferredToken.set(universe.rTokens.BSDX, universe.commonTokens.WETH)
  universe.tokenClass.set(
    universe.rTokens.BSDX,
    Promise.resolve(universe.commonTokens.WETH)
  )
  universe.tokenClass.set(
    universe.commonTokens.cbETH,
    Promise.resolve(universe.wrappedNativeToken)
  )
  universe.tokenClass.set(
    universe.commonTokens.wstETH,
    Promise.resolve(universe.wrappedNativeToken)
  )
  logger.info('Done setting up base zapper')
  await Promise.all(tasks)

  universe.blacklistedTokens.add(
    await universe.getToken('0xbd15d0c77133d3200756dc4d7a4f577dbb2cf6a3')
  )
  universe.blacklistedTokens.add(
    await universe.getToken('0x49c86046903807d0a3193a221c1a3e1b1b6c9ba3')
  )
  universe.blacklistedTokens.add(
    await universe.getToken('0xac743b05f5e590d9db6a4192e02457838e4af61e')
  )
  universe.feeOnTransferTokens.add(
    await universe.getToken('0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979')
  )
  if (universe.config.dynamicConfigURL == null) {
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
      blacklistedTokens: string[]
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
    await Promise.all(
      configJson.blacklistedTokens.map(async (tokenAddr) => {
        const token = await universe.getToken(tokenAddr)
        universe.blacklistedTokens.add(token)
      })
    )
  } catch (e) {
    logger.error('Failed to load dynamic pool data')
    logger.error(e)
  }
}
