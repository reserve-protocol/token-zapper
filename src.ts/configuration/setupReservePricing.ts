import { Universe } from '../Universe'
import { Token } from '../entities/Token'
import { PriceOracle } from '../oracles/PriceOracle'

export const setupReservePricing = (universe: Universe) => {
  const baseUrl = `https://api.reserve.org/current/prices?tokens=`
  const doesNotWork = new Set<Token>()
  const getPrice = async (token: Token) => {
    try {
      if (universe.lpTokens.has(token)) {
        return null
      }
      if (universe.wrappedTokens.has(token)) {
        return null
      }
      if (doesNotWork.has(token)) {
        return null
      }

      const url = `${baseUrl}${token.address.address}`
      const req = await fetch(url)
      if (!req.ok) {
        return null
      }

      const data: { address: string; price: number; timestamp: number }[] =
        await req.json()
      const out = universe.usd.from(data[0].price)
      return out
    } catch (e) {
      doesNotWork.add(token)
      return null
    }
  }
  universe.oracles.push(
    new PriceOracle(
      universe.config.requoteTolerance,
      'reserve',
      getPrice,
      () => universe.currentBlock
    )
  )
  return async (token: Token) => {
    const price = await getPrice(token)
    if (price != null) {
      return price
    }
    throw new Error('Reserve: ' + token + ' not found')
  }
}
