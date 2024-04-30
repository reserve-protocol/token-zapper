import { type Universe } from '../Universe'
import { RTokenDeployment } from '../action/RTokens'
import { Address } from '../base/Address'

export const loadRToken = async (
  universe: Universe,
  rTokenAddress: Address
) => {
  const rToken = await universe.getToken(rTokenAddress)
  const facade = universe.config.addresses.facadeAddress
  const rtokenDeployment = await RTokenDeployment.load(universe, facade, rToken)
  universe.defineMintable(rtokenDeployment.mint, rtokenDeployment.burn, true)
  return rtokenDeployment
}

export const loadRTokens = (universe: Universe) =>
  Promise.all(
    Object.keys(universe.config.addresses.rTokens).map(async (key) => {
      const rTokenAddress = universe.config.addresses.rTokens[key]
      await loadRToken(universe, rTokenAddress)
    })
  )
