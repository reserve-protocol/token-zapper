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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610a26806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c806309d4802a14610030575b600080fd5b61004a600480360381019061004591906102ff565b610060565b6040516100579190610391565b60405180910390f35b6000806000808480602001905181019061007a919061069f565b9250925092508573ffffffffffffffffffffffffffffffffffffffff16639db4f7aa84848b8b866040518663ffffffff1660e01b81526004016100c195949392919061096b565b6020604051808303816000875af11580156100e0573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061010491906109c3565b9350505050949350505050565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61013881610125565b811461014357600080fd5b50565b6000813590506101558161012f565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101868261015b565b9050919050565b6101968161017b565b81146101a157600080fd5b50565b6000813590506101b38161018d565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61020c826101c3565b810181811067ffffffffffffffff8211171561022b5761022a6101d4565b5b80604052505050565b600061023e610111565b905061024a8282610203565b919050565b600067ffffffffffffffff82111561026a576102696101d4565b5b610273826101c3565b9050602081019050919050565b82818337600083830152505050565b60006102a261029d8461024f565b610234565b9050828152602081018484840111156102be576102bd6101be565b5b6102c9848285610280565b509392505050565b600082601f8301126102e6576102e56101b9565b5b81356102f684826020860161028f565b91505092915050565b600080600080608085870312156103195761031861011b565b5b600061032787828801610146565b945050602061033887828801610146565b9350506040610349878288016101a4565b925050606085013567ffffffffffffffff81111561036a57610369610120565b5b610376878288016102d1565b91505092959194509250565b61038b81610125565b82525050565b60006020820190506103a66000830184610382565b92915050565b600067ffffffffffffffff8211156103c7576103c66101d4565b5b602082029050919050565b600080fd5b6000815190506103e68161018d565b92915050565b60006103ff6103fa846103ac565b610234565b90508060208402830185811115610419576104186103d2565b5b835b81811015610442578061042e88826103d7565b84526020840193505060208101905061041b565b5050509392505050565b600082601f830112610461576104606101b9565b5b600961046e8482856103ec565b91505092915050565b600067ffffffffffffffff821115610492576104916101d4565b5b602082029050919050565b600067ffffffffffffffff8211156104b8576104b76101d4565b5b602082029050919050565b6000815190506104d28161012f565b92915050565b60006104eb6104e68461049d565b610234565b90508060208402830185811115610505576105046103d2565b5b835b8181101561052e578061051a88826104c3565b845260208401935050602081019050610507565b5050509392505050565b600082601f83011261054d5761054c6101b9565b5b600361055a8482856104d8565b91505092915050565b600061057661057184610477565b610234565b905080606084028301858111156105905761058f6103d2565b5b835b818110156105b957806105a58882610538565b845260208401935050606081019050610592565b5050509392505050565b600082601f8301126105d8576105d76101b9565b5b60046105e5848285610563565b91505092915050565b600067ffffffffffffffff821115610609576106086101d4565b5b602082029050919050565b6000610627610622846105ee565b610234565b90508060208402830185811115610641576106406103d2565b5b835b8181101561066a578061065688826103d7565b845260208401935050602081019050610643565b5050509392505050565b600082601f830112610689576106886101b9565b5b6004610696848285610614565b91505092915050565b600080600061032084860312156106b9576106b861011b565b5b60006106c78682870161044c565b9350506101206106d9868287016105c3565b9250506102a06106eb86828701610674565b9150509250925092565b600060099050919050565b600081905092915050565b6000819050919050565b61071e8161017b565b82525050565b60006107308383610715565b60208301905092915050565b6000602082019050919050565b610752816106f5565b61075c8184610700565b92506107678261070b565b8060005b8381101561079857815161077f8782610724565b965061078a8361073c565b92505060018101905061076b565b505050505050565b600060049050919050565b600081905092915050565b6000819050919050565b600060039050919050565b600081905092915050565b6000819050919050565b6107e981610125565b82525050565b60006107fb83836107e0565b60208301905092915050565b6000602082019050919050565b61081d816107c0565b61082781846107cb565b9250610832826107d6565b8060005b8381101561086357815161084a87826107ef565b965061085583610807565b925050600181019050610836565b505050505050565b60006108778383610814565b60608301905092915050565b6000602082019050919050565b610899816107a0565b6108a381846107ab565b92506108ae826107b6565b8060005b838110156108df5781516108c6878261086b565b96506108d183610883565b9250506001810190506108b2565b505050505050565b600060049050919050565b600081905092915050565b6000819050919050565b6000602082019050919050565b61091d816108e7565b61092781846108f2565b9250610932826108fd565b8060005b8381101561096357815161094a8782610724565b965061095583610907565b925050600181019050610936565b505050505050565b6000610360820190506109816000830188610749565b61098f610120830187610890565b61099d6102a0830186610382565b6109ab6102c0830185610382565b6109b96102e0830184610914565b9695505050505050565b6000602082840312156109d9576109d861011b565b5b60006109e7848285016104c3565b9150509291505056fea2646970667358221220a7bf69e353f8b92870480815bec3cd0aa51cc7afacc9b06c7ad3fe3f80228a7e64736f6c63430008110033";

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
