/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  SlipstreamRouterCall,
  SlipstreamRouterCallInterface,
} from "../../../contracts/Aerodrome.sol/SlipstreamRouterCall";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountA",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountB",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedA",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedB",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "encoding",
        type: "bytes",
      },
    ],
    name: "addLiquidityV2",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
      {
        internalType: "contract IAerodromeRouter",
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
        name: "encoding",
        type: "bytes",
      },
    ],
    name: "exactInputSingleV2",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
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
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedA",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedB",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "encoding",
        type: "bytes",
      },
    ],
    name: "removeLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061185b806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80634ac6d1581461005c5780634d49dcf8146100785780636919e674146100a8578063b908e456146100d8578063bdd613d314610108575b600080fd5b6100766004803603810190610071919061099a565b610138565b005b610092600480360381019061008d9190610ab9565b6101f8565b60405161009f9190610b5f565b60405180910390f35b6100c260048036038101906100bd9190610bda565b6103cc565b6040516100cf9190610b5f565b60405180910390f35b6100f260048036038101906100ed9190610c62565b61047c565b6040516100ff9190610b5f565b60405180910390f35b610122600480360381019061011d9190610cf9565b6106b3565b60405161012f9190610b5f565b60405180910390f35b600080600080600080868060200190518101906101559190610e1b565b9550955095509550955095508173ffffffffffffffffffffffffffffffffffffffff16630dede6c48787878e8e8e8a896040518963ffffffff1660e01b81526004016101a8989796959493929190610ec6565b60408051808303816000875af11580156101c6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101ea9190610f44565b505050505050505050505050565b6000806000806000858060200190518101906102149190610f84565b93509350935093506000600167ffffffffffffffff8111156102395761023861086f565b5b60405190808252806020026020018201604052801561027257816020015b61025f61079e565b8152602001906001900390816102575790505b50905060405180608001604052808673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff16815260200184151581526020018373ffffffffffffffffffffffffffffffffffffffff16815250816000815181106102ee576102ed610feb565b5b602002602001018190525060008973ffffffffffffffffffffffffffffffffffffffff1663cac88ea98d8d858d6103e8426103299190611049565b6040518663ffffffff1660e01b815260040161034995949392919061119f565b6000604051808303816000875af1158015610368573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525081019061039191906112bc565b905080600182516103a29190611305565b815181106103b3576103b2610feb565b5b6020026020010151965050505050505095945050505050565b60008083838101906103de919061146d565b9050868160a0018181525050858160c00181815250508473ffffffffffffffffffffffffffffffffffffffff1663a026383e826040518263ffffffff1660e01b815260040161042d919061156a565b6020604051808303816000875af115801561044c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104709190611586565b91505095945050505050565b600080604051806101000160405280888152602001878152602001868152602001858152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600015158152602001600073ffffffffffffffffffffffffffffffffffffffff16815250905060008060008060008780602001905181019061051f91906115b3565b9450945094509450945084866080019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050838660a0019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050828660c0019015159081151581525050818660e0019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505060008173ffffffffffffffffffffffffffffffffffffffff16635a47ddc388608001518960a001518a60c001518b600001518c602001518d604001518e606001518f60e001516103e8426106359190611049565b6040518a63ffffffff1660e01b81526004016106599998979695949392919061162e565b6060604051808303816000875af1158015610678573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061069c91906116bb565b925050508097505050505050505095945050505050565b6000806040518060a001604052808481526020018573ffffffffffffffffffffffffffffffffffffffff1681526020016103e8426106f19190611049565b815260200188815260200187815250905086816060018181525050858160800181815250508473ffffffffffffffffffffffffffffffffffffffff1663c04b8d59826040518263ffffffff1660e01b815260040161074f9190611803565b6020604051808303816000875af115801561076e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107929190611586565b91505095945050505050565b6040518060800160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600015158152602001600073ffffffffffffffffffffffffffffffffffffffff1681525090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b6108318161081e565b811461083c57600080fd5b50565b60008135905061084e81610828565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6108a78261085e565b810181811067ffffffffffffffff821117156108c6576108c561086f565b5b80604052505050565b60006108d961080a565b90506108e5828261089e565b919050565b600067ffffffffffffffff8211156109055761090461086f565b5b61090e8261085e565b9050602081019050919050565b82818337600083830152505050565b600061093d610938846108ea565b6108cf565b90508281526020810184848401111561095957610958610859565b5b61096484828561091b565b509392505050565b600082601f83011261098157610980610854565b5b813561099184826020860161092a565b91505092915050565b600080600080608085870312156109b4576109b3610814565b5b60006109c28782880161083f565b94505060206109d38782880161083f565b93505060406109e48782880161083f565b925050606085013567ffffffffffffffff811115610a0557610a04610819565b5b610a118782880161096c565b91505092959194509250565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610a4882610a1d565b9050919050565b6000610a5a82610a3d565b9050919050565b610a6a81610a4f565b8114610a7557600080fd5b50565b600081359050610a8781610a61565b92915050565b610a9681610a3d565b8114610aa157600080fd5b50565b600081359050610ab381610a8d565b92915050565b600080600080600060a08688031215610ad557610ad4610814565b5b6000610ae38882890161083f565b9550506020610af48882890161083f565b9450506040610b0588828901610a78565b9350506060610b1688828901610aa4565b925050608086013567ffffffffffffffff811115610b3757610b36610819565b5b610b438882890161096c565b9150509295509295909350565b610b598161081e565b82525050565b6000602082019050610b746000830184610b50565b92915050565b600080fd5b600080fd5b60008083601f840112610b9a57610b99610854565b5b8235905067ffffffffffffffff811115610bb757610bb6610b7a565b5b602083019150836001820283011115610bd357610bd2610b7f565b5b9250929050565b600080600080600060808688031215610bf657610bf5610814565b5b6000610c048882890161083f565b9550506020610c158882890161083f565b9450506040610c2688828901610aa4565b935050606086013567ffffffffffffffff811115610c4757610c46610819565b5b610c5388828901610b84565b92509250509295509295909350565b600080600080600060a08688031215610c7e57610c7d610814565b5b6000610c8c8882890161083f565b9550506020610c9d8882890161083f565b9450506040610cae8882890161083f565b9350506060610cbf8882890161083f565b925050608086013567ffffffffffffffff811115610ce057610cdf610819565b5b610cec8882890161096c565b9150509295509295909350565b600080600080600060a08688031215610d1557610d14610814565b5b6000610d238882890161083f565b9550506020610d348882890161083f565b9450506040610d4588828901610aa4565b9350506060610d5688828901610aa4565b925050608086013567ffffffffffffffff811115610d7757610d76610819565b5b610d838882890161096c565b9150509295509295909350565b6000610d9b82610a1d565b9050919050565b610dab81610d90565b8114610db657600080fd5b50565b600081519050610dc881610da2565b92915050565b60008115159050919050565b610de381610dce565b8114610dee57600080fd5b50565b600081519050610e0081610dda565b92915050565b600081519050610e1581610828565b92915050565b60008060008060008060c08789031215610e3857610e37610814565b5b6000610e4689828a01610db9565b9650506020610e5789828a01610db9565b9550506040610e6889828a01610df1565b9450506060610e7989828a01610db9565b9350506080610e8a89828a01610db9565b92505060a0610e9b89828a01610e06565b9150509295509295509295565b610eb181610a3d565b82525050565b610ec081610dce565b82525050565b600061010082019050610edc600083018b610ea8565b610ee9602083018a610ea8565b610ef66040830189610eb7565b610f036060830188610b50565b610f106080830187610b50565b610f1d60a0830186610b50565b610f2a60c0830185610ea8565b610f3760e0830184610b50565b9998505050505050505050565b60008060408385031215610f5b57610f5a610814565b5b6000610f6985828601610e06565b9250506020610f7a85828601610e06565b9150509250929050565b60008060008060808587031215610f9e57610f9d610814565b5b6000610fac87828801610db9565b9450506020610fbd87828801610db9565b9350506040610fce87828801610df1565b9250506060610fdf87828801610db9565b91505092959194509250565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006110548261081e565b915061105f8361081e565b92508282019050808211156110775761107661101a565b5b92915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6110b281610a3d565b82525050565b6110c181610dce565b82525050565b6080820160008201516110dd60008501826110a9565b5060208201516110f060208501826110a9565b50604082015161110360408501826110b8565b50606082015161111660608501826110a9565b50505050565b600061112883836110c7565b60808301905092915050565b6000602082019050919050565b600061114c8261107d565b6111568185611088565b935061116183611099565b8060005b83811015611192578151611179888261111c565b975061118483611134565b925050600181019050611165565b5085935050505092915050565b600060a0820190506111b46000830188610b50565b6111c16020830187610b50565b81810360408301526111d38186611141565b90506111e26060830185610ea8565b6111ef6080830184610b50565b9695505050505050565b600067ffffffffffffffff8211156112145761121361086f565b5b602082029050602081019050919050565b6000611238611233846111f9565b6108cf565b9050808382526020820190506020840283018581111561125b5761125a610b7f565b5b835b8181101561128457806112708882610e06565b84526020840193505060208101905061125d565b5050509392505050565b600082601f8301126112a3576112a2610854565b5b81516112b3848260208601611225565b91505092915050565b6000602082840312156112d2576112d1610814565b5b600082015167ffffffffffffffff8111156112f0576112ef610819565b5b6112fc8482850161128e565b91505092915050565b60006113108261081e565b915061131b8361081e565b92508282039050818111156113335761133261101a565b5b92915050565b600080fd5b60008160020b9050919050565b6113548161133e565b811461135f57600080fd5b50565b6000813590506113718161134b565b92915050565b61138081610a1d565b811461138b57600080fd5b50565b60008135905061139d81611377565b92915050565b600061010082840312156113ba576113b9611339565b5b6113c56101006108cf565b905060006113d584828501610aa4565b60008301525060206113e984828501610aa4565b60208301525060406113fd84828501611362565b604083015250606061141184828501610aa4565b60608301525060806114258482850161083f565b60808301525060a06114398482850161083f565b60a08301525060c061144d8482850161083f565b60c08301525060e06114618482850161138e565b60e08301525092915050565b6000610100828403121561148457611483610814565b5b6000611492848285016113a3565b91505092915050565b6114a48161133e565b82525050565b6114b38161081e565b82525050565b6114c281610a1d565b82525050565b610100820160008201516114df60008501826110a9565b5060208201516114f260208501826110a9565b506040820151611505604085018261149b565b50606082015161151860608501826110a9565b50608082015161152b60808501826114aa565b5060a082015161153e60a08501826114aa565b5060c082015161155160c08501826114aa565b5060e082015161156460e08501826114b9565b50505050565b60006101008201905061158060008301846114c8565b92915050565b60006020828403121561159c5761159b610814565b5b60006115aa84828501610e06565b91505092915050565b600080600080600060a086880312156115cf576115ce610814565b5b60006115dd88828901610db9565b95505060206115ee88828901610db9565b94505060406115ff88828901610df1565b935050606061161088828901610db9565b925050608061162188828901610db9565b9150509295509295909350565b600061012082019050611644600083018c610ea8565b611651602083018b610ea8565b61165e604083018a610eb7565b61166b6060830189610b50565b6116786080830188610b50565b61168560a0830187610b50565b61169260c0830186610b50565b61169f60e0830185610ea8565b6116ad610100830184610b50565b9a9950505050505050505050565b6000806000606084860312156116d4576116d3610814565b5b60006116e286828701610e06565b93505060206116f386828701610e06565b925050604061170486828701610e06565b9150509250925092565b600081519050919050565b600082825260208201905092915050565b60005b8381101561174857808201518184015260208101905061172d565b60008484015250505050565b600061175f8261170e565b6117698185611719565b935061177981856020860161172a565b6117828161085e565b840191505092915050565b600060a08301600083015184820360008601526117aa8282611754565b91505060208301516117bf60208601826110a9565b5060408301516117d260408601826114aa565b5060608301516117e560608601826114aa565b5060808301516117f860808601826114aa565b508091505092915050565b6000602082019050818103600083015261181d818461178d565b90509291505056fea26469706673582212205fd13f9ff5cfc28d04124d3a11171a6c175e9e48feab42467f4f011a4e43369564736f6c63430008110033";

type SlipstreamRouterCallConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SlipstreamRouterCallConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SlipstreamRouterCall__factory extends ContractFactory {
  constructor(...args: SlipstreamRouterCallConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<SlipstreamRouterCall> {
    return super.deploy(overrides || {}) as Promise<SlipstreamRouterCall>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): SlipstreamRouterCall {
    return super.attach(address) as SlipstreamRouterCall;
  }
  override connect(signer: Signer): SlipstreamRouterCall__factory {
    return super.connect(signer) as SlipstreamRouterCall__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SlipstreamRouterCallInterface {
    return new utils.Interface(_abi) as SlipstreamRouterCallInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SlipstreamRouterCall {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as SlipstreamRouterCall;
  }
}
