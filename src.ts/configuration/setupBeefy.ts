import { Universe } from '..'
import { ONE } from '../action/Action'
import { BeefyDepositAction } from '../action/Beefy'
import { Address } from '../base/Address'
import { IBeefyVault__factory } from '../contracts'

type BeefyConfig = {
  vaults: string[]
}

export const setupBeefy = async (universe: Universe, config: BeefyConfig) => {
  for (const vault of config.vaults) {
    const mooToken = await universe.getToken(Address.from(vault))
    const lpTokenAddress = await IBeefyVault__factory.connect(
      mooToken.address.address,
      universe.provider
    ).callStatic.want()
    const lpToken = await universe.getToken(Address.from(lpTokenAddress))

    const depositToBeefy = new BeefyDepositAction(universe, lpToken, mooToken)
    universe.addAction(depositToBeefy)

    universe.addSingleTokenPriceSource({
      token: mooToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)

        if (lpPrice == null) {
          throw Error(
            `Failed to price ${mooToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }

        const rate = await IBeefyVault__factory.connect(
          mooToken.address.address,
          universe.provider
        ).callStatic.getPricePerFullShare()

        return universe.usd.from((lpPrice.amount * rate.toBigInt()) / ONE)
      },
    })
  }
}
