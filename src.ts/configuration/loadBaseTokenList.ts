import { type JsonTokenEntry, loadTokens } from "./loadTokens"
import { type Universe } from "../Universe"
import tokens from "./data/base/tokens.json"

export const loadBaseTokenList = async (universe: Universe) => {
    await loadTokens(universe, tokens as JsonTokenEntry[])
}