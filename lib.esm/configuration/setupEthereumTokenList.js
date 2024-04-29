import { loadTokens } from "./loadTokens";
import tokens from "./data/ethereum/tokens.json";
export const loadEthereumTokenList = async (universe) => {
    await loadTokens(universe, tokens);
};
//# sourceMappingURL=setupEthereumTokenList.js.map