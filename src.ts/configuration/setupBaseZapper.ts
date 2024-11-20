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
import { setupUniswapRouter } from './setupUniswapRouter'
import { setupAerodromeRouter } from './setupAerodromeRouter'
import { setupERC4626 } from './setupERC4626'
import { createProtocolWithWrappers } from '../action/RewardableWrapper'
import { DysonDepositAction } from '../action/Dyson'
import { IDysonVault__factory } from '../contracts'
import { ONE } from '../action/Action'
import { setupBeefy } from './setupBeefy'
import { setupYearn } from './setupYearn'

export const setupBaseZapper = async (universe: BaseUniverse) => {
  await loadBaseTokenList(universe)
  const wsteth = await universe.getToken(
    Address.from('0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452')
  )

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

  await setupWrappedGasToken(universe)

  // Load compound v3
  universe.addIntegration(
    'compoundV3',
    await setupCompoundV3('CompV3', universe, PROTOCOL_CONFIGS.compV3)
  )

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

  universe.addTradeVenue(
    universe.addIntegration('uniswapV3', await setupUniswapRouter(universe))
  )

  await setupAerodromeRouter(universe)
  const aerodromeWrappers = createProtocolWithWrappers(universe, 'aerodrome')

  for (const wrapperAddress of Object.values(
    PROTOCOL_CONFIGS.aerodrome.lpPoolWrappers
  )) {
    const wrapperToken = await universe.getToken(Address.from(wrapperAddress))
    await aerodromeWrappers.addWrapper(wrapperToken)
  }

  universe.addPreferredRTokenInputToken(
    universe.rTokens.bsd,
    universe.commonTokens.WETH
  )

  universe.addPreferredRTokenInputToken(
    universe.rTokens.bsd,
    universe.nativeToken
  )

  universe.addPreferredRTokenInputToken(
    universe.rTokens.hyUSD,
    universe.commonTokens.USDC
  )

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

  // Set up stargate
  await setupStargate(
    universe,
    PROTOCOL_CONFIGS.stargate.tokens,
    PROTOCOL_CONFIGS.stargate.router,
    {}
  )
  await setupStargateWrapper(universe, PROTOCOL_CONFIGS.stargate.wrappers, {})

  // Set up Dyson
  const depositToDyson = new DysonDepositAction(
    universe,
    universe.commonTokens['vAMM-hyUSD/eUSD'],
    universe.commonTokens['dyson-hyUSDeUSD']
  )
  universe.addAction(depositToDyson)

  universe.defineYieldPositionZap(
    universe.commonTokens['vAMM-hyUSD/eUSD'],
    universe.rTokens.hyUSD
  )

  universe.addSingleTokenPriceSource({
    token: universe.commonTokens['dyson-hyUSDeUSD'],
    priceFn: async () => {
      const lpPrice = await universe.fairPrice(
        universe.commonTokens['vAMM-hyUSD/eUSD'].one
      )

      if (lpPrice == null) {
        throw Error(
          `Failed to price ${universe.commonTokens['dyson-hyUSDeUSD']}: Missing price for vAMM-hyUSD/eUSD`
        )
      }

      const rate = await IDysonVault__factory.connect(
        universe.commonTokens['dyson-hyUSDeUSD'].address.address,
        universe.provider
      ).callStatic.getPricePerFullShare()

      return universe.usd.from((lpPrice.amount * rate.toBigInt()) / ONE)
    },
  })

  // Set up Beefy
  await setupBeefy(universe, PROTOCOL_CONFIGS.beefy)

  // Set up Yearn
  await setupYearn(universe, PROTOCOL_CONFIGS.yearn)
}
