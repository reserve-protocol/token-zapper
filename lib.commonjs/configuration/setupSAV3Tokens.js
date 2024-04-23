"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSAV3Token = void 0;
const SAV3Tokens_1 = require("../action/SAV3Tokens");
const IStaticAV3TokenLM__factory_1 = require("../contracts/factories/contracts/ISAV3Token.sol/IStaticAV3TokenLM__factory");
const setupMintableWithRate_1 = require("./setupMintableWithRate");
const setupSAV3Token = async (universe, saToken, underlying) => {
    await (0, setupMintableWithRate_1.setupMintableWithRate)(universe, IStaticAV3TokenLM__factory_1.IStaticAV3TokenLM__factory, saToken, async (rate, saInst) => {
        return {
            fetchRate: async () => (await saInst.rate()).toBigInt(),
            mint: new SAV3Tokens_1.MintSAV3TokensAction(universe, underlying, saToken, rate),
            burn: new SAV3Tokens_1.BurnSAV3TokensAction(universe, underlying, saToken, rate),
        };
    });
};
exports.setupSAV3Token = setupSAV3Token;
//# sourceMappingURL=setupSAV3Tokens.js.map