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
    const commenTokenMap = universe.config.addresses.commonTokens;
    const rTokenMap = universe.config.addresses.rTokens;
    const [commenToks, rTokens] = await Promise.all([
        Promise.all(Object.keys(commenTokenMap).map(async (key) => {
            const addr = commenTokenMap[key];
            return [key, await universe.getToken(addr).catch(() => null)];
        })),
        Promise.all(Object.keys(rTokenMap).map(async (key) => {
            const addr = rTokenMap[key];
            return [key, await universe.getToken(addr).catch(() => null)];
        })),
    ]);
    for (const [key, token] of commenToks) {
        if (token == null) {
            console.warn(`Failed to load token ${key} at address ${universe.config.addresses.commonTokens[key]}`);
            continue;
        }
        universe.commonTokens[key] = token;
    }
    for (const [key, token] of rTokens) {
        if (token == null) {
            console.warn(`Failed to load token ${key} at address ${universe.config.addresses.commonTokens[key]}`);
            continue;
        }
        universe.rTokens[key] = token;
    }
};
//# sourceMappingURL=loadTokens.js.map