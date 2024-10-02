"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfDestruct__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const ethers_1 = require("ethers");
const _abi = [
    {
        inputs: [],
        name: "destroy",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "doNothing",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x6080604052348015600f57600080fd5b5060988061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632f576f2014603757806383197ef014603f575b600080fd5b603d6047565b005b60456049565b005b565b3373ffffffffffffffffffffffffffffffffffffffff16fffea26469706673582212209b075ede699455cb8eb66d145a368241c514fbfb2bf91bc428d9258b83d1de2a64736f6c63430008110033";
const isSuperArgs = (xs) => xs.length > 1;
class SelfDestruct__factory extends ethers_1.ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    attach(address) {
        return super.attach(address);
    }
    connect(signer) {
        return super.connect(signer);
    }
    static bytecode = _bytecode;
    static abi = _abi;
    static createInterface() {
        return new ethers_1.utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    }
}
exports.SelfDestruct__factory = SelfDestruct__factory;
//# sourceMappingURL=SelfDestruct__factory.js.map