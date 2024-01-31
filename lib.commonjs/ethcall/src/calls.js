"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const multicall_json_1 = tslib_1.__importDefault(require("./abi/multicall.json"));
const contract_1 = tslib_1.__importDefault(require("./contract"));
function getEthBalance(address, multicallAddress) {
    const multicall = new contract_1.default(multicallAddress, multicall_json_1.default);
    return multicall.getEthBalance(address);
}
exports.default = getEthBalance;
//# sourceMappingURL=calls.js.map