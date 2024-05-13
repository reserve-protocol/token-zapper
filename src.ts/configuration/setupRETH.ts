import { REthRouter } from '../action/REth'
import { DexRouter, TradingVenue } from '../aggregators/DexAggregator'
import { Address } from '../base/Address'
import { SwapPlan } from '../searcher/Swap'
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

  const burns = new Map([
    [universe.nativeToken, rethRouter.burnToETH],
    [universe.wrappedNativeToken, rethRouter.burnToWETH],
  ])
  const mints = new Map([
    [universe.nativeToken, rethRouter.mintViaETH],
    [universe.wrappedNativeToken, rethRouter.mintViaWETH],
  ])

  const rocketPoolRouter = DexRouter.builder(
    'RocketpoolRouter',
    async (abort, input, output, slippage) => {
      if (abort.aborted) {
        throw new Error('Aborted')
      }
      const action =
        output === reth ? mints.get(input.token) : burns.get(output)
      if (action == null) {
        throw new Error(`No action for ${input.token} -> ${output}`)
      }
      return await new SwapPlan(universe, [action]).quote(
        [input],
        universe.execAddress
      )
    },
    {
      dynamicInput: true,
      returnsOutput: false,
      onePrZap: true,
    }
  )
    .addOneToMany(reth, [universe.nativeToken, universe.wrappedNativeToken])
    .addManyToOne([universe.nativeToken, universe.wrappedNativeToken], reth)
    .build()

  return new TradingVenue(universe, rocketPoolRouter)
}
