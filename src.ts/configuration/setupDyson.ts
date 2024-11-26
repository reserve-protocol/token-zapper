import { Universe } from '..'
import { ONE } from '../action/Action'
import { DysonDepositAction } from '../action/Dyson'
import { Address } from '../base/Address'
import { IDysonVault__factory } from '../contracts'

type DysonConfig = {
  vaults: string[]
}

export const setupDyson = async (universe: Universe, config: DysonConfig) => {
  for (const vault of config.vaults) {
    const dysonToken = await universe.getToken(Address.from(vault))
    const lpTokenAddress = await IDysonVault__factory.connect(
      dysonToken.address.address,
      universe.provider
    ).callStatic.want()
    const lpToken = await universe.getToken(Address.from(lpTokenAddress))

    const depositToDyson = new DysonDepositAction(universe, lpToken, dysonToken)
    universe.addAction(depositToDyson)

    universe.addSingleTokenPriceSource({
      token: dysonToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)

        if (lpPrice == null) {
          throw Error(
            `Failed to price ${dysonToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }

        const rate = await IDysonVault__factory.connect(
          dysonToken.address.address,
          universe.provider
        ).callStatic.getPricePerFullShare()

        return universe.usd.from((lpPrice.amount * rate.toBigInt()) / ONE)
      },
    })
  }
}
