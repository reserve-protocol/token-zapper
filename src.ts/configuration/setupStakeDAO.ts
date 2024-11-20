import { Universe } from '..'
import { StakeDAODepositAction } from '../action/StakeDAO'
import { Address } from '../base/Address'
import { IGaugeStakeDAO__factory, IVaultStakeDAO__factory } from '../contracts'

type StakeDAOConfig = {
  gauges: string[]
}

export const setupStakeDAO = async (
  universe: Universe,
  config: StakeDAOConfig
) => {
  for (const gauge of config.gauges) {
    const sdToken = await universe.getToken(Address.from(gauge))

    const stakeDAOVault = await IGaugeStakeDAO__factory.connect(
      sdToken.address.address,
      universe.provider
    ).callStatic.vault()

    const lpTokenAddress = await IVaultStakeDAO__factory.connect(
      stakeDAOVault,
      universe.provider
    ).callStatic.token()

    const lpToken = await universe.getToken(Address.from(lpTokenAddress))

    const depositToStakeDAO = new StakeDAODepositAction(
      universe,
      lpToken,
      sdToken,
      Address.from(stakeDAOVault)
    )
    universe.addAction(depositToStakeDAO)

    universe.addSingleTokenPriceSource({
      token: sdToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)
        if (lpPrice == null) {
          throw Error(
            `Failed to price ${sdToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }
        return lpPrice
      },
    })
  }
}
