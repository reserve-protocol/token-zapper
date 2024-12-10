import { Universe } from '../Universe'
import { Token } from '../entities/Token'
import { PriceOracle } from '../oracles/PriceOracle'

export const setupOdosPricing = (universe: Universe) => {
  const baseUrl = `https://api.odos.xyz/pricing/token/${universe.chainId}`
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

      const url = `${baseUrl}/${token.address.address}`
      const req = await fetch(url)
      if (!req.ok) {
        return null
      }

      const data: { currencyId: string; price: number } = await req.json()
      const out = universe.usd.from(
        Math.floor(data.price * 100000000) / 100000000
      )
      return out
    } catch (e) {
      doesNotWork.add(token)
      return null
    }
  }
  universe.oracles.push(
    new PriceOracle(
      universe.config.requoteTolerance,
      'odos',
      getPrice,
      () => universe.currentBlock
    )
  )
  return async (token: Token) => {
    const price = await getPrice(token)
    if (price != null) {
      return price
    }
    throw new Error('ODOS: ' + token + ' not found')
  }
}
