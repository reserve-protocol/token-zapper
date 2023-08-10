
import { Address } from '../base/Address'
import { CHAINLINK_BTC_TOKEN_ADDRESS, GAS_TOKEN_ADDRESS } from '../base/constants'
import { setupCompoundLike } from './setupCompound'
import { setupSAToken } from './setupSAToken'
import { setupLido } from './setupLido'
import { setupRETH } from './setupRETH'
import { setupChainLink as setupChainLinkRegistry } from './setupChainLink'
import { setupWrappedGasToken } from './setupWrappedGasToken'
import { initCurveOnEthereum } from './setupCurveOnEthereum'
import { loadEthereumTokenList } from './setupEthereumTokenList'
import { loadRTokens } from './setupRTokens'
import { type EthereumUniverse, PROTOCOL_CONFIGS } from './ethereum'
import { convertWrapperTokenAddressesIntoWrapperTokenPairs } from './convertWrapperTokenAddressesIntoWrapperTokenPairs'

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
    ]
  );

  setupWrappedGasToken(
    universe
  )

  const wrappedToUnderlyingMapping =
    require('./data/ethereum/underlying.json') as Record<string, string>;

  // Set up compound
  const cTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
    universe,
    PROTOCOL_CONFIGS.compound.markets,
    wrappedToUnderlyingMapping
  )
  await setupCompoundLike(universe, {
    cEth: await universe.getToken(
      Address.from(PROTOCOL_CONFIGS.compound.cEther)
    ),
    comptroller: Address.from(PROTOCOL_CONFIGS.compound.comptroller),
  }, cTokens)


  // Set up flux finance
  const fTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
    universe,
    PROTOCOL_CONFIGS.fluxFinance.markets,
    wrappedToUnderlyingMapping
  )
  await setupCompoundLike(universe, {
    comptroller: Address.from(PROTOCOL_CONFIGS.fluxFinance.comptroller),
  }, fTokens)


  // Set up AAVEV2
  const saTokens = await convertWrapperTokenAddressesIntoWrapperTokenPairs(
    universe,
    PROTOCOL_CONFIGS.aavev2.tokenWrappers,
    wrappedToUnderlyingMapping
  );
  await Promise.all(saTokens.map(({ underlying, wrappedToken }) => setupSAToken(
    universe,
    wrappedToken,
    underlying,
  )))

  // Set up RETH
  await setupRETH(
    universe,
    PROTOCOL_CONFIGS.rocketPool.reth,
    PROTOCOL_CONFIGS.rocketPool.router,
  )

  // Set up Lido
  await setupLido(
    universe,
    PROTOCOL_CONFIGS.lido.steth,
    PROTOCOL_CONFIGS.lido.wsteth,
  )

  // Set up RTokens defined in the config
  await loadRTokens(universe)

  await initCurveOnEthereum(universe, PROTOCOL_CONFIGS.convex.booster)
}