/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
        ],
        name: "ReserveZapId",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "id",
                type: "uint256",
            },
        ],
        name: "emitId",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x608060405234801561001057600080fd5b5061014e806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063c1c4eae714610030575b600080fd5b61004a600480360381019061004591906100c1565b61004c565b005b7fa1516f6784b75b19c0c5fcf1293f6a3a472188b8775eda8e33d9209b007ea22c8160405161007b91906100fd565b60405180910390a150565b600080fd5b6000819050919050565b61009e8161008b565b81146100a957600080fd5b50565b6000813590506100bb81610095565b92915050565b6000602082840312156100d7576100d6610086565b5b60006100e5848285016100ac565b91505092915050565b6100f78161008b565b82525050565b600060208201905061011260008301846100ee565b9291505056fea26469706673582212208745e45893b4e7cc79e243312bb105d726a62429ca8b187a97842b350c72897d64736f6c63430008110033";
const isSuperArgs = (xs) => xs.length > 1;
export class EmitId__factory extends ContractFactory {
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
        return new utils.Interface(_abi);
    }
    static connect(address, signerOrProvider) {
        return new Contract(address, _abi, signerOrProvider);
    }
}
//# sourceMappingURL=EmitId__factory.js.map