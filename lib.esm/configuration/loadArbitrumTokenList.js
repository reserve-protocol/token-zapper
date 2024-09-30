import { loadTokens } from './loadTokens';
import tokens from './data/arbitrum/tokens.json';
export const loadArbitrumTokenList = async (universe) => {
    await loadTokens(universe, tokens);
};
//# sourceMappingURL=loadArbitrumTokenList.js.map