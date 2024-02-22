/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
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
export class VM__factory {
    static abi = _abi;
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
//# sourceMappingURL=VM__factory.js.map