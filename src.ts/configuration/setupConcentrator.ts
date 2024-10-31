import { ConcentratorDepositAction } from '../action/Concentrator'
import { Address } from '../base/Address'
import { type EthereumUniverse } from './ethereum'

type ConcentratorConfig = {
  vault: string
  pid: number
}

export const setupConcentrator = (
  universe: EthereumUniverse,
  config: ConcentratorConfig
) => {
  const vaultAddress = Address.from(config.vault)

  const depositToConcentrator = new ConcentratorDepositAction(
    universe,
    universe.commonTokens['ETH+ETH-f'],
    universe.commonTokens['virtualERC20'],
    Address.from(vaultAddress),
    config.pid
  )
  universe.addAction(depositToConcentrator)
}
