import { type JsonTokenEntry, loadTokens } from "./loadTokens"
import { type Universe } from "../Universe"
import tokens from "./data/ethereum/tokens.json"

export const loadEthereumTokenList = async (universe: Universe) => {
    await loadTokens(universe, tokens as JsonTokenEntry[])
}