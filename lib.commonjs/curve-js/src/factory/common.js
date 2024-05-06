"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFactoryZapContracts = void 0;
const constants_1 = require("./constants");
const constants_crypto_1 = require("./constants-crypto");
async function setFactoryZapContracts(isCrypto) {
    const basePoolIdZapDict = (isCrypto ? constants_crypto_1.CRYPTO_FACTORY_CONSTANTS : constants_1.FACTORY_CONSTANTS)[this.chainId].basePoolIdZapDict;
    for (const basePoolId in basePoolIdZapDict) {
        if (!Object.prototype.hasOwnProperty.call(basePoolIdZapDict, basePoolId))
            continue;
        const basePool = basePoolIdZapDict[basePoolId];
        if (basePool.address in this.constants)
            continue;
        await this.setContract(basePool.address, basePool.ABI());
    }
}
exports.setFactoryZapContracts = setFactoryZapContracts;
//# sourceMappingURL=common.js.map