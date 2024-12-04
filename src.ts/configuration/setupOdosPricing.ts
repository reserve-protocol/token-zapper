import { Universe } from '../Universe'
import { Token } from '../entities/Token'
import { PriceOracle } from '../oracles/PriceOracle'

export const setupOdosPricing = (universe: Universe) => {
  const baseUrl = `https://api.odos.xyz/pricing/token/${universe.chainId}`
  const doesNotWork = new Set<Token>()
  universe.oracles.push(
    new PriceOracle(
      universe.config.requoteTolerance,
      'odos',
      async (token: Token) => {
        try {
          if (doesNotWork.has(token)) {
            return null
          }

          const req = await fetch(`${baseUrl}/${token.address.address}`)
          if (!req.ok) {
            return null
          }
          const data: { currencyId: string; price: number } = await req.json()
          return universe.usd.from(
            Math.floor(data.price * 100000000) / 100000000
          )
        } catch (e) {
          doesNotWork.add(token)
          return null
        }
      },
      () => universe.currentBlock
    )
  )
}
