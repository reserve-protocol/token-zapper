/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
const _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "deposit",
        outputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "underlying",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address",
            },
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class IStargateRewardableWrapper__factory {
    static abi = _abi;
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
export { IStargateRewardableWrapper__factory };
//# sourceMappingURL=IStargateRewardableWrapper__factory.js.map