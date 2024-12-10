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
import { setupUniswapV3Router } from './setupUniswapRouter'
import { setupAerodromeRouter } from './setupAerodromeRouter'
import { setupERC4626 } from './setupERC4626'
import { createProtocolWithWrappers } from '../action/RewardableWrapper'
import { TokenType } from '../entities/TokenClass'
import { setupOdosPricing } from './setupOdosPricing'

export const setupBaseZapper = async (universe: BaseUniverse) => {
  const logger = universe.logger.child({ prefix: 'setupBaseZapper' })

  logger.info('Loading base token list')
  await loadBaseTokenList(universe)
  console.log(`setupBaseZapper`)
  const priceViaOdos = setupOdosPricing(universe)

  logger.info('Setting up wrapped gas token')
  await setupWrappedGasToken(universe)

  console.log(`done`)

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

  universe.oracles.push(registry)

  // Load compound v3
  universe.addIntegration(
    'compoundV3',
    await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3)
  )

  logger.info('Setting up AAVEV3')
  // Set up AAVEV2
  universe.addIntegration(
    'aaveV3',
    await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3)
  )

  await universe.addSingleTokenPriceOracle({
    token: universe.commonTokens.eUSD,
    oracleAddress: Address.from('0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab'),
    priceToken: universe.usd,
  })

  logger.info('Setting up UniswapV3')
  const router = await setupUniswapV3Router(universe)
  universe.addIntegration('uniswapV3', await router.venue())

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

  logger.info('Setting up stargate')
  // Set up stargate
  await setupStargate(
    universe,
    PROTOCOL_CONFIGS.stargate.tokens,
    PROTOCOL_CONFIGS.stargate.router,
    {}
  )
  await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {})

  await setupAerodromeRouter(universe)
  const aerodromeWrappers = createProtocolWithWrappers(universe, 'aerodrome')

  for (const wrapperAddress of Object.values(
    PROTOCOL_CONFIGS.aerodrome.lpPoolWrappers
  )) {
    const wrapperToken = await universe.getToken(Address.from(wrapperAddress))
    await aerodromeWrappers.addWrapper(wrapperToken)
  }

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
    universe.rTokens.bsd,
    Promise.resolve(universe.wrappedNativeToken)
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
}
