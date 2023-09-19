import { loadTokens } from "./loadTokens";
export const loadEthereumTokenList = async (universe) => {
    const tokens = (await import("./data/ethereum/tokens.json")).default;
    await loadTokens(universe, tokens);
};
//# sourceMappingURL=setupEthereumTokenList.js.map