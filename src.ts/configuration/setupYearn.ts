import { Universe } from '..'
import { ONE } from '../action/Action'
import { YearnDepositAction } from '../action/Yearn'
import { Address } from '../base/Address'
import { IVaultYearn__factory } from '../contracts'

type YearnConfig = {
  vaults: string[]
}

export const setupYearn = async (universe: Universe, config: YearnConfig) => {
  for (const vault of config.vaults) {
    const yvToken = await universe.getToken(Address.from(vault))

    const lpTokenAddress = await IVaultYearn__factory.connect(
      yvToken.address.address,
      universe.provider
    ).callStatic.token()

    const lpToken = await universe.getToken(Address.from(lpTokenAddress))

    const getRate = universe.createCachedProducer(async () => {
      const rate = await IVaultYearn__factory.connect(
        yvToken.address.address,
        universe.provider
      ).callStatic.pricePerShare()
      return rate.toBigInt()
    })

    const depositToYearn = new YearnDepositAction(
      universe,
      lpToken,
      yvToken,
      getRate
    )
    universe.addAction(depositToYearn)

    universe.addSingleTokenPriceSource({
      token: yvToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)

        if (lpPrice == null) {
          throw Error(
            `Failed to price ${yvToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }
        const rate = await IVaultYearn__factory.connect(
          yvToken.address.address,
          universe.provider
        ).callStatic.pricePerShare()

        return universe.usd.from((lpPrice.amount * rate.toBigInt()) / ONE)
      },
    })
  }
}
