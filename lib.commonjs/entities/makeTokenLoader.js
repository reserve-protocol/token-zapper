"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTokenLoader = void 0;
const ERC20__factory_1 = require("../contracts/factories/@openzeppelin/contracts/token/ERC20/ERC20__factory");
const utils_1 = require("../base/utils");
const hash_1 = require("@ethersproject/hash");
const abi_1 = require("@ethersproject/abi");
const makeTokenLoader = (provider) => async (address) => {
    const erc20 = ERC20__factory_1.ERC20__factory.connect(address.address, provider);
    let [symbol, decimals] = await Promise.all([
        provider.call({
            to: address.address,
            data: (0, hash_1.id)('symbol()').slice(0, 10),
        }),
        erc20.decimals().catch(() => 0),
    ]);
    if (symbol.length === 66) {
        let buffer = (0, utils_1.parseHexStringIntoBuffer)(symbol);
        let last = buffer.indexOf(0);
        if (last == -1) {
            last = buffer.length;
        }
        buffer = buffer.subarray(0, last);
        symbol = buffer.toString('utf8');
    }
    else {
        symbol = abi_1.defaultAbiCoder.decode(['string'], symbol)[0];
    }
    return {
        symbol,
        decimals,
    };
};
exports.makeTokenLoader = makeTokenLoader;
//# sourceMappingURL=makeTokenLoader.js.map