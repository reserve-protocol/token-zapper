/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ZapperExecutor,
  ZapperExecutorInterface,
} from "../../../contracts/Zapper2.sol/ZapperExecutor";

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
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b503073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1681525050608051611dda61005d60003960005050611dda6000f3fe6080604052600436106100435760003560e01c806308c4b4981461004f578063771602f71461007f578063b67d77c5146100bc578063d47b0de4146100f95761004a565b3661004a57005b600080fd5b61006960048036038101906100649190611145565b610136565b60405161007691906112e3565b60405180910390f35b34801561008b57600080fd5b506100a660048036038101906100a19190611331565b6102cb565b6040516100b39190611380565b60405180910390f35b3480156100c857600080fd5b506100e360048036038101906100de9190611331565b6102e1565b6040516100f09190611380565b60405180910390f35b34801561010557600080fd5b50610120600480360381019061011b919061139b565b6102f7565b60405161012d9190611380565b60405180910390f35b61013e610d64565b6000303f905061014f868686610319565b50825167ffffffffffffffff81111561016b5761016a610e01565b5b6040519080825280602002602001820160405280156101995781602001602082028036833780820191505090505b50826000018190525060005b8351811015610278578381815181106101c1576101c06113ee565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b8152600401610201919061142c565b602060405180830381865afa15801561021e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610242919061145c565b83600001518281518110610259576102586113ee565b5b6020026020010181815250508080610270906114b8565b9150506101a5565b506000303f90508181146102c1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102b890611583565b60405180910390fd5b5050949350505050565b600081836102d991906115a3565b905092915050565b600081836102ef91906115d7565b905092915050565b6000818385610306919061160b565b610310919061167c565b90509392505050565b60606000806000806060600089899050905060005b81811015610781578a8a82818110610349576103486113ee565b5b905060200201359650602087901b60f81c60ff16955060006080871614610397578a8a8280610377906114b8565b9350818110610389576103886113ee565b5b9050602002013594506103c1565b79ffffffffffffffffffffffffffffffffffffffffffffffffffff602888901b60001c1760001b94505b60006003871603610456578660001c73ffffffffffffffffffffffffffffffffffffffff166103fb88878c6107929092919063ffffffff16565b604051610408919061171e565b600060405180830381855af49150503d8060008114610443576040519150601f19603f3d011682016040523d82523d6000602084013e610448565b606091505b5080945081955050506106d7565b600160038716036104ed578660001c73ffffffffffffffffffffffffffffffffffffffff1661049088878c6107929092919063ffffffff16565b60405161049d919061171e565b6000604051808303816000865af19150503d80600081146104da576040519150601f19603f3d011682016040523d82523d6000602084013e6104df565b606091505b5080945081955050506106d6565b60026003871603610582578660001c73ffffffffffffffffffffffffffffffffffffffff1661052788878c6107929092919063ffffffff16565b604051610534919061171e565b600060405180830381855afa9150503d806000811461056f576040519150601f19603f3d011682016040523d82523d6000602084013e610574565b606091505b5080945081955050506106d5565b600380871603610699576000808a8760f81c60ff16815181106105a8576105a76113ee565b5b6020026020010151905060208151146105f6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105ed906117a7565b60405180910390fd5b602081015191508860001c73ffffffffffffffffffffffffffffffffffffffff168261063a8b60ff60088c901b60001c1760001b8f6107929092919063ffffffff16565b604051610647919061171e565b60006040518083038185875af1925050503d8060008114610684576040519150601f19603f3d011682016040523d82523d6000602084013e610689565b606091505b50809650819750505050506106d4565b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106cb90611813565b60405180910390fd5b5b5b5b83610731576000835111156106ed576044830192505b808760001c846040517fef3dcb2f00000000000000000000000000000000000000000000000000000000815260040161072893929190611877565b60405180910390fd5b6000604087161461075a57610755605888901b848b610af69092919063ffffffff16565b610776565b610773605888901b848b610bab9092919063ffffffff16565b98505b80600101905061032e565b508796505050505050509392505050565b606060008060606000805b6020811015610936578681602081106107b9576107b86113ee565b5b1a60f81b60f81c60ff16915060ff82031561093657600060808316146108b45760fe820361082157600083510361080d57886040516020016107fb91906119c1565b60405160208183030381529060405292505b82518561081a91906115a3565b94506108af565b600089607f841681518110610839576108386113ee565b5b6020026020010151519050600060208261085391906119e3565b14610893576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161088a90611a86565b60405180910390fd5b6020816108a091906115a3565b866108ab91906115a3565b9550505b610925565b602089607f8416815181106108cc576108cb6113ee565b5b60200260200101515114610915576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161090c90611b18565b60405180910390fd5b60208561092291906115a3565b94505b60208401935080600101905061079d565b5060048461094491906115a3565b67ffffffffffffffff81111561095d5761095c610e01565b5b6040519080825280601f01601f19166020018201604052801561098f5781602001600182028036833780820191505090505b5094508660208601526000935060005b6020811015610aea578681602081106109bb576109ba6113ee565b5b1a60f81b60f81c60ff16915060ff820315610aea5760006080831614610aa95760fe8203610a32578385602488010152610a12836020886004886109ff91906115a3565b60208851610a0d91906115d7565b610d4a565b60208351610a2091906115d7565b84610a2b91906115a3565b9350610aa4565b600089607f841681518110610a4a57610a496113ee565b5b60200260200101515190508486602489010152610a948a607f851681518110610a7657610a756113ee565b5b6020026020010151600089600489610a8e91906115a3565b85610d4a565b8085610aa091906115a3565b9450505b610ad9565b600089607f841681518110610ac157610ac06113ee565b5b60200260200101519050602081015186602489010152505b60208501945080600101905061099f565b50505050509392505050565b60008260f81c60ff16905060ff8103610b0f5750610ba6565b600060208351610b1f91906115a3565b67ffffffffffffffff811115610b3857610b37610e01565b5b6040519080825280601f01601f191660200182016040528015610b6a5781602001600182028036833780820191505090505b50858381518110610b7e57610b7d6113ee565b5b602002602001018190529050610b9a8360008360208751610d4a565b82518060208301525050505b505050565b606060008360f81c60ff16905060ff8103610bc95784915050610d43565b60006080821614610c655760fe8103610bf75782806020019051810190610bf09190611c5d565b9450610c60565b60006020840151905060208114610c43576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3a90611d18565b60405180910390fd5b60208451036020850152602084016020607f841602602088010152505b610d3e565b602083511015610caa576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ca190611d84565b60405180910390fd5b602083511115610d1b576000602067ffffffffffffffff811115610cd157610cd0610e01565b5b6040519080825280601f01601f191660200182016040528015610d035781602001600182028036833780820191505090505b509050610d168460008360008851610d4a565b809350505b8285607f831681518110610d3257610d316113ee565b5b60200260200101819052505b849150505b9392505050565b808260208501018286602089010160045afa505050505050565b6040518060200160405280606081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610db057610daf610d8b565b5b8235905067ffffffffffffffff811115610dcd57610dcc610d90565b5b602083019150836020820283011115610de957610de8610d95565b5b9250929050565b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610e3982610df0565b810181811067ffffffffffffffff82111715610e5857610e57610e01565b5b80604052505050565b6000610e6b610d77565b9050610e778282610e30565b919050565b600067ffffffffffffffff821115610e9757610e96610e01565b5b602082029050602081019050919050565b600080fd5b600067ffffffffffffffff821115610ec857610ec7610e01565b5b610ed182610df0565b9050602081019050919050565b82818337600083830152505050565b6000610f00610efb84610ead565b610e61565b905082815260208101848484011115610f1c57610f1b610ea8565b5b610f27848285610ede565b509392505050565b600082601f830112610f4457610f43610d8b565b5b8135610f54848260208601610eed565b91505092915050565b6000610f70610f6b84610e7c565b610e61565b90508083825260208201905060208402830185811115610f9357610f92610d95565b5b835b81811015610fda57803567ffffffffffffffff811115610fb857610fb7610d8b565b5b808601610fc58982610f2f565b85526020850194505050602081019050610f95565b5050509392505050565b600082601f830112610ff957610ff8610d8b565b5b8135611009848260208601610f5d565b91505092915050565b600067ffffffffffffffff82111561102d5761102c610e01565b5b602082029050602081019050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006110698261103e565b9050919050565b600061107b8261105e565b9050919050565b61108b81611070565b811461109657600080fd5b50565b6000813590506110a881611082565b92915050565b60006110c16110bc84611012565b610e61565b905080838252602082019050602084028301858111156110e4576110e3610d95565b5b835b8181101561110d57806110f98882611099565b8452602084019350506020810190506110e6565b5050509392505050565b600082601f83011261112c5761112b610d8b565b5b813561113c8482602086016110ae565b91505092915050565b6000806000806060858703121561115f5761115e610d81565b5b600085013567ffffffffffffffff81111561117d5761117c610d86565b5b61118987828801610d9a565b9450945050602085013567ffffffffffffffff8111156111ac576111ab610d86565b5b6111b887828801610fe4565b925050604085013567ffffffffffffffff8111156111d9576111d8610d86565b5b6111e587828801611117565b91505092959194509250565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b6112308161121d565b82525050565b60006112428383611227565b60208301905092915050565b6000602082019050919050565b6000611266826111f1565b61127081856111fc565b935061127b8361120d565b8060005b838110156112ac5781516112938882611236565b975061129e8361124e565b92505060018101905061127f565b5085935050505092915050565b600060208301600083015184820360008601526112d6828261125b565b9150508091505092915050565b600060208201905081810360008301526112fd81846112b9565b905092915050565b61130e8161121d565b811461131957600080fd5b50565b60008135905061132b81611305565b92915050565b6000806040838503121561134857611347610d81565b5b60006113568582860161131c565b92505060206113678582860161131c565b9150509250929050565b61137a8161121d565b82525050565b60006020820190506113956000830184611371565b92915050565b6000806000606084860312156113b4576113b3610d81565b5b60006113c28682870161131c565b93505060206113d38682870161131c565b92505060406113e48682870161131c565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6114268161105e565b82525050565b6000602082019050611441600083018461141d565b92915050565b60008151905061145681611305565b92915050565b60006020828403121561147257611471610d81565b5b600061148084828501611447565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006114c38261121d565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036114f5576114f4611489565b5b600182019050919050565b600082825260208201905092915050565b7f50726576656e7454616d706572696e673a20436f646520686173206368616e6760008201527f6564000000000000000000000000000000000000000000000000000000000000602082015250565b600061156d602283611500565b915061157882611511565b604082019050919050565b6000602082019050818103600083015261159c81611560565b9050919050565b60006115ae8261121d565b91506115b98361121d565b92508282019050808211156115d1576115d0611489565b5b92915050565b60006115e28261121d565b91506115ed8361121d565b925082820390508181111561160557611604611489565b5b92915050565b60006116168261121d565b91506116218361121d565b925082820261162f8161121d565b9150828204841483151761164657611645611489565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b60006116878261121d565b91506116928361121d565b9250826116a2576116a161164d565b5b828204905092915050565b600081519050919050565b600081905092915050565b60005b838110156116e15780820151818401526020810190506116c6565b60008484015250505050565b60006116f8826116ad565b61170281856116b8565b93506117128185602086016116c3565b80840191505092915050565b600061172a82846116ed565b915081905092915050565b7f5f657865637574653a2076616c75652063616c6c20686173206e6f2076616c7560008201527f6520696e646963617465642e0000000000000000000000000000000000000000602082015250565b6000611791602c83611500565b915061179c82611735565b604082019050919050565b600060208201905081810360008301526117c081611784565b9050919050565b7f496e76616c69642063616c6c7479706500000000000000000000000000000000600082015250565b60006117fd601083611500565b9150611808826117c7565b602082019050919050565b6000602082019050818103600083015261182c816117f0565b9050919050565b600081519050919050565b600061184982611833565b6118538185611500565b93506118638185602086016116c3565b61186c81610df0565b840191505092915050565b600060608201905061188c6000830186611371565b611899602083018561141d565b81810360408301526118ab818461183e565b9050949350505050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600082825260208201905092915050565b60006118fd826116ad565b61190781856118e1565b93506119178185602086016116c3565b61192081610df0565b840191505092915050565b600061193783836118f2565b905092915050565b6000602082019050919050565b6000611957826118b5565b61196181856118c0565b935083602082028501611973856118d1565b8060005b858110156119af5784840389528151611990858261192b565b945061199b8361193f565b925060208a01995050600181019050611977565b50829750879550505050505092915050565b600060208201905081810360008301526119db818461194c565b905092915050565b60006119ee8261121d565b91506119f98361121d565b925082611a0957611a0861164d565b5b828206905092915050565b7f44796e616d6963207374617465207661726961626c6573206d7573742062652060008201527f61206d756c7469706c65206f6620333220627974657300000000000000000000602082015250565b6000611a70603683611500565b9150611a7b82611a14565b604082019050919050565b60006020820190508181036000830152611a9f81611a63565b9050919050565b7f537461746963207374617465207661726961626c6573206d757374206265203360008201527f3220627974657300000000000000000000000000000000000000000000000000602082015250565b6000611b02602783611500565b9150611b0d82611aa6565b604082019050919050565b60006020820190508181036000830152611b3181611af5565b9050919050565b6000611b4b611b4684610ead565b610e61565b905082815260208101848484011115611b6757611b66610ea8565b5b611b728482856116c3565b509392505050565b600082601f830112611b8f57611b8e610d8b565b5b8151611b9f848260208601611b38565b91505092915050565b6000611bbb611bb684610e7c565b610e61565b90508083825260208201905060208402830185811115611bde57611bdd610d95565b5b835b81811015611c2557805167ffffffffffffffff811115611c0357611c02610d8b565b5b808601611c108982611b7a565b85526020850194505050602081019050611be0565b5050509392505050565b600082601f830112611c4457611c43610d8b565b5b8151611c54848260208601611ba8565b91505092915050565b600060208284031215611c7357611c72610d81565b5b600082015167ffffffffffffffff811115611c9157611c90610d86565b5b611c9d84828501611c2f565b91505092915050565b7f4f6e6c79206f6e652072657475726e2076616c7565207065726d69747465642060008201527f287661726961626c652900000000000000000000000000000000000000000000602082015250565b6000611d02602a83611500565b9150611d0d82611ca6565b604082019050919050565b60006020820190508181036000830152611d3181611cf5565b9050919050565b7f52657475726e206174206c656173742033322062797465730000000000000000600082015250565b6000611d6e601883611500565b9150611d7982611d38565b602082019050919050565b60006020820190508181036000830152611d9d81611d61565b905091905056fea26469706673582212204fb5ef95513f5a42c633f8af6410dd59de9f8476e13524c0f301fe95b588033564736f6c63430008110033";

type ZapperExecutorConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ZapperExecutorConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ZapperExecutor__factory extends ContractFactory {
  constructor(...args: ZapperExecutorConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ZapperExecutor> {
    return super.deploy(overrides || {}) as Promise<ZapperExecutor>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ZapperExecutor {
    return super.attach(address) as ZapperExecutor;
  }
  override connect(signer: Signer): ZapperExecutor__factory {
    return super.connect(signer) as ZapperExecutor__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZapperExecutorInterface {
    return new utils.Interface(_abi) as ZapperExecutorInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ZapperExecutor {
    return new Contract(address, _abi, signerOrProvider) as ZapperExecutor;
  }
}
