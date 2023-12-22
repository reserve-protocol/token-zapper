"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBaseTokenList = void 0;
const loadTokens_1 = require("./loadTokens");
const tokens_json_1 = __importDefault(require("./data/base/tokens.json"));
const loadBaseTokenList = async (universe) => {
    await (0, loadTokens_1.loadTokens)(universe, tokens_json_1.default);
};
exports.loadBaseTokenList = loadBaseTokenList;
//# sourceMappingURL=loadBaseTokenList.js.map