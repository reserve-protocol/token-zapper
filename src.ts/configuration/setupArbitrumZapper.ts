import { Address } from '../base/Address'
import { type Token } from '../entities/Token'
import { OffchainOracleRegistry } from '../oracles/OffchainOracleRegistry'
import { ArbitrumUniverse, PROTOCOL_CONFIGS } from './arbitrum'
import { loadArbitrumTokenList } from './loadArbitrumTokenList'
import { setupAaveV3 } from './setupAaveV3'
import { setupCompoundV3 } from './setupCompV3'
import { setupERC4626 } from './setupERC4626'
import { setupUniswapV3Router } from './setupUniswapRouter'
import { setupWrappedGasToken } from './setupWrappedGasToken'

export const setupArbitrumZapper = async (universe: ArbitrumUniverse) => {
  // console.log('Loading tokens')
  await loadArbitrumTokenList(universe)

  // console.log('Setting up wrapped gas token')
  await setupWrappedGasToken(universe)

  // console.log('Setting up oracles')
  const wsteth = universe.commonTokens.wstETH
  const registry: OffchainOracleRegistry = new OffchainOracleRegistry(
    universe.config.requoteTolerance,
    'ArbiOracles',
    async (token: Token) => {
      if (token === universe.commonTokens.USDM) {
        const oraclewusdm = registry.getOracle(
          universe.commonTokens.WUSDM.address,
          universe.usd.address
        )

        if (oraclewusdm == null) {
          return null
        }

        return universe.usd.one
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
      const decimals = BigInt(await oracle.callStatic.decimals())
      const answer = (await oracle.callStatic.latestAnswer()).toBigInt()
      if (decimals > 8) {
        return universe.usd.from(answer / 10n ** (decimals - 8n))
      }
      if (decimals < 8) {
        return universe.usd.from(answer * 10n ** (8n - decimals))
      }

      return universe.usd.from(answer)
    },
    () => universe.currentBlock,
    universe.provider
  )
  // console.log('ASSET -> USD oracles')
  Object.entries(PROTOCOL_CONFIGS.oracles.USD).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.usd.address,
        Address.from(oracleAddress)
      )
    }
  )
  // console.log('ASSET -> ETH oracles')
  Object.entries(PROTOCOL_CONFIGS.oracles.ETH).map(
    ([tokenAddress, oracleAddress]) => {
      registry.register(
        Address.from(tokenAddress),
        universe.nativeToken.address,
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

  // Set up AAVEV2
  universe.addIntegration(
    'aaveV3',
    await setupAaveV3(universe, PROTOCOL_CONFIGS.aaveV3)
  )

  const router = await setupUniswapV3Router(universe)
  universe.addIntegration('uniswapV3', await router.venue())

  universe.addPreferredRTokenInputToken(
    universe.rTokens.KNOX,
    universe.commonTokens.USDC
  )

  await Promise.all(
    PROTOCOL_CONFIGS.erc4626.map(async ([addr, proto]) => {
      const vault = await setupERC4626(universe, {
        vaultAddress: addr,
        protocol: proto,
        slippage: 0n,
      })
      return vault
    })
  )
}
