import { ConcentratorDepositAction } from '../action/Concentrator'
import { Address } from '../base/Address'
import { type EthereumUniverse } from './ethereum'

type ConcentratorConfig = {
  vault: string
  pid: number
}

export const setupConcentrator = async (
  universe: EthereumUniverse,
  config: ConcentratorConfig
) => {
  universe.addSingleTokenPriceSource({
    token: universe.commonTokens['consETHETH-f'],
    priceFn: async () => {
      const lpPrice = await universe.fairPrice(
        universe.commonTokens['ETH+ETH-f'].one
      )
      if (lpPrice == null) {
        throw Error(
          `Failed to price ${universe.commonTokens['consETHETH-f']}: Missing price for ETH+ETH-f`
        )
      }
      return lpPrice
    },
  })

  const vaultAddress = Address.from(config.vault)

  const depositToConcentrator = new ConcentratorDepositAction(
    universe,
    universe.commonTokens['ETH+ETH-f'],
    universe.commonTokens['consETHETH-f'],
    Address.from(vaultAddress),
    config.pid
  )
  universe.addAction(depositToConcentrator)
}
