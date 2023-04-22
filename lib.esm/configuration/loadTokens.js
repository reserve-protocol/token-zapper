import { Address } from '../base/Address';
/**
 * Helper method for loading in tokens from a JSON file into the universe
 * It also initializes the rTokens and commonTokens fields based on the
 * addresses in the chain configuration.
 *
 * @param universe
 * @param tokens
 */
export const loadTokens = async (universe, tokens) => {
    for (const token of tokens) {
        universe.createToken(Address.from(token.address), token.symbol, token.name, token.decimals);
    }
    const commonTokenSymbols = Object.keys(universe.commonTokens);
    await Promise.all(commonTokenSymbols.map(async (key) => {
        const addr = universe.chainConfig.config.addresses.commonTokens[key];
        if (addr == null) {
            return;
        }
        universe.commonTokens[key] = await universe.getToken(addr);
    }));
};
//# sourceMappingURL=loadTokens.js.map