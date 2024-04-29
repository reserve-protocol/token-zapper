/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
const _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "underlyingAsset",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "pool",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "treasury",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "incentivesController",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "aTokenDecimals",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "string",
                name: "aTokenName",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "aTokenSymbol",
                type: "string",
            },
            {
                indexed: false,
                internalType: "bytes",
                name: "params",
                type: "bytes",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "contract IPool",
                name: "pool",
                type: "address",
            },
            {
                internalType: "address",
                name: "treasury",
                type: "address",
            },
            {
                internalType: "address",
                name: "underlyingAsset",
                type: "address",
            },
            {
                internalType: "contract IAaveIncentivesController",
                name: "incentivesController",
                type: "address",
            },
            {
                internalType: "uint8",
                name: "aTokenDecimals",
                type: "uint8",
            },
            {
                internalType: "string",
                name: "aTokenName",
                type: "string",
            },
            {
                internalType: "string",
                name: "aTokenSymbol",
                type: "string",
            },
            {
                internalType: "bytes",
                name: "params",
                type: "bytes",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
export class IInitializableAToken__factory {
    static abi = _abi;
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
//# sourceMappingURL=IInitializableAToken__factory.js.map