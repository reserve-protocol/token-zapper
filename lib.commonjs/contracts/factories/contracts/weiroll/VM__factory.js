"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VM__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "command_index",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "target",
                type: "address",
            },
            {
                internalType: "string",
                name: "message",
                type: "string",
            },
        ],
        name: "ExecutionFailed",
        type: "error",
    },
];
class VM__factory {
    static abi = _abi;
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.VM__factory = VM__factory;
//# sourceMappingURL=VM__factory.js.map