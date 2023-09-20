"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSAToken = void 0;
const SATokens_1 = require("../action/SATokens");
const IStaticATokenLM__factory_1 = require("../contracts/factories/ISAtoken.sol/IStaticATokenLM__factory");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const setupSAToken = async (universe, saToken, underlying) => {
    await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, IStaticATokenLM__factory_1.IStaticATokenLM__factory, saToken, async (rate, saInst) => {
        return {
            fetchRate: async () => (await saInst.rate()).toBigInt(),
            mint: new SATokens_1.MintSATokensAction(universe, underlying, saToken, rate),
            burn: new SATokens_1.BurnSATokensAction(universe, underlying, saToken, rate),
        };
    });
};
exports.setupSAToken = setupSAToken;
//# sourceMappingURL=setupSAToken.js.map