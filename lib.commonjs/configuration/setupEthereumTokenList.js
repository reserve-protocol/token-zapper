"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEthereumTokenList = void 0;
const loadTokens_1 = require("./loadTokens");
const loadEthereumTokenList = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, require("./data/ethereum/tokens.json"));
};
exports.loadEthereumTokenList = loadEthereumTokenList;
//# sourceMappingURL=setupEthereumTokenList.js.map