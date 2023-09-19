import { type JsonTokenEntry, loadTokens } from "./loadTokens"
import { type Universe } from "../Universe"

export const loadEthereumTokenList = async (universe: Universe) => {
    const tokens = (await import("./data/ethereum/tokens.json", { assert: { type: 'json' }})).default
    await loadTokens(universe, tokens as JsonTokenEntry[])
}