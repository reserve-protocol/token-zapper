import { PXETHDeposit } from '../action/PXETH'
import { Address } from '../base/Address'
import { Token } from '../entities/Token'
import { wrapGasToken } from '../searcher/TradeAction'
import { EthereumUniverse } from './ethereum'

export const setupPXETH = async (
  universe: EthereumUniverse,
  pxeth: Token,
  apxeth: Token,
  oracleAddress: Address
) => {
  const pxETHDeposit = wrapGasToken(
    universe,
    new PXETHDeposit(universe, pxeth, oracleAddress)
  )
  universe.mintableTokens.set(pxeth, pxETHDeposit)
  universe.addAction(pxETHDeposit)

  await universe.addSingleTokenPriceOracle({
    token: apxeth,
    oracleAddress: oracleAddress,
    priceToken: universe.nativeToken,
  })
}
