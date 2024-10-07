"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEthereumTokenList = void 0;
const tslib_1 = require("tslib");
const loadTokens_1 = require("./loadTokens");
const tokens_json_1 = tslib_1.__importDefault(require("./data/ethereum/tokens.json"));
const loadEthereumTokenList = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, tokens_json_1.default);
};
exports.loadEthereumTokenList = loadEthereumTokenList;
//# sourceMappingURL=setupEthereumTokenList.js.map