export { Address } from './base/Address'
export { Token, TokenQuantity } from './entities/Token'

export { ArbitrumUniverse, arbiConfig } from './configuration/arbitrum'
export { setupArbitrumZapper } from './configuration/setupArbitrumZapper'

export { BaseUniverse, baseConfig } from './configuration/base'
export { setupBaseZapper } from './configuration/setupBaseZapper'

export { ethereumConfig } from './configuration/ethereum'
export { setupEthereumZapper } from './configuration/setupEthereumZapper'

import { ArbitrumUniverse, arbiConfig } from './configuration/arbitrum'
import { setupArbitrumZapper } from './configuration/setupArbitrumZapper'

import { BaseUniverse, baseConfig } from './configuration/base'
import { setupBaseZapper } from './configuration/setupBaseZapper'

import { EthereumUniverse, ethereumConfig } from './configuration/ethereum'
import { setupEthereumZapper } from './configuration/setupEthereumZapper'

import { loadTokens } from './configuration/loadTokens'
import { makeConfig } from './configuration/ChainConfiguration'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainIds } from './configuration/ReserveAddresses'
import { Universe } from './Universe'
export { type Config } from './configuration/ChainConfiguration'

export const configuration = {
  utils: {
    loadTokens,
  },
  makeConfig,
}

export { Searcher } from './searcher/Searcher'
export { Universe } from './Universe'

export { createKyberswap } from './aggregators/Kyberswap'
export { createEnso } from './aggregators/Enso'

const CHAIN_ID_TO_CONFIG = {
  [ChainIds.Mainnet]: {
    config: ethereumConfig,
    blockTime: 12,
    setup: setupEthereumZapper,
  },
  [ChainIds.Arbitrum]: {
    config: arbiConfig,
    blockTime: 0.25,
    setup: setupArbitrumZapper,
  },
  [ChainIds.Base]: {
    config: baseConfig,
    blockTime: 2,
    setup: setupBaseZapper,
  },
}

type ChainIdToUni = {
  [ChainIds.Arbitrum]: ArbitrumUniverse
  [ChainIds.Base]: BaseUniverse
  [ChainIds.Mainnet]: EthereumUniverse
}

export const fromProvider = async <
  const ID extends keyof typeof CHAIN_ID_TO_CONFIG
>(
  provider: JsonRpcProvider,
  chainId: ID
): Promise<ChainIdToUni[ID]> => {
  const network = await provider.getNetwork()
  if (chainId !== network.chainId) {
    throw new Error(
      `provider chainId (${network.chainId}) does not match requested chainId (${chainId})`
    )
  }
  const { config, setup } = CHAIN_ID_TO_CONFIG[chainId]
  const universe = await Universe.createWithConfig(
    provider,
    config,
    async (uni) => {
      await setup(uni as any)
    }
  )
  return universe as ChainIdToUni[ID]
}
