import { Universe } from '..'
import { ONE } from '../action/Action'
import { BeefyDepositAction, BeefyWithdrawAction } from '../action/Beefy'
import { Address } from '../base/Address'
import { IBeefyVault__factory } from '../contracts'

type BeefyConfig = {
  vaults: string[]
}

const beefySpecialCases = new Map<Address, bigint>([
  [Address.from('0x562ea6fffd1293b9433e7b81a2682c31892ea013'), 10n ** 12n],
])

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

      const contract = IBeefyVault__factory.connect(
        vaultToken.address.address,
        universe.provider
      )
      const getRate = universe.createCachedProducer(async () => {
        const rate = await contract.callStatic.getPricePerFullShare()
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
          const [innerQty] = await withdrawFromBeefy.quote([vaultToken.one])

          let innerPrice = await universe.fairPrice(innerQty)
          if (beefySpecialCases.has(vaultToken.address)) {
            innerPrice = innerQty.token.from(
              innerQty.amount * beefySpecialCases.get(vaultToken.address)!
            )
          }

          if (innerPrice == null) {
            throw Error(
              `Failed to price ${vaultToken.symbol}: Missing price for ${underlyingToken.symbol}`
            )
          }

          return innerPrice
        },
      })
    })
  )
}
