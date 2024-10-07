"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAerodromeSugar__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "limit",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "offset",
                type: "uint256",
            },
        ],
        name: "forSwaps",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "lp",
                        type: "address",
                    },
                    {
                        internalType: "int24",
                        name: "poolType",
                        type: "int24",
                    },
                    {
                        internalType: "address",
                        name: "token0",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "token1",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "factory",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "poolFee",
                        type: "uint256",
                    },
                ],
                internalType: "struct SwapLp[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
class IAerodromeSugar__factory {
    static abi = _abi;
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IAerodromeSugar__factory = IAerodromeSugar__factory;
//# sourceMappingURL=IAerodromeSugar__factory.js.map