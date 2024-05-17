import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { ZapperExecutor, ZapperExecutorInterface } from "../../../contracts/Zapper.sol/ZapperExecutor";
type ZapperExecutorConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ZapperExecutor__factory extends ContractFactory {
    constructor(...args: ZapperExecutorConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ZapperExecutor>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): ZapperExecutor;
    connect(signer: Signer): ZapperExecutor__factory;
    static readonly bytecode = "0x60a060405234801561001057600080fd5b503073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff168152505060805161244461005d600039600050506124446000f3fe60806040526004361061007f5760003560e01c806398a38d7d1161004e57806398a38d7d1461014a578063ad207fd714610188578063b67d77c5146101b1578063d47b0de4146101ee57610086565b806308c4b4981461008b578063298e2c9e146100bb578063771602f7146100e457806394919ce81461012157610086565b3661008657005b600080fd5b6100a560048036038101906100a091906113bf565b61022b565b6040516100b2919061155d565b60405180910390f35b3480156100c757600080fd5b506100e260048036038101906100dd91906115ab565b610370565b005b3480156100f057600080fd5b5061010b600480360381019061010691906115ab565b6103b6565b60405161011891906115fa565b60405180910390f35b34801561012d57600080fd5b50610148600480360381019061014391906116bd565b6103cc565b005b34801561015657600080fd5b50610171600480360381019061016c9190611766565b6104c1565b60405161017f929190611874565b60405180910390f35b34801561019457600080fd5b506101af60048036038101906101aa91906115ab565b610541565b005b3480156101bd57600080fd5b506101d860048036038101906101d391906115ab565b610587565b6040516101e591906115fa565b60405180910390f35b3480156101fa57600080fd5b50610215600480360381019061021091906118a4565b61059d565b60405161022291906115fa565b60405180910390f35b610233610fde565b61023e8585856105bf565b50815167ffffffffffffffff81111561025a5761025961107b565b5b6040519080825280602002602001820160405280156102885781602001602082028036833780820191505090505b50816000018190525060005b8251811015610367578281815181106102b0576102af6118f7565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016102f09190611935565b602060405180830381865afa15801561030d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103319190611965565b82600001518281518110610348576103476118f7565b5b602002602001018181525050808061035f906119c1565b915050610294565b50949350505050565b8082116103b2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103a990611a66565b60405180910390fd5b5050565b600081836103c49190611a86565b905092915050565b60008373ffffffffffffffffffffffffffffffffffffffff16631c3debf484306040518363ffffffff1660e01b8152600401610409929190611b19565b6020604051808303816000875af1158015610428573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061044c9190611965565b90508273ffffffffffffffffffffffffffffffffffffffff16631207f0c183836040518363ffffffff1660e01b8152600401610489929190611b42565b600060405180830381600087803b1580156104a357600080fd5b505af11580156104b7573d6000803e3d6000fd5b5050505050505050565b600060608573ffffffffffffffffffffffffffffffffffffffff168585856040516104ed929190611b9b565b60006040518083038185875af1925050503d806000811461052a576040519150601f19603f3d011682016040523d82523d6000602084013e61052f565b606091505b50809250819350505094509492505050565b808214610583576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161057a90611c00565b60405180910390fd5b5050565b600081836105959190611c20565b905092915050565b60008183856105ac9190611c54565b6105b69190611cc5565b90509392505050565b60606000806000806060600089899050905060005b81811015610a6d578a8a828181106105ef576105ee6118f7565b5b905060200201359650602087901b60f81c60ff1695506000608087161461063d578a8a828061061d906119c1565b935081811061062f5761062e6118f7565b5b905060200201359450610667565b79ffffffffffffffffffffffffffffffffffffffffffffffffffff602888901b60001c1760001b94505b600060038716036106fc578660001c73ffffffffffffffffffffffffffffffffffffffff166106a188878c610a7e9092919063ffffffff16565b6040516106ae9190611d27565b600060405180830381855af49150503d80600081146106e9576040519150601f19603f3d011682016040523d82523d6000602084013e6106ee565b606091505b50809450819550505061097d565b60016003871603610793578660001c73ffffffffffffffffffffffffffffffffffffffff1661073688878c610a7e9092919063ffffffff16565b6040516107439190611d27565b6000604051808303816000865af19150503d8060008114610780576040519150601f19603f3d011682016040523d82523d6000602084013e610785565b606091505b50809450819550505061097c565b60026003871603610828578660001c73ffffffffffffffffffffffffffffffffffffffff166107cd88878c610a7e9092919063ffffffff16565b6040516107da9190611d27565b600060405180830381855afa9150503d8060008114610815576040519150601f19603f3d011682016040523d82523d6000602084013e61081a565b606091505b50809450819550505061097b565b60038087160361093f576000808a8760f81c60ff168151811061084e5761084d6118f7565b5b60200260200101519050602081511461089c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161089390611db0565b60405180910390fd5b602081015191508860001c73ffffffffffffffffffffffffffffffffffffffff16826108e08b60ff60088c901b60001c1760001b8f610a7e9092919063ffffffff16565b6040516108ed9190611d27565b60006040518083038185875af1925050503d806000811461092a576040519150601f19603f3d011682016040523d82523d6000602084013e61092f565b606091505b508096508197505050505061097a565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161097190611e1c565b60405180910390fd5b5b5b5b83610a1d57600083511115610993576044830192505b60008760001c60008551116109dd576040518060400160405280600781526020017f556e6b6e6f776e000000000000000000000000000000000000000000000000008152506109df565b845b6040517fef3dcb2f000000000000000000000000000000000000000000000000000000008152600401610a1493929190611ebb565b60405180910390fd5b60006040871614610a4657610a41605888901b848b610de29092919063ffffffff16565b610a62565b610a5f605888901b848b610e979092919063ffffffff16565b98505b8060010190506105d4565b508796505050505050509392505050565b606060008060606000805b6020811015610c2257868160208110610aa557610aa46118f7565b5b1a60f81b60f81c60ff16915060ff820315610c225760006080831614610ba05760fe8203610b0d576000835103610af95788604051602001610ae79190612005565b60405160208183030381529060405292505b825185610b069190611a86565b9450610b9b565b600089607f841681518110610b2557610b246118f7565b5b60200260200101515190506000602082610b3f9190612027565b14610b7f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b76906120ca565b60405180910390fd5b602081610b8c9190611a86565b86610b979190611a86565b9550505b610c11565b602089607f841681518110610bb857610bb76118f7565b5b60200260200101515114610c01576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bf89061215c565b60405180910390fd5b602085610c0e9190611a86565b94505b602084019350806001019050610a89565b50600484610c309190611a86565b67ffffffffffffffff811115610c4957610c4861107b565b5b6040519080825280601f01601f191660200182016040528015610c7b5781602001600182028036833780820191505090505b5094508660208601526000935060005b6020811015610dd657868160208110610ca757610ca66118f7565b5b1a60f81b60f81c60ff16915060ff820315610dd65760006080831614610d955760fe8203610d1e578385602488010152610cfe83602088600488610ceb9190611a86565b60208851610cf99190611c20565b610fc4565b60208351610d0c9190611c20565b84610d179190611a86565b9350610d90565b600089607f841681518110610d3657610d356118f7565b5b60200260200101515190508486602489010152610d808a607f851681518110610d6257610d616118f7565b5b6020026020010151600089600489610d7a9190611a86565b85610fc4565b8085610d8c9190611a86565b9450505b610dc5565b600089607f841681518110610dad57610dac6118f7565b5b60200260200101519050602081015186602489010152505b602085019450806001019050610c8b565b50505050509392505050565b60008260f81c60ff16905060ff8103610dfb5750610e92565b600060208351610e0b9190611a86565b67ffffffffffffffff811115610e2457610e2361107b565b5b6040519080825280601f01601f191660200182016040528015610e565781602001600182028036833780820191505090505b50858381518110610e6a57610e696118f7565b5b602002602001018190529050610e868360008360208751610fc4565b82518060208301525050505b505050565b606060008360f81c60ff16905060ff8103610eb55784915050610fbd565b60006080821614610f515760fe8103610ee35782806020019051810190610edc91906122a1565b9450610f4c565b60006020840151905060208114610f2f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f269061235c565b60405180910390fd5b60208451036020850152602084016020607f841602602088010152505b610fb8565b6020835114610f95576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f8c906123ee565b60405180910390fd5b8285607f831681518110610fac57610fab6118f7565b5b60200260200101819052505b849150505b9392505050565b808260208501018286602089010160045afa505050505050565b6040518060200160405280606081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f84011261102a57611029611005565b5b8235905067ffffffffffffffff8111156110475761104661100a565b5b6020830191508360208202830111156110635761106261100f565b5b9250929050565b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6110b38261106a565b810181811067ffffffffffffffff821117156110d2576110d161107b565b5b80604052505050565b60006110e5610ff1565b90506110f182826110aa565b919050565b600067ffffffffffffffff8211156111115761111061107b565b5b602082029050602081019050919050565b600080fd5b600067ffffffffffffffff8211156111425761114161107b565b5b61114b8261106a565b9050602081019050919050565b82818337600083830152505050565b600061117a61117584611127565b6110db565b90508281526020810184848401111561119657611195611122565b5b6111a1848285611158565b509392505050565b600082601f8301126111be576111bd611005565b5b81356111ce848260208601611167565b91505092915050565b60006111ea6111e5846110f6565b6110db565b9050808382526020820190506020840283018581111561120d5761120c61100f565b5b835b8181101561125457803567ffffffffffffffff81111561123257611231611005565b5b80860161123f89826111a9565b8552602085019450505060208101905061120f565b5050509392505050565b600082601f83011261127357611272611005565b5b81356112838482602086016111d7565b91505092915050565b600067ffffffffffffffff8211156112a7576112a661107b565b5b602082029050602081019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006112e3826112b8565b9050919050565b60006112f5826112d8565b9050919050565b611305816112ea565b811461131057600080fd5b50565b600081359050611322816112fc565b92915050565b600061133b6113368461128c565b6110db565b9050808382526020820190506020840283018581111561135e5761135d61100f565b5b835b8181101561138757806113738882611313565b845260208401935050602081019050611360565b5050509392505050565b600082601f8301126113a6576113a5611005565b5b81356113b6848260208601611328565b91505092915050565b600080600080606085870312156113d9576113d8610ffb565b5b600085013567ffffffffffffffff8111156113f7576113f6611000565b5b61140387828801611014565b9450945050602085013567ffffffffffffffff81111561142657611425611000565b5b6114328782880161125e565b925050604085013567ffffffffffffffff81111561145357611452611000565b5b61145f87828801611391565b91505092959194509250565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b6114aa81611497565b82525050565b60006114bc83836114a1565b60208301905092915050565b6000602082019050919050565b60006114e08261146b565b6114ea8185611476565b93506114f583611487565b8060005b8381101561152657815161150d88826114b0565b9750611518836114c8565b9250506001810190506114f9565b5085935050505092915050565b6000602083016000830151848203600086015261155082826114d5565b9150508091505092915050565b600060208201905081810360008301526115778184611533565b905092915050565b61158881611497565b811461159357600080fd5b50565b6000813590506115a58161157f565b92915050565b600080604083850312156115c2576115c1610ffb565b5b60006115d085828601611596565b92505060206115e185828601611596565b9150509250929050565b6115f481611497565b82525050565b600060208201905061160f60008301846115eb565b92915050565b6000611620826112d8565b9050919050565b61163081611615565b811461163b57600080fd5b50565b60008135905061164d81611627565b92915050565b600061165e826112d8565b9050919050565b61166e81611653565b811461167957600080fd5b50565b60008135905061168b81611665565b92915050565b61169a816112d8565b81146116a557600080fd5b50565b6000813590506116b781611691565b92915050565b6000806000606084860312156116d6576116d5610ffb565b5b60006116e48682870161163e565b93505060206116f58682870161167c565b9250506040611706868287016116a8565b9150509250925092565b60008083601f84011261172657611725611005565b5b8235905067ffffffffffffffff8111156117435761174261100a565b5b60208301915083600182028301111561175f5761175e61100f565b5b9250929050565b600080600080606085870312156117805761177f610ffb565b5b600061178e878288016116a8565b945050602061179f87828801611596565b935050604085013567ffffffffffffffff8111156117c0576117bf611000565b5b6117cc87828801611710565b925092505092959194509250565b60008115159050919050565b6117ef816117da565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b8381101561182f578082015181840152602081019050611814565b60008484015250505050565b6000611846826117f5565b6118508185611800565b9350611860818560208601611811565b6118698161106a565b840191505092915050565b600060408201905061188960008301856117e6565b818103602083015261189b818461183b565b90509392505050565b6000806000606084860312156118bd576118bc610ffb565b5b60006118cb86828701611596565b93505060206118dc86828701611596565b92505060406118ed86828701611596565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b61192f816112d8565b82525050565b600060208201905061194a6000830184611926565b92915050565b60008151905061195f8161157f565b92915050565b60006020828403121561197b5761197a610ffb565b5b600061198984828501611950565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006119cc82611497565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036119fe576119fd611992565b5b600182019050919050565b600082825260208201905092915050565b7f214153534552545f475400000000000000000000000000000000000000000000600082015250565b6000611a50600a83611a09565b9150611a5b82611a1a565b602082019050919050565b60006020820190508181036000830152611a7f81611a43565b9050919050565b6000611a9182611497565b9150611a9c83611497565b9250828201905080821115611ab457611ab3611992565b5b92915050565b6000819050919050565b6000611adf611ada611ad5846112b8565b611aba565b6112b8565b9050919050565b6000611af182611ac4565b9050919050565b6000611b0382611ae6565b9050919050565b611b1381611af8565b82525050565b6000604082019050611b2e6000830185611b0a565b611b3b6020830184611926565b9392505050565b6000604082019050611b576000830185611926565b611b6460208301846115eb565b9392505050565b600081905092915050565b6000611b828385611b6b565b9350611b8f838584611158565b82840190509392505050565b6000611ba8828486611b76565b91508190509392505050565b7f214153534552545f455100000000000000000000000000000000000000000000600082015250565b6000611bea600a83611a09565b9150611bf582611bb4565b602082019050919050565b60006020820190508181036000830152611c1981611bdd565b9050919050565b6000611c2b82611497565b9150611c3683611497565b9250828203905081811115611c4e57611c4d611992565b5b92915050565b6000611c5f82611497565b9150611c6a83611497565b9250828202611c7881611497565b91508282048414831517611c8f57611c8e611992565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000611cd082611497565b9150611cdb83611497565b925082611ceb57611cea611c96565b5b828204905092915050565b6000611d01826117f5565b611d0b8185611b6b565b9350611d1b818560208601611811565b80840191505092915050565b6000611d338284611cf6565b915081905092915050565b7f5f657865637574653a2076616c75652063616c6c20686173206e6f2076616c7560008201527f6520696e646963617465642e0000000000000000000000000000000000000000602082015250565b6000611d9a602c83611a09565b9150611da582611d3e565b604082019050919050565b60006020820190508181036000830152611dc981611d8d565b9050919050565b7f496e76616c69642063616c6c7479706500000000000000000000000000000000600082015250565b6000611e06601083611a09565b9150611e1182611dd0565b602082019050919050565b60006020820190508181036000830152611e3581611df9565b9050919050565b6000819050919050565b6000611e61611e5c611e5784611e3c565b611aba565b611497565b9050919050565b611e7181611e46565b82525050565b600081519050919050565b6000611e8d82611e77565b611e978185611a09565b9350611ea7818560208601611811565b611eb08161106a565b840191505092915050565b6000606082019050611ed06000830186611e68565b611edd6020830185611926565b8181036040830152611eef8184611e82565b9050949350505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600082825260208201905092915050565b6000611f41826117f5565b611f4b8185611f25565b9350611f5b818560208601611811565b611f648161106a565b840191505092915050565b6000611f7b8383611f36565b905092915050565b6000602082019050919050565b6000611f9b82611ef9565b611fa58185611f04565b935083602082028501611fb785611f15565b8060005b85811015611ff35784840389528151611fd48582611f6f565b9450611fdf83611f83565b925060208a01995050600181019050611fbb565b50829750879550505050505092915050565b6000602082019050818103600083015261201f8184611f90565b905092915050565b600061203282611497565b915061203d83611497565b92508261204d5761204c611c96565b5b828206905092915050565b7f44796e616d6963207374617465207661726961626c6573206d7573742062652060008201527f61206d756c7469706c65206f6620333220627974657300000000000000000000602082015250565b60006120b4603683611a09565b91506120bf82612058565b604082019050919050565b600060208201905081810360008301526120e3816120a7565b9050919050565b7f537461746963207374617465207661726961626c6573206d757374206265203360008201527f3220627974657300000000000000000000000000000000000000000000000000602082015250565b6000612146602783611a09565b9150612151826120ea565b604082019050919050565b6000602082019050818103600083015261217581612139565b9050919050565b600061218f61218a84611127565b6110db565b9050828152602081018484840111156121ab576121aa611122565b5b6121b6848285611811565b509392505050565b600082601f8301126121d3576121d2611005565b5b81516121e384826020860161217c565b91505092915050565b60006121ff6121fa846110f6565b6110db565b905080838252602082019050602084028301858111156122225761222161100f565b5b835b8181101561226957805167ffffffffffffffff81111561224757612246611005565b5b80860161225489826121be565b85526020850194505050602081019050612224565b5050509392505050565b600082601f83011261228857612287611005565b5b81516122988482602086016121ec565b91505092915050565b6000602082840312156122b7576122b6610ffb565b5b600082015167ffffffffffffffff8111156122d5576122d4611000565b5b6122e184828501612273565b91505092915050565b7f4f6e6c79206f6e652072657475726e2076616c7565207065726d69747465642060008201527f287661726961626c652900000000000000000000000000000000000000000000602082015250565b6000612346602a83611a09565b9150612351826122ea565b604082019050919050565b6000602082019050818103600083015261237581612339565b9050919050565b7f4f6e6c79206f6e652072657475726e2076616c7565207065726d69747465642060008201527f2873746174696329000000000000000000000000000000000000000000000000602082015250565b60006123d8602883611a09565b91506123e38261237c565b604082019050919050565b60006020820190508181036000830152612407816123cb565b905091905056fea2646970667358221220d20b8b192373ad0a10499df0dbb1adabd450946fd37a2dda52a990d04ca153d364736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "command_index";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "target";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "message";
            readonly type: "string";
        }];
        readonly name: "ExecutionFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "a";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "b";
            readonly type: "uint256";
        }];
        readonly name: "add";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "a";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "b";
            readonly type: "uint256";
        }];
        readonly name: "assertEqual";
        readonly outputs: readonly [];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "a";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "b";
            readonly type: "uint256";
        }];
        readonly name: "assertLarger";
        readonly outputs: readonly [];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "commands";
            readonly type: "bytes32[]";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "state";
            readonly type: "bytes[]";
        }, {
            readonly internalType: "contract IERC20[]";
            readonly name: "tokens";
            readonly type: "address[]";
        }];
        readonly name: "execute";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "dust";
                readonly type: "uint256[]";
            }];
            readonly internalType: "struct ExecuteOutput";
            readonly name: "out";
            readonly type: "tuple";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "a";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "b";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "scale";
            readonly type: "uint256";
        }];
        readonly name: "fpMul";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract FacadeRead";
            readonly name: "facade";
            readonly type: "address";
        }, {
            readonly internalType: "contract RToken";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "recipient";
            readonly type: "address";
        }];
        readonly name: "mintMaxRToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "rawCall";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes";
            readonly name: "out";
            readonly type: "bytes";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "a";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "b";
            readonly type: "uint256";
        }];
        readonly name: "sub";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): ZapperExecutorInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ZapperExecutor;
}
export {};
