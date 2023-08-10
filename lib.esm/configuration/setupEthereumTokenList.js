import { loadTokens } from "./loadTokens";
export const loadEthereumTokenList = async (universe) => {
    await loadTokens(universe, require("./data/ethereum/tokens.json"));
};
//# sourceMappingURL=setupEthereumTokenList.js.map