import { type JsonTokenEntry, loadTokens } from './loadTokens'
import { type Universe } from '../Universe'
import tokens from './data/arbitrum/tokens.json'

export const loadArbitrumTokenList = async (universe: Universe) => {
  await loadTokens(universe, tokens as JsonTokenEntry[])
}
