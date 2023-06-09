import { Address } from '../base/Address'
import { TokenQuantity } from '../entities'
import { Universe } from '../Universe'
import { CommonTokens } from './StaticConfig'

export interface JsonTokenEntry {
  address: string
  symbol: string
  name: string
  decimals: number
}
/**
 * Helper method for loading in tokens from a JSON file into the universe
 * It also initializes the rTokens and commonTokens fields based on the
 * addresses in the chain configuration.
 *
 * @param universe
 * @param tokens
 */
export const loadTokens = (universe: Universe, tokens: JsonTokenEntry[]) => {
  for (const token of tokens) {
    universe.createToken(
      Address.from(token.address),
      token.symbol,
      token.name,
      token.decimals
    )
  }

  const commonTokenSymbols = Object.keys(
    universe.commonTokens
  ) as (keyof CommonTokens)[]
  commonTokenSymbols.forEach(async (key) => {
    const addr = universe.chainConfig.config.addresses.commonTokens[key]
    if (addr == null) {
      return
    }
    universe.commonTokens[key] = universe.tokens.get(addr)!
  })
}
