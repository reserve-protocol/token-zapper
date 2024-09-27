/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
const _abi = [
    {
        inputs: [
            {
                internalType: "bool",
                name: "isBadData",
                type: "bool",
            },
            {
                internalType: "uint104",
                name: "priceLow",
                type: "uint104",
            },
            {
                internalType: "uint104",
                name: "priceHigh",
                type: "uint104",
            },
            {
                internalType: "uint40",
                name: "timestamp",
                type: "uint40",
            },
        ],
        name: "addRoundData",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "getPrices",
        outputs: [
            {
                internalType: "bool",
                name: "isBadData",
                type: "bool",
            },
            {
                internalType: "uint256",
                name: "priceLow",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "priceHigh",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
export class IPriceSourceReceiver__factory {
    static abi = _abi;
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
//# sourceMappingURL=IPriceSourceReceiver__factory.js.map