export { Address } from './base/Address'
export { Token, TokenQuantity } from './entities/Token'

export { ArbitrumUniverse, arbiConfig, PROTOCOL_CONFIGS as arbiProtocolConfigs } from './configuration/arbitrum'
export { setupArbitrumZapper } from './configuration/setupArbitrumZapper'

export { BaseUniverse, baseConfig, PROTOCOL_CONFIGS as baseProtocolConfigs } from './configuration/base'
export { setupBaseZapper } from './configuration/setupBaseZapper'

export { ethereumConfig, PROTOCOL_CONFIGS as ethereumProtocolConfigs } from './configuration/ethereum'
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
import {
  ChainId,
  ChainIds,
  isChainIdSupported,
} from './configuration/ReserveAddresses'
import { Universe } from './Universe'
import { createKyberswap } from './aggregators/Kyberswap'
import { createEnso } from './aggregators/Enso'
export { createParaswap } from './aggregators/Paraswap'

export { type Config } from './configuration/ChainConfiguration'
export {
  makeCustomRouterSimulator,
  makeCallManySimulator,
  createSimulateZapTransactionUsingProvider,
  SimulateParams,
} from './configuration/ZapSimulation'

export const configuration = {
  utils: {
    loadTokens,
  },
  makeConfig,
}

export { Universe } from './Universe'

export { createKyberswap } from './aggregators/Kyberswap'
export { createEnso } from './aggregators/Enso'

const CHAIN_ID_TO_CONFIG: Record<
  ChainId,
  {
    config: ReturnType<typeof makeConfig>
    blockTime: number
    setup: (uni: any) => Promise<void>
    setupWithDexes: (uni: any) => Promise<void>
  }
> = {
  [ChainIds.Mainnet]: {
    config: ethereumConfig,
    blockTime: 12,
    setup: setupEthereumZapper,
    setupWithDexes: async (uni: EthereumUniverse) => {
      uni.addTradeVenue(createKyberswap('Kyberswap', uni))
      uni.addTradeVenue(createEnso('Enso', uni, 1))
      await setupEthereumZapper(uni)
    },
  },
  [ChainIds.Arbitrum]: {
    config: arbiConfig,
    blockTime: 0.25,
    setup: setupArbitrumZapper,
    setupWithDexes: async (uni: ArbitrumUniverse) => {
      uni.addTradeVenue(createKyberswap('Kyberswap', uni))
      uni.addTradeVenue(createEnso('Enso', uni, 1))
      await setupArbitrumZapper(uni)
    },
  },
  [ChainIds.Base]: {
    config: baseConfig,
    blockTime: 2,
    setup: setupBaseZapper,
    setupWithDexes: async (uni: BaseUniverse) => {
      uni.addTradeVenue(createKyberswap('Kyberswap', uni))
      uni.addTradeVenue(createEnso('Enso', uni, 1))
      await setupBaseZapper(uni)
    },
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
  withDexes: boolean = true
): Promise<ChainIdToUni[ID]> => {
  const network = await provider.getNetwork()
  const chainId = network.chainId
  if (isChainIdSupported(chainId) === false) {
    throw new Error(`chainId ${chainId} is not supported`)
  }
  if (chainId !== network.chainId) {
    throw new Error(
      `provider chainId (${network.chainId}) does not match requested chainId (${chainId})`
    )
  }
  const { config, setup, setupWithDexes } = CHAIN_ID_TO_CONFIG[chainId]
  const universe = await Universe.createWithConfig(
    provider,
    config,
    async (uni) => {
      if (withDexes) {
        await setupWithDexes(uni as any)
      } else {
        await setup(uni as any)
      }
    }
  )
  await universe.updateBlockState(
    await provider.getBlockNumber(),
    (await provider.getGasPrice()).toBigInt()
  )
  return universe as ChainIdToUni[ID]
}
