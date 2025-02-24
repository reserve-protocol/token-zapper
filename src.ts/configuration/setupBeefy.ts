import { Universe } from '..'
import { ONE } from '../action/Action'
import { BeefyDepositAction, BeefyWithdrawAction } from '../action/Beefy'
import { Address } from '../base/Address'
import { IBeefyVault__factory } from '../contracts'

type BeefyConfig = {
  vaults: string[]
}

export const setupBeefy = async (universe: Universe, config: BeefyConfig) => {
  await Promise.all(
    config.vaults.map(async (vault) => {
      const vaultToken = await universe.getToken(Address.from(vault))
      const lpTokenAddress = await IBeefyVault__factory.connect(
        vaultToken.address.address,
        universe.provider
      ).callStatic.want()
      const underlyingToken = await universe.getToken(
        Address.from(lpTokenAddress)
      )

      const getRate = universe.createCachedProducer(async () => {
        const rate = await IBeefyVault__factory.connect(
          vaultToken.address.address,
          universe.provider
        ).callStatic.getPricePerFullShare()
        return rate.toBigInt()
      })
      const depositToBeefy = new BeefyDepositAction(
        universe,
        underlyingToken,
        vaultToken,
        getRate
      )
      const withdrawFromBeefy = new BeefyWithdrawAction(
        universe,
        underlyingToken,
        vaultToken,
        getRate
      )
      universe.defineMintable(depositToBeefy, withdrawFromBeefy)

      universe.addSingleTokenPriceSource({
        token: vaultToken,
        priceFn: async () => {
          const innerPrice = await universe.fairPrice(underlyingToken.one)

          if (innerPrice == null) {
            throw Error(
              `Failed to price ${vaultToken.symbol}: Missing price for ${underlyingToken.symbol}`
            )
          }

          const rate = await IBeefyVault__factory.connect(
            vaultToken.address.address,
            universe.provider
          ).callStatic.getPricePerFullShare()

          const price = universe.usd.from(
            (innerPrice.amount * rate.toBigInt()) / ONE
          )

          console.log(`${vaultToken.symbol} price: ${price.asNumber()}`)
          return price
        },
      })
    })
  )
}
