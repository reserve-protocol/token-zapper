import { loadTokens } from "./loadTokens";
import tokens from "./data/base/tokens.json";
export const loadBaseTokenList = async (universe) => {
    await loadTokens(universe, tokens);
};
//# sourceMappingURL=loadBaseTokenList.js.map