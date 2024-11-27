/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  CurveRouterCall,
  CurveRouterCallInterface,
} from "../../../../contracts/weiroll-helpers/CurveRouterCall.sol/CurveRouterCall";

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
        name: "expected",
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
    name: "exchange",
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
        internalType: "bytes",
        name: "encodedRouterCall",
        type: "bytes",
      },
    ],
    name: "exchangeNew",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611018806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806309d4802a1461003b5780631a39509f1461006b575b600080fd5b610055600480360381019061005091906103ec565b61009b565b604051610062919061047e565b60405180910390f35b61008560048036038101906100809190610499565b61014c565b604051610092919061047e565b60405180910390f35b600080600080848060200190518101906100b591906107e8565b9250925092508573ffffffffffffffffffffffffffffffffffffffff16639db4f7aa84848b8b866040518663ffffffff1660e01b81526004016100fc959493929190610ab4565b6020604051808303816000875af115801561011b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013f9190610b0c565b9350505050949350505050565b6000806000806000858060200190518101906101689190610d8a565b93509350935093508073ffffffffffffffffffffffffffffffffffffffff1663371dc44785858a866040518563ffffffff1660e01b81526004016101af9493929190610f99565b6020604051808303816000875af11580156101ce573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101f29190610b0c565b94505050505092915050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61022581610212565b811461023057600080fd5b50565b6000813590506102428161021c565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061027382610248565b9050919050565b61028381610268565b811461028e57600080fd5b50565b6000813590506102a08161027a565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102f9826102b0565b810181811067ffffffffffffffff82111715610318576103176102c1565b5b80604052505050565b600061032b6101fe565b905061033782826102f0565b919050565b600067ffffffffffffffff821115610357576103566102c1565b5b610360826102b0565b9050602081019050919050565b82818337600083830152505050565b600061038f61038a8461033c565b610321565b9050828152602081018484840111156103ab576103aa6102ab565b5b6103b684828561036d565b509392505050565b600082601f8301126103d3576103d26102a6565b5b81356103e384826020860161037c565b91505092915050565b6000806000806080858703121561040657610405610208565b5b600061041487828801610233565b945050602061042587828801610233565b935050604061043687828801610291565b925050606085013567ffffffffffffffff8111156104575761045661020d565b5b610463878288016103be565b91505092959194509250565b61047881610212565b82525050565b6000602082019050610493600083018461046f565b92915050565b600080604083850312156104b0576104af610208565b5b60006104be85828601610233565b925050602083013567ffffffffffffffff8111156104df576104de61020d565b5b6104eb858286016103be565b9150509250929050565b600067ffffffffffffffff8211156105105761050f6102c1565b5b602082029050919050565b600080fd5b60008151905061052f8161027a565b92915050565b6000610548610543846104f5565b610321565b905080602084028301858111156105625761056161051b565b5b835b8181101561058b57806105778882610520565b845260208401935050602081019050610564565b5050509392505050565b600082601f8301126105aa576105a96102a6565b5b60096105b7848285610535565b91505092915050565b600067ffffffffffffffff8211156105db576105da6102c1565b5b602082029050919050565b600067ffffffffffffffff821115610601576106006102c1565b5b602082029050919050565b60008151905061061b8161021c565b92915050565b600061063461062f846105e6565b610321565b9050806020840283018581111561064e5761064d61051b565b5b835b818110156106775780610663888261060c565b845260208401935050602081019050610650565b5050509392505050565b600082601f830112610696576106956102a6565b5b60036106a3848285610621565b91505092915050565b60006106bf6106ba846105c0565b610321565b905080606084028301858111156106d9576106d861051b565b5b835b8181101561070257806106ee8882610681565b8452602084019350506060810190506106db565b5050509392505050565b600082601f830112610721576107206102a6565b5b600461072e8482856106ac565b91505092915050565b600067ffffffffffffffff821115610752576107516102c1565b5b602082029050919050565b600061077061076b84610737565b610321565b9050806020840283018581111561078a5761078961051b565b5b835b818110156107b3578061079f8882610520565b84526020840193505060208101905061078c565b5050509392505050565b600082601f8301126107d2576107d16102a6565b5b60046107df84828561075d565b91505092915050565b6000806000610320848603121561080257610801610208565b5b600061081086828701610595565b9350506101206108228682870161070c565b9250506102a0610834868287016107bd565b9150509250925092565b600060099050919050565b600081905092915050565b6000819050919050565b61086781610268565b82525050565b6000610879838361085e565b60208301905092915050565b6000602082019050919050565b61089b8161083e565b6108a58184610849565b92506108b082610854565b8060005b838110156108e15781516108c8878261086d565b96506108d383610885565b9250506001810190506108b4565b505050505050565b600060049050919050565b600081905092915050565b6000819050919050565b600060039050919050565b600081905092915050565b6000819050919050565b61093281610212565b82525050565b60006109448383610929565b60208301905092915050565b6000602082019050919050565b61096681610909565b6109708184610914565b925061097b8261091f565b8060005b838110156109ac5781516109938782610938565b965061099e83610950565b92505060018101905061097f565b505050505050565b60006109c0838361095d565b60608301905092915050565b6000602082019050919050565b6109e2816108e9565b6109ec81846108f4565b92506109f7826108ff565b8060005b83811015610a28578151610a0f87826109b4565b9650610a1a836109cc565b9250506001810190506109fb565b505050505050565b600060049050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b610a6681610a30565b610a708184610a3b565b9250610a7b82610a46565b8060005b83811015610aac578151610a93878261086d565b9650610a9e83610a50565b925050600181019050610a7f565b505050505050565b600061036082019050610aca6000830188610892565b610ad86101208301876109d9565b610ae66102a083018661046f565b610af46102c083018561046f565b610b026102e0830184610a5d565b9695505050505050565b600060208284031215610b2257610b21610208565b5b6000610b308482850161060c565b91505092915050565b600067ffffffffffffffff821115610b5457610b536102c1565b5b602082029050919050565b6000610b72610b6d84610b39565b610321565b90508060208402830185811115610b8c57610b8b61051b565b5b835b81811015610bb55780610ba18882610520565b845260208401935050602081019050610b8e565b5050509392505050565b600082601f830112610bd457610bd36102a6565b5b600b610be1848285610b5f565b91505092915050565b600067ffffffffffffffff821115610c0557610c046102c1565b5b602082029050919050565b600067ffffffffffffffff821115610c2b57610c2a6102c1565b5b602082029050919050565b6000610c49610c4484610c10565b610321565b90508060208402830185811115610c6357610c6261051b565b5b835b81811015610c8c5780610c78888261060c565b845260208401935050602081019050610c65565b5050509392505050565b600082601f830112610cab57610caa6102a6565b5b6005610cb8848285610c36565b91505092915050565b6000610cd4610ccf84610bea565b610321565b90508060a08402830185811115610cee57610ced61051b565b5b835b81811015610d175780610d038882610c96565b84526020840193505060a081019050610cf0565b5050509392505050565b600082601f830112610d3657610d356102a6565b5b6005610d43848285610cc1565b91505092915050565b6000610d5782610248565b9050919050565b610d6781610d4c565b8114610d7257600080fd5b50565b600081519050610d8481610d5e565b92915050565b6000806000806104c08587031215610da557610da4610208565b5b6000610db387828801610bbf565b945050610160610dc587828801610d21565b935050610480610dd78782880161060c565b9250506104a0610de987828801610d75565b91505092959194509250565b6000600b9050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b610e2b81610df5565b610e358184610e00565b9250610e4082610e0b565b8060005b83811015610e71578151610e58878261086d565b9650610e6383610e15565b925050600181019050610e44565b505050505050565b600060059050919050565b600081905092915050565b6000819050919050565b600060059050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b610ecf81610e99565b610ed98184610ea4565b9250610ee482610eaf565b8060005b83811015610f15578151610efc8782610938565b9650610f0783610eb9565b925050600181019050610ee8565b505050505050565b6000610f298383610ec6565b60a08301905092915050565b6000602082019050919050565b610f4b81610e79565b610f558184610e84565b9250610f6082610e8f565b8060005b83811015610f91578151610f788782610f1d565b9650610f8383610f35565b925050600181019050610f64565b505050505050565b60006104c082019050610faf6000830187610e22565b610fbd610160830186610f42565b610fcb61048083018561046f565b610fd96104a083018461046f565b9594505050505056fea2646970667358221220c96b4f1096cad176c9b7b95748f43f97285f088bc875ba8af5dc65321789ba0764736f6c63430008110033";

type CurveRouterCallConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CurveRouterCallConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CurveRouterCall__factory extends ContractFactory {
  constructor(...args: CurveRouterCallConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CurveRouterCall> {
    return super.deploy(overrides || {}) as Promise<CurveRouterCall>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CurveRouterCall {
    return super.attach(address) as CurveRouterCall;
  }
  override connect(signer: Signer): CurveRouterCall__factory {
    return super.connect(signer) as CurveRouterCall__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CurveRouterCallInterface {
    return new utils.Interface(_abi) as CurveRouterCallInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveRouterCall {
    return new Contract(address, _abi, signerOrProvider) as CurveRouterCall;
  }
}
