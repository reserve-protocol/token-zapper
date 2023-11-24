"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multicall_json_1 = __importDefault(require("./abi/multicall.json"));
const contract_1 = __importDefault(require("./contract"));
function getEthBalance(address, multicallAddress) {
    const multicall = new contract_1.default(multicallAddress, multicall_json_1.default);
    return multicall.getEthBalance(address);
}
exports.default = getEthBalance;
//# sourceMappingURL=calls.js.map