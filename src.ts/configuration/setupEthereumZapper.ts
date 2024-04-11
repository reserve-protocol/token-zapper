import { Address } from '../base/Address'
import {
  CHAINLINK_BTC_TOKEN_ADDRESS,
  GAS_TOKEN_ADDRESS,
} from '../base/constants'
import { setupCompoundLike } from './setupCompound'
import { setupSAToken } from './setupSAToken'
import { setupLido } from './setupLido'
import { setupRETH } from './setupRETH'
import { setupERC4626 } from './setupERC4626'
import { setupCompoundV3 } from './setupCompoundV3'
import { setupChainLink as setupChainLinkRegistry } from './setupChainLink'
import { setupWrappedGasToken } from './setupWrappedGasToken'
import { initCurveOnEthereum } from './setupCurveOnEthereum'
import { loadEthereumTokenList } from './setupEthereumTokenList'
import { loadRTokens } from './setupRTokens'
import { type EthereumUniverse, PROTOCOL_CONFIGS } from './ethereum'
import { convertWrapperTokenAddressesIntoWrapperTokenPairs } from './convertWrapperTokenAddressesIntoWrapperTokenPairs'
import wrappedToUnderlyingMapping from './data/ethereum/underlying.json'
import { setupSAV3Token } from './setupSAV3Tokens'


export const setupEthereumZapper = async (universe: EthereumUniverse) => {
  await loadEthereumTokenList(universe)
  // Searcher depends on a way to price tokens
  // Below we set up the chainlink registry to price tokens
  const chainLinkETH = Address.from(GAS_TOKEN_ADDRESS)
  const chainLinkBTC = Address.from(CHAINLINK_BTC_TOKEN_ADDRESS)

  setupChainLinkRegistry(
    universe,
    PROTOCOL_CONFIGS.chainLinkRegistry,
    [
      [universe.commonTokens.WBTC, chainLinkBTC],
      [universe.commonTokens.WETH, chainLinkETH],
      [universe.nativeToken, chainLinkETH],
    ],
    [
      [
        universe.commonTokens.reth,
        {
          uoaToken: universe.nativeToken,
          derivedTokenUnit: chainLinkETH,
        },
      ],
    ]
  )

  setupWrappedGasToken(universe)

  // Set up compound
  const cTokens = await Promise.all(
    (
      await convertWrapperTokenAddressesIntoWrapperTokenPairs(
        universe,
        PROTOCOL_CONFIGS.compound.markets,
        wrappedToUnderlyingMapping
      )
    ).map(async (a) => ({
      ...a,
      collaterals: await Promise.all(
        (
          PROTOCOL_CONFIGS.compound.collaterals[
            a.wrappedToken.address.address
          ] ?? []
        ).map((a) => universe.getToken(Address.from(a)))
      ),
    }))
  )

  await setupCompoundLike(
    universe,
    {
      cEth: await universe.getToken(
        Address.from(PROTOCOL_CONFIGS.compound.cEther)
      ),
      comptroller: Address.from(PROTOCOL_CONFIGS.compound.comptroller),
    },
    cTokens
  )

  // Set up flux finance
  const fTokens = await Promise.all(
    (
      await convertWrapperTokenAddressesIntoWrapperTokenPairs(
        universe,
        PROTOCOL_CONFIGS.fluxFinance.markets,
        wrappedToUnderlyingMapping
      )
    ).map(async (a) => ({
      ...a,
      collaterals: await Promise.all(
        (
          PROTOCOL_CONFIGS.fluxFinance.collaterals[
            a.wrappedToken.address.address
          ] ?? []
        ).map((a) => universe.getToken(Address.from(a)))
      ),
    }))
  )

  await setupCompoundLike(
    universe,
    {
      comptroller: Address.from(PROTOCOL_CONFIGS.fluxFinance.comptroller),
    },
    fTokens
  )

  // Load compound v3
  const compoundV3Markets = await Promise.all(
    PROTOCOL_CONFIGS.compoundV3.markets.map(async (a) => {
      return {
        baseToken: await universe.getToken(Address.from(a.baseToken)),
        receiptToken: await universe.getToken(Address.from(a.receiptToken)),
        vaults: await Promise.all(
          a.vaults.map((vault) => universe.getToken(Address.from(vault)))
        ),
      }
    })
  )

  await setupCompoundV3(universe, compoundV3Markets)

  // Set up AAVEV2
  const saTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
    universe,
    PROTOCOL_CONFIGS.aavev2.tokenWrappers,
    wrappedToUnderlyingMapping
  )
  await Promise.all(
    saTokens.map(({ underlying, wrappedToken }) =>
      setupSAToken(universe, wrappedToken, underlying)
    )
  )

  // Set up RETH
  // if (0) {
  await setupRETH(
    universe,
    PROTOCOL_CONFIGS.rocketPool.reth,
    PROTOCOL_CONFIGS.rocketPool.router
  )
  // }

  // Set up Lido
  await setupLido(
    universe,
    PROTOCOL_CONFIGS.lido.steth,
    PROTOCOL_CONFIGS.lido.wsteth
  )

  await setupERC4626(
    universe,
    PROTOCOL_CONFIGS.erc4626,
    wrappedToUnderlyingMapping
  )

  // Set up RTokens defined in the config
  await loadRTokens(universe)

  const curve = await initCurveOnEthereum(
    universe,
    PROTOCOL_CONFIGS.convex.booster
  ).catch((e) => {
    console.log('Failed to intialize curve')
    console.log(e)
    return null as any
  })

  const aaveWrapperToUnderlying = {
    '0x093cB4f405924a0C468b43209d5E466F1dd0aC7d':
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0x1576B2d7ef15a2ebE9C22C8765DD9c1EfeA8797b':
      '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
  }
  const saV3Tokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
    universe,
    PROTOCOL_CONFIGS.aavev3.tokenWrappers,
    aaveWrapperToUnderlying
  )
  await Promise.all(
    saV3Tokens.map(({ underlying, wrappedToken }) =>
      setupSAV3Token(universe, wrappedToken, underlying)
    )
  )

  return {
    curve,
  }
}
