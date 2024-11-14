import { REthRouter } from '../action/REth'
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
  const rethRouter = new REthRouter(
    universe,
    reth,
    Address.from(rethRouterAddress)
  )

  const actions = [
    // rethRouter.burnToETH,
    rethRouter.burnToWETH,
    // rethRouter.mintViaETH,
    rethRouter.mintViaWETH,
  ]
  for (const action of actions) {
    universe.addAction(action, reth.address)
  }
}
