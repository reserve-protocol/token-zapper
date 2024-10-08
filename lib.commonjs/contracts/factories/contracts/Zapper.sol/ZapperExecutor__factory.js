"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZapperExecutor__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
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
    {
        inputs: [
            {
                internalType: "uint256",
                name: "a",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "b",
                type: "uint256",
            },
        ],
        name: "add",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "a",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "b",
                type: "uint256",
            },
        ],
        name: "assertEqual",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "a",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "b",
                type: "uint256",
            },
        ],
        name: "assertLarger",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32[]",
                name: "commands",
                type: "bytes32[]",
            },
            {
                internalType: "bytes[]",
                name: "state",
                type: "bytes[]",
            },
            {
                internalType: "contract IERC20[]",
                name: "tokens",
                type: "address[]",
            },
        ],
        name: "execute",
        outputs: [
            {
                components: [
                    {
                        internalType: "uint256[]",
                        name: "dust",
                        type: "uint256[]",
                    },
                ],
                internalType: "struct ExecuteOutput",
                name: "out",
                type: "tuple",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "a",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "b",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "scale",
                type: "uint256",
            },
        ],
        name: "fpMul",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "contract FacadeRead",
                name: "facade",
                type: "address",
            },
            {
                internalType: "contract RToken",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "mintMaxRToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes",
            },
        ],
        name: "rawCall",
        outputs: [
            {
                internalType: "bool",
                name: "success",
                type: "bool",
            },
            {
                internalType: "bytes",
                name: "out",
                type: "bytes",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "a",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "b",
                type: "uint256",
            },
        ],
        name: "sub",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        stateMutability: "payable",
        type: "receive",
    },
];
const _bytecode = "0x60a060405234801561001057600080fd5b503073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff168152505060805161264461005d600039600050506126446000f3fe60806040526004361061007f5760003560e01c806398a38d7d1161004e57806398a38d7d1461015e578063ad207fd71461019c578063b67d77c5146101d9578063d47b0de41461021657610086565b806308c4b4981461008b578063298e2c9e146100bb578063771602f7146100f857806394919ce81461013557610086565b3661008657005b600080fd5b6100a560048036038101906100a091906114e1565b610253565b6040516100b2919061167f565b60405180910390f35b3480156100c757600080fd5b506100e260048036038101906100dd91906116cd565b6103e8565b6040516100ef9190611728565b60405180910390f35b34801561010457600080fd5b5061011f600480360381019061011a91906116cd565b610436565b60405161012c9190611752565b60405180910390f35b34801561014157600080fd5b5061015c60048036038101906101579190611815565b61044c565b005b34801561016a57600080fd5b50610185600480360381019061018091906118be565b610541565b6040516101939291906119b1565b60405180910390f35b3480156101a857600080fd5b506101c360048036038101906101be91906116cd565b61062f565b6040516101d09190611728565b60405180910390f35b3480156101e557600080fd5b5061020060048036038101906101fb91906116cd565b61067d565b60405161020d9190611752565b60405180910390f35b34801561022257600080fd5b5061023d600480360381019061023891906119e1565b610693565b60405161024a9190611752565b60405180910390f35b61025b611100565b6000303f905061026c8686866106b5565b50825167ffffffffffffffff8111156102885761028761119d565b5b6040519080825280602002602001820160405280156102b65781602001602082028036833780820191505090505b50826000018190525060005b8351811015610395578381815181106102de576102dd611a34565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161031e9190611a72565b602060405180830381865afa15801561033b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061035f9190611aa2565b8360000151828151811061037657610375611a34565b5b602002602001018181525050808061038d90611afe565b9150506102c2565b506000303f90508181146103de576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103d590611bc9565b60405180910390fd5b5050949350505050565b600081831161042c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161042390611c35565b60405180910390fd5b6001905092915050565b600081836104449190611c55565b905092915050565b60008373ffffffffffffffffffffffffffffffffffffffff16631c3debf484306040518363ffffffff1660e01b8152600401610489929190611ce8565b6020604051808303816000875af11580156104a8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104cc9190611aa2565b90508273ffffffffffffffffffffffffffffffffffffffff16631207f0c183836040518363ffffffff1660e01b8152600401610509929190611d11565b600060405180830381600087803b15801561052357600080fd5b505af1158015610537573d6000803e3d6000fd5b5050505050505050565b600060603073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146105b3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105aa90611dac565b60405180910390fd5b8573ffffffffffffffffffffffffffffffffffffffff168585856040516105db929190611dfc565b60006040518083038185875af1925050503d8060008114610618576040519150601f19603f3d011682016040523d82523d6000602084013e61061d565b606091505b50809250819350505094509492505050565b6000818314610673576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066a90611e61565b60405180910390fd5b6001905092915050565b6000818361068b9190611e81565b905092915050565b60008183856106a29190611eb5565b6106ac9190611f26565b90509392505050565b60606000806000806060600089899050905060005b81811015610b1d578a8a828181106106e5576106e4611a34565b5b905060200201359650602087901b60f81c60ff16955060006080871614610733578a8a828061071390611afe565b935081811061072557610724611a34565b5b90506020020135945061075d565b79ffffffffffffffffffffffffffffffffffffffffffffffffffff602888901b60001c1760001b94505b600060038716036107f2578660001c73ffffffffffffffffffffffffffffffffffffffff1661079788878c610b2e9092919063ffffffff16565b6040516107a49190611f88565b600060405180830381855af49150503d80600081146107df576040519150601f19603f3d011682016040523d82523d6000602084013e6107e4565b606091505b508094508195505050610a73565b60016003871603610889578660001c73ffffffffffffffffffffffffffffffffffffffff1661082c88878c610b2e9092919063ffffffff16565b6040516108399190611f88565b6000604051808303816000865af19150503d8060008114610876576040519150601f19603f3d011682016040523d82523d6000602084013e61087b565b606091505b508094508195505050610a72565b6002600387160361091e578660001c73ffffffffffffffffffffffffffffffffffffffff166108c388878c610b2e9092919063ffffffff16565b6040516108d09190611f88565b600060405180830381855afa9150503d806000811461090b576040519150601f19603f3d011682016040523d82523d6000602084013e610910565b606091505b508094508195505050610a71565b600380871603610a35576000808a8760f81c60ff168151811061094457610943611a34565b5b602002602001015190506020815114610992576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161098990612011565b60405180910390fd5b602081015191508860001c73ffffffffffffffffffffffffffffffffffffffff16826109d68b60ff60088c901b60001c1760001b8f610b2e9092919063ffffffff16565b6040516109e39190611f88565b60006040518083038185875af1925050503d8060008114610a20576040519150601f19603f3d011682016040523d82523d6000602084013e610a25565b606091505b5080965081975050505050610a70565b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a679061207d565b60405180910390fd5b5b5b5b83610acd57600083511115610a89576044830192505b808760001c846040517fef3dcb2f000000000000000000000000000000000000000000000000000000008152600401610ac4939291906120e1565b60405180910390fd5b60006040871614610af657610af1605888901b848b610e929092919063ffffffff16565b610b12565b610b0f605888901b848b610f479092919063ffffffff16565b98505b8060010190506106ca565b508796505050505050509392505050565b606060008060606000805b6020811015610cd257868160208110610b5557610b54611a34565b5b1a60f81b60f81c60ff16915060ff820315610cd25760006080831614610c505760fe8203610bbd576000835103610ba95788604051602001610b97919061222b565b60405160208183030381529060405292505b825185610bb69190611c55565b9450610c4b565b600089607f841681518110610bd557610bd4611a34565b5b60200260200101515190506000602082610bef919061224d565b14610c2f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c26906122f0565b60405180910390fd5b602081610c3c9190611c55565b86610c479190611c55565b9550505b610cc1565b602089607f841681518110610c6857610c67611a34565b5b60200260200101515114610cb1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ca890612382565b60405180910390fd5b602085610cbe9190611c55565b94505b602084019350806001019050610b39565b50600484610ce09190611c55565b67ffffffffffffffff811115610cf957610cf861119d565b5b6040519080825280601f01601f191660200182016040528015610d2b5781602001600182028036833780820191505090505b5094508660208601526000935060005b6020811015610e8657868160208110610d5757610d56611a34565b5b1a60f81b60f81c60ff16915060ff820315610e865760006080831614610e455760fe8203610dce578385602488010152610dae83602088600488610d9b9190611c55565b60208851610da99190611e81565b6110e6565b60208351610dbc9190611e81565b84610dc79190611c55565b9350610e40565b600089607f841681518110610de657610de5611a34565b5b60200260200101515190508486602489010152610e308a607f851681518110610e1257610e11611a34565b5b6020026020010151600089600489610e2a9190611c55565b856110e6565b8085610e3c9190611c55565b9450505b610e75565b600089607f841681518110610e5d57610e5c611a34565b5b60200260200101519050602081015186602489010152505b602085019450806001019050610d3b565b50505050509392505050565b60008260f81c60ff16905060ff8103610eab5750610f42565b600060208351610ebb9190611c55565b67ffffffffffffffff811115610ed457610ed361119d565b5b6040519080825280601f01601f191660200182016040528015610f065781602001600182028036833780820191505090505b50858381518110610f1a57610f19611a34565b5b602002602001018190529050610f3683600083602087516110e6565b82518060208301525050505b505050565b606060008360f81c60ff16905060ff8103610f6557849150506110df565b600060808216146110015760fe8103610f935782806020019051810190610f8c91906124c7565b9450610ffc565b60006020840151905060208114610fdf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fd690612582565b60405180910390fd5b60208451036020850152602084016020607f841602602088010152505b6110da565b602083511015611046576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161103d906125ee565b60405180910390fd5b6020835111156110b7576000602067ffffffffffffffff81111561106d5761106c61119d565b5b6040519080825280601f01601f19166020018201604052801561109f5781602001600182028036833780820191505090505b5090506110b284600083600088516110e6565b809350505b8285607f8316815181106110ce576110cd611a34565b5b60200260200101819052505b849150505b9392505050565b808260208501018286602089010160045afa505050505050565b6040518060200160405280606081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f84011261114c5761114b611127565b5b8235905067ffffffffffffffff8111156111695761116861112c565b5b60208301915083602082028301111561118557611184611131565b5b9250929050565b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6111d58261118c565b810181811067ffffffffffffffff821117156111f4576111f361119d565b5b80604052505050565b6000611207611113565b905061121382826111cc565b919050565b600067ffffffffffffffff8211156112335761123261119d565b5b602082029050602081019050919050565b600080fd5b600067ffffffffffffffff8211156112645761126361119d565b5b61126d8261118c565b9050602081019050919050565b82818337600083830152505050565b600061129c61129784611249565b6111fd565b9050828152602081018484840111156112b8576112b7611244565b5b6112c384828561127a565b509392505050565b600082601f8301126112e0576112df611127565b5b81356112f0848260208601611289565b91505092915050565b600061130c61130784611218565b6111fd565b9050808382526020820190506020840283018581111561132f5761132e611131565b5b835b8181101561137657803567ffffffffffffffff81111561135457611353611127565b5b80860161136189826112cb565b85526020850194505050602081019050611331565b5050509392505050565b600082601f83011261139557611394611127565b5b81356113a58482602086016112f9565b91505092915050565b600067ffffffffffffffff8211156113c9576113c861119d565b5b602082029050602081019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611405826113da565b9050919050565b6000611417826113fa565b9050919050565b6114278161140c565b811461143257600080fd5b50565b6000813590506114448161141e565b92915050565b600061145d611458846113ae565b6111fd565b905080838252602082019050602084028301858111156114805761147f611131565b5b835b818110156114a957806114958882611435565b845260208401935050602081019050611482565b5050509392505050565b600082601f8301126114c8576114c7611127565b5b81356114d884826020860161144a565b91505092915050565b600080600080606085870312156114fb576114fa61111d565b5b600085013567ffffffffffffffff81111561151957611518611122565b5b61152587828801611136565b9450945050602085013567ffffffffffffffff81111561154857611547611122565b5b61155487828801611380565b925050604085013567ffffffffffffffff81111561157557611574611122565b5b611581878288016114b3565b91505092959194509250565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b6115cc816115b9565b82525050565b60006115de83836115c3565b60208301905092915050565b6000602082019050919050565b60006116028261158d565b61160c8185611598565b9350611617836115a9565b8060005b8381101561164857815161162f88826115d2565b975061163a836115ea565b92505060018101905061161b565b5085935050505092915050565b6000602083016000830151848203600086015261167282826115f7565b9150508091505092915050565b600060208201905081810360008301526116998184611655565b905092915050565b6116aa816115b9565b81146116b557600080fd5b50565b6000813590506116c7816116a1565b92915050565b600080604083850312156116e4576116e361111d565b5b60006116f2858286016116b8565b9250506020611703858286016116b8565b9150509250929050565b60008115159050919050565b6117228161170d565b82525050565b600060208201905061173d6000830184611719565b92915050565b61174c816115b9565b82525050565b60006020820190506117676000830184611743565b92915050565b6000611778826113fa565b9050919050565b6117888161176d565b811461179357600080fd5b50565b6000813590506117a58161177f565b92915050565b60006117b6826113fa565b9050919050565b6117c6816117ab565b81146117d157600080fd5b50565b6000813590506117e3816117bd565b92915050565b6117f2816113fa565b81146117fd57600080fd5b50565b60008135905061180f816117e9565b92915050565b60008060006060848603121561182e5761182d61111d565b5b600061183c86828701611796565b935050602061184d868287016117d4565b925050604061185e86828701611800565b9150509250925092565b60008083601f84011261187e5761187d611127565b5b8235905067ffffffffffffffff81111561189b5761189a61112c565b5b6020830191508360018202830111156118b7576118b6611131565b5b9250929050565b600080600080606085870312156118d8576118d761111d565b5b60006118e687828801611800565b94505060206118f7878288016116b8565b935050604085013567ffffffffffffffff81111561191857611917611122565b5b61192487828801611868565b925092505092959194509250565b600081519050919050565b600082825260208201905092915050565b60005b8381101561196c578082015181840152602081019050611951565b60008484015250505050565b600061198382611932565b61198d818561193d565b935061199d81856020860161194e565b6119a68161118c565b840191505092915050565b60006040820190506119c66000830185611719565b81810360208301526119d88184611978565b90509392505050565b6000806000606084860312156119fa576119f961111d565b5b6000611a08868287016116b8565b9350506020611a19868287016116b8565b9250506040611a2a868287016116b8565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b611a6c816113fa565b82525050565b6000602082019050611a876000830184611a63565b92915050565b600081519050611a9c816116a1565b92915050565b600060208284031215611ab857611ab761111d565b5b6000611ac684828501611a8d565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611b09826115b9565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611b3b57611b3a611acf565b5b600182019050919050565b600082825260208201905092915050565b7f50726576656e7454616d706572696e673a20436f646520686173206368616e6760008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b6000611bb3602283611b46565b9150611bbe82611b57565b604082019050919050565b60006020820190508181036000830152611be281611ba6565b9050919050565b7f214153534552545f475400000000000000000000000000000000000000000000600082015250565b6000611c1f600a83611b46565b9150611c2a82611be9565b602082019050919050565b60006020820190508181036000830152611c4e81611c12565b9050919050565b6000611c60826115b9565b9150611c6b836115b9565b9250828201905080821115611c8357611c82611acf565b5b92915050565b6000819050919050565b6000611cae611ca9611ca4846113da565b611c89565b6113da565b9050919050565b6000611cc082611c93565b9050919050565b6000611cd282611cb5565b9050919050565b611ce281611cc7565b82525050565b6000604082019050611cfd6000830185611cd9565b611d0a6020830184611a63565b9392505050565b6000604082019050611d266000830185611a63565b611d336020830184611743565b9392505050565b7f5a61707065724578656375746f723a204f6e6c792063616c6c61626c6520627960008201527f205a617070657200000000000000000000000000000000000000000000000000602082015250565b6000611d96602783611b46565b9150611da182611d3a565b604082019050919050565b60006020820190508181036000830152611dc581611d89565b9050919050565b600081905092915050565b6000611de38385611dcc565b9350611df083858461127a565b82840190509392505050565b6000611e09828486611dd7565b91508190509392505050565b7f214153534552545f455100000000000000000000000000000000000000000000600082015250565b6000611e4b600a83611b46565b9150611e5682611e15565b602082019050919050565b60006020820190508181036000830152611e7a81611e3e565b9050919050565b6000611e8c826115b9565b9150611e97836115b9565b9250828203905081811115611eaf57611eae611acf565b5b92915050565b6000611ec0826115b9565b9150611ecb836115b9565b9250828202611ed9816115b9565b91508282048414831517611ef057611eef611acf565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000611f31826115b9565b9150611f3c836115b9565b925082611f4c57611f4b611ef7565b5b828204905092915050565b6000611f6282611932565b611f6c8185611dcc565b9350611f7c81856020860161194e565b80840191505092915050565b6000611f948284611f57565b915081905092915050565b7f5f657865637574653a2076616c75652063616c6c20686173206e6f2076616c7560008201527f6520696e646963617465642e0000000000000000000000000000000000000000602082015250565b6000611ffb602c83611b46565b915061200682611f9f565b604082019050919050565b6000602082019050818103600083015261202a81611fee565b9050919050565b7f496e76616c69642063616c6c7479706500000000000000000000000000000000600082015250565b6000612067601083611b46565b915061207282612031565b602082019050919050565b600060208201905081810360008301526120968161205a565b9050919050565b600081519050919050565b60006120b38261209d565b6120bd8185611b46565b93506120cd81856020860161194e565b6120d68161118c565b840191505092915050565b60006060820190506120f66000830186611743565b6121036020830185611a63565b818103604083015261211581846120a8565b9050949350505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600082825260208201905092915050565b600061216782611932565b612171818561214b565b935061218181856020860161194e565b61218a8161118c565b840191505092915050565b60006121a1838361215c565b905092915050565b6000602082019050919050565b60006121c18261211f565b6121cb818561212a565b9350836020820285016121dd8561213b565b8060005b8581101561221957848403895281516121fa8582612195565b9450612205836121a9565b925060208a019950506001810190506121e1565b50829750879550505050505092915050565b6000602082019050818103600083015261224581846121b6565b905092915050565b6000612258826115b9565b9150612263836115b9565b92508261227357612272611ef7565b5b828206905092915050565b7f44796e616d6963207374617465207661726961626c6573206d7573742062652060008201527f61206d756c7469706c65206f6620333220627974657300000000000000000000602082015250565b60006122da603683611b46565b91506122e58261227e565b604082019050919050565b60006020820190508181036000830152612309816122cd565b9050919050565b7f537461746963207374617465207661726961626c6573206d757374206265203360008201527f3220627974657300000000000000000000000000000000000000000000000000602082015250565b600061236c602783611b46565b915061237782612310565b604082019050919050565b6000602082019050818103600083015261239b8161235f565b9050919050565b60006123b56123b084611249565b6111fd565b9050828152602081018484840111156123d1576123d0611244565b5b6123dc84828561194e565b509392505050565b600082601f8301126123f9576123f8611127565b5b81516124098482602086016123a2565b91505092915050565b600061242561242084611218565b6111fd565b9050808382526020820190506020840283018581111561244857612447611131565b5b835b8181101561248f57805167ffffffffffffffff81111561246d5761246c611127565b5b80860161247a89826123e4565b8552602085019450505060208101905061244a565b5050509392505050565b600082601f8301126124ae576124ad611127565b5b81516124be848260208601612412565b91505092915050565b6000602082840312156124dd576124dc61111d565b5b600082015167ffffffffffffffff8111156124fb576124fa611122565b5b61250784828501612499565b91505092915050565b7f4f6e6c79206f6e652072657475726e2076616c7565207065726d69747465642060008201527f287661726961626c652900000000000000000000000000000000000000000000602082015250565b600061256c602a83611b46565b915061257782612510565b604082019050919050565b6000602082019050818103600083015261259b8161255f565b9050919050565b7f52657475726e206174206c656173742033322062797465730000000000000000600082015250565b60006125d8601883611b46565b91506125e3826125a2565b602082019050919050565b60006020820190508181036000830152612607816125cb565b905091905056fea26469706673582212201063e0c429bb4d9c40b26e5bc423dc07deffe8ccf85b6f7138045abc9bae0ef164736f6c63430008110033";
const isSuperArgs = (xs) => xs.length > 1;
class ZapperExecutor__factory extends ethers_1.ContractFactory {
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
exports.ZapperExecutor__factory = ZapperExecutor__factory;
//# sourceMappingURL=ZapperExecutor__factory.js.map