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
    await Promise.all(Object.keys(universe.config.addresses.commonTokens).map(async (key) => {
        const addr = universe.config.addresses.commonTokens[key];
        universe.commonTokens[key] = await universe.getToken(addr);
    }).concat(Object.keys(universe.config.addresses.rTokens).map(async (key) => {
        const addr = universe.config.addresses.rTokens[key];
        universe.rTokens[key] = await universe.getToken(addr);
    })));
};
//# sourceMappingURL=loadTokens.js.map