/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, utils } from "ethers";
const _abi = [
    {
        inputs: [
            {
                internalType: "address[9]",
                name: "_route",
                type: "address[9]",
            },
            {
                internalType: "uint256[3][4]",
                name: "_swap_params",
                type: "uint256[3][4]",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_expected",
                type: "uint256",
            },
            {
                internalType: "address[4]",
                name: "_pools",
                type: "address[4]",
            },
        ],
        name: "exchange_multiple",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
class CurveRouter__factory {
    static abi = _abi;
    static createInterface() {
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
export { CurveRouter__factory };
//# sourceMappingURL=CurveRouter__factory.js.map