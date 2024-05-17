"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadArbitrumTokenList = void 0;
const tslib_1 = require("tslib");
const loadTokens_1 = require("./loadTokens");
const tokens_json_1 = tslib_1.__importDefault(require("./data/arbitrum/tokens.json"));
const loadArbitrumTokenList = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, tokens_json_1.default);
};
exports.loadArbitrumTokenList = loadArbitrumTokenList;
//# sourceMappingURL=loadArbitrumTokenList.js.map