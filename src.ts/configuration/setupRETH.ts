import { RocketPoolContext } from '../action/REth'
import { Address } from '../base/Address'
import { type EthereumUniverse } from './ethereum'

export const setupRETH = async (
  universe: EthereumUniverse,
  config: {
    reth: string
    router: string
  }
) => {
  const rethAddress = Address.from(config.reth)
  const rethRouterAddress = Address.from(config.router)
  const reth = await universe.getToken(Address.from(rethAddress))
  const rethRouter = new RocketPoolContext(
    universe,
    reth,
    Address.from(rethRouterAddress)
  )

  universe.mintableTokens.set(reth, rethRouter.poolDeposit)
  universe.addAction(rethRouter.poolDeposit)
  // universe.addAction(rethRouter.routerToReth)
  // universe.addAction(rethRouter.routerToETH)
}
