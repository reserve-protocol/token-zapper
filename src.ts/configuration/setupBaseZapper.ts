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
  setupOdosPricing(universe)
  const logger = universe.logger.child({ prefix: 'setupBaseZapper' })
  logger.info('Loading base token list')
  await loadBaseTokenList(universe)
  const wsteth = await universe.getToken(
    Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452')
  )
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
      if (token === wsteth) {
        const oraclewstethToEth = registry.getOracle(
          token.address,
          universe.nativeToken.address
        )
        const oracleethToUsd = registry.getOracle(
          universe.nativeToken.address,
          universe.usd.address
        )
        if (oraclewstethToEth == null || oracleethToUsd == null) {
          return null
        }
        const oneWSTInETH = universe.nativeToken.from(
          await oraclewstethToEth.callStatic.latestAnswer()
        )

        const oneETHInUSD = (await universe.fairPrice(
          universe.nativeToken.one
        ))!
        const priceOfOnewsteth = oneETHInUSD.mul(oneWSTInETH.into(universe.usd))
        return priceOfOnewsteth
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
  Object.entries(PROTOCOL_CONFIGS.ethPriceOracles).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.nativeToken.address,
        Address.from(oracleAddress)
      )
    }
  )

  universe.oracles.push(registry)

  logger.info('Setting up wrapped gas token')
  await setupWrappedGasToken(universe)

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

  universe.tokenType.set(
    universe.commonTokens.cbETH,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenType.set(
    universe.commonTokens.wstETH,
    Promise.resolve(TokenType.Asset)
  )
  universe.tokenClass.set(
    universe.rTokens.hyUSD,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.underlyingToken.set(
    universe.commonTokens.USDbC,
    Promise.resolve(universe.commonTokens.USDbC)
  )
  universe.tokenType.set(
    universe.commonTokens.USDbC,
    Promise.resolve(TokenType.Asset)
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
    universe.commonTokens['wsAMM-eUSD/USDC'],
    Promise.resolve(universe.commonTokens.USDC)
  )
  universe.tokenClass.set(
    universe.rTokens.bsd,
    Promise.resolve(universe.nativeToken)
  )
  universe.tokenClass.set(
    universe.commonTokens.cbETH,
    Promise.resolve(universe.nativeToken)
  )
  universe.tokenClass.set(
    universe.commonTokens.wstETH,
    Promise.resolve(universe.nativeToken)
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
  logger.info('Done setting up base zapper')
}
