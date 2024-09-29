/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { utils, Contract, ContractFactory } from "ethers";
const _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_expected",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "router",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "path",
                type: "bytes",
            },
        ],
        name: "exactInput",
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
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_expected",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "router",
                type: "address",
            },
            {
                internalType: "bytes",
                name: "encodedRouterCall",
                type: "bytes",
            },
        ],
        name: "exactInputSingle",
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
const _bytecode = "0x608060405234801561001057600080fd5b50610968806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80636919e6741461003b578063bdd613d31461006b575b600080fd5b61005560048036038101906100509190610330565b61009b565b60405161006291906103c7565b60405180910390f35b61008560048036038101906100809190610523565b61014b565b60405161009291906103c7565b60405180910390f35b60008083838101906100ad91906106da565b905086816080018181525050858160a00181815250508473ffffffffffffffffffffffffffffffffffffffff166304e45aaf826040518263ffffffff1660e01b81526004016100fc91906107d1565b6020604051808303816000875af115801561011b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013f9190610801565b91505095945050505050565b60008060405180608001604052808481526020018573ffffffffffffffffffffffffffffffffffffffff16815260200188815260200187815250905086816040018181525050858160600181815250508473ffffffffffffffffffffffffffffffffffffffff1663b858183f826040518263ffffffff1660e01b81526004016101d49190610910565b6020604051808303816000875af11580156101f3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102179190610801565b91505095945050505050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61024a81610237565b811461025557600080fd5b50565b60008135905061026781610241565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102988261026d565b9050919050565b6102a88161028d565b81146102b357600080fd5b50565b6000813590506102c58161029f565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126102f0576102ef6102cb565b5b8235905067ffffffffffffffff81111561030d5761030c6102d0565b5b602083019150836001820283011115610329576103286102d5565b5b9250929050565b60008060008060006080868803121561034c5761034b61022d565b5b600061035a88828901610258565b955050602061036b88828901610258565b945050604061037c888289016102b6565b935050606086013567ffffffffffffffff81111561039d5761039c610232565b5b6103a9888289016102da565b92509250509295509295909350565b6103c181610237565b82525050565b60006020820190506103dc60008301846103b8565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610430826103e7565b810181811067ffffffffffffffff8211171561044f5761044e6103f8565b5b80604052505050565b6000610462610223565b905061046e8282610427565b919050565b600067ffffffffffffffff82111561048e5761048d6103f8565b5b610497826103e7565b9050602081019050919050565b82818337600083830152505050565b60006104c66104c184610473565b610458565b9050828152602081018484840111156104e2576104e16103e2565b5b6104ed8482856104a4565b509392505050565b600082601f83011261050a576105096102cb565b5b813561051a8482602086016104b3565b91505092915050565b600080600080600060a0868803121561053f5761053e61022d565b5b600061054d88828901610258565b955050602061055e88828901610258565b945050604061056f888289016102b6565b9350506060610580888289016102b6565b925050608086013567ffffffffffffffff8111156105a1576105a0610232565b5b6105ad888289016104f5565b9150509295509295909350565b600080fd5b600062ffffff82169050919050565b6105d7816105bf565b81146105e257600080fd5b50565b6000813590506105f4816105ce565b92915050565b6106038161026d565b811461060e57600080fd5b50565b600081359050610620816105fa565b92915050565b600060e0828403121561063c5761063b6105ba565b5b61064660e0610458565b90506000610656848285016102b6565b600083015250602061066a848285016102b6565b602083015250604061067e848285016105e5565b6040830152506060610692848285016102b6565b60608301525060806106a684828501610258565b60808301525060a06106ba84828501610258565b60a08301525060c06106ce84828501610611565b60c08301525092915050565b600060e082840312156106f0576106ef61022d565b5b60006106fe84828501610626565b91505092915050565b6107108161028d565b82525050565b61071f816105bf565b82525050565b61072e81610237565b82525050565b61073d8161026d565b82525050565b60e0820160008201516107596000850182610707565b50602082015161076c6020850182610707565b50604082015161077f6040850182610716565b5060608201516107926060850182610707565b5060808201516107a56080850182610725565b5060a08201516107b860a0850182610725565b5060c08201516107cb60c0850182610734565b50505050565b600060e0820190506107e66000830184610743565b92915050565b6000815190506107fb81610241565b92915050565b6000602082840312156108175761081661022d565b5b6000610825848285016107ec565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561086857808201518184015260208101905061084d565b60008484015250505050565b600061087f8261082e565b6108898185610839565b935061089981856020860161084a565b6108a2816103e7565b840191505092915050565b600060808301600083015184820360008601526108ca8282610874565b91505060208301516108df6020860182610707565b5060408301516108f26040860182610725565b5060608301516109056060860182610725565b508091505092915050565b6000602082019050818103600083015261092a81846108ad565b90509291505056fea2646970667358221220411f504c45e00842357095874c89171a56448b3106135bb8e9d23af88464870b64736f6c63430008110033";
const isSuperArgs = (xs) => xs.length > 1;
export class UniV3RouterCall__factory extends ContractFactory {
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
//# sourceMappingURL=UniV3RouterCall__factory.js.map