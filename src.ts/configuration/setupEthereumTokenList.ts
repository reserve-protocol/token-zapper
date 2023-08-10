import { type JsonTokenEntry, loadTokens } from "./loadTokens"
import { type Universe } from "../Universe"

export const loadEthereumTokenList = async (universe: Universe) => {
    await loadTokens(universe, require("./data/ethereum/tokens.json") as JsonTokenEntry[])
}