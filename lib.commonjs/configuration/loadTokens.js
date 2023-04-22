"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTokens = void 0;
const Address_1 = require("../base/Address");
/**
 * Helper method for loading in tokens from a JSON file into the universe
 * It also initializes the rTokens and commonTokens fields based on the
 * addresses in the chain configuration.
 *
 * @param universe
 * @param tokens
 */
const loadTokens = async (universe, tokens) => {
    for (const token of tokens) {
        universe.createToken(Address_1.Address.from(token.address), token.symbol, token.name, token.decimals);
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
exports.loadTokens = loadTokens;
//# sourceMappingURL=loadTokens.js.map