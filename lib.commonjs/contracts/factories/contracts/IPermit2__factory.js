"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPermit2__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                internalType: "uint160",
                name: "",
                type: "uint160",
            },
            {
                internalType: "uint48",
                name: "",
                type: "uint48",
            },
            {
                internalType: "uint48",
                name: "",
                type: "uint48",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "address",
                                name: "token",
                                type: "address",
                            },
                            {
                                internalType: "uint256",
                                name: "amount",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct TokenPermissions",
                        name: "permitted",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256",
                    },
                ],
                internalType: "struct PermitTransferFrom",
                name: "permit",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "to",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "requestedAmount",
                        type: "uint256",
                    },
                ],
                internalType: "struct SignatureTransferDetails",
                name: "transferDetails",
                type: "tuple",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "signature",
                type: "bytes",
            },
        ],
        name: "permitTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class IPermit2__factory {
    static abi = _abi;
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.IPermit2__factory = IPermit2__factory;
//# sourceMappingURL=IPermit2__factory.js.map