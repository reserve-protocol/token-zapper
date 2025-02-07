/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  FolioMintRedeem,
  FolioMintRedeemInterface,
} from "../../../contracts/weiroll-helpers/FolioMintRedeem";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IFolio",
        name: "folio",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IFolio",
        name: "folio",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610ec2806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80631e9a69501461003b5780636a62784214610057575b600080fd5b61005560048036038101906100509190610627565b610087565b005b610071600480360381019061006c9190610667565b6101e7565b60405161007e91906106a3565b60405180910390f35b6000808373ffffffffffffffffffffffffffffffffffffffff1663d17618bf670de0b6b3a764000060016040518363ffffffff1660e01b81526004016100ce92919061077a565b600060405180830381865afa1580156100eb573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906101149190610a00565b9150915060005b815181101561015857600082828151811061013957610138610a78565b5b602002602001018181525050808061015090610ad6565b91505061011b565b508373ffffffffffffffffffffffffffffffffffffffff1663b0384a0b843085856040518563ffffffff1660e01b81526004016101989493929190610ca9565b6000604051808303816000875af11580156101b7573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906101e09190610cfc565b5050505050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1663d17618bf670de0b6b3a764000060016040518363ffffffff1660e01b815260040161023092919061077a565b600060405180830381865afa15801561024d573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906102769190610a00565b9150915060006102868383610421565b905060008573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016102c39190610d45565b602060405180830381865afa1580156102e0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103049190610d60565b90508573ffffffffffffffffffffffffffffffffffffffff166394bf804d83306040518363ffffffff1660e01b8152600401610341929190610d8d565b6000604051808303816000875af1158015610360573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906103899190610a00565b505060008673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016103c69190610d45565b602060405180830381865afa1580156103e3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104079190610d60565b905081816104159190610db6565b95505050505050919050565b6000807fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff905060005b845181101561054957600085828151811061046857610467610a78565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016104a89190610d45565b602060405180830381865afa1580156104c5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104e99190610d60565b90506000858381518110610500576104ff610a78565b5b602002602001015190506105328482670de0b6b3a7640000856105239190610dea565b61052d9190610e5b565b610554565b93505050808061054190610ad6565b91505061044a565b508091505092915050565b60008183106105635781610565565b825b905092915050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006105ac82610581565b9050919050565b60006105be826105a1565b9050919050565b6105ce816105b3565b81146105d957600080fd5b50565b6000813590506105eb816105c5565b92915050565b6000819050919050565b610604816105f1565b811461060f57600080fd5b50565b600081359050610621816105fb565b92915050565b6000806040838503121561063e5761063d610577565b5b600061064c858286016105dc565b925050602061065d85828601610612565b9150509250929050565b60006020828403121561067d5761067c610577565b5b600061068b848285016105dc565b91505092915050565b61069d816105f1565b82525050565b60006020820190506106b86000830184610694565b92915050565b6000819050919050565b6000819050919050565b60006106ed6106e86106e3846106be565b6106c8565b6105f1565b9050919050565b6106fd816106d2565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6003811061074357610742610703565b5b50565b600081905061075482610732565b919050565b600061076482610746565b9050919050565b61077481610759565b82525050565b600060408201905061078f60008301856106f4565b61079c602083018461076b565b9392505050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6107f1826107a8565b810181811067ffffffffffffffff821117156108105761080f6107b9565b5b80604052505050565b600061082361056d565b905061082f82826107e8565b919050565b600067ffffffffffffffff82111561084f5761084e6107b9565b5b602082029050602081019050919050565b600080fd5b61086e816105a1565b811461087957600080fd5b50565b60008151905061088b81610865565b92915050565b60006108a461089f84610834565b610819565b905080838252602082019050602084028301858111156108c7576108c6610860565b5b835b818110156108f057806108dc888261087c565b8452602084019350506020810190506108c9565b5050509392505050565b600082601f83011261090f5761090e6107a3565b5b815161091f848260208601610891565b91505092915050565b600067ffffffffffffffff821115610943576109426107b9565b5b602082029050602081019050919050565b600081519050610963816105fb565b92915050565b600061097c61097784610928565b610819565b9050808382526020820190506020840283018581111561099f5761099e610860565b5b835b818110156109c857806109b48882610954565b8452602084019350506020810190506109a1565b5050509392505050565b600082601f8301126109e7576109e66107a3565b5b81516109f7848260208601610969565b91505092915050565b60008060408385031215610a1757610a16610577565b5b600083015167ffffffffffffffff811115610a3557610a3461057c565b5b610a41858286016108fa565b925050602083015167ffffffffffffffff811115610a6257610a6161057c565b5b610a6e858286016109d2565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610ae1826105f1565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610b1357610b12610aa7565b5b600182019050919050565b610b27816105a1565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610b62816105a1565b82525050565b6000610b748383610b59565b60208301905092915050565b6000602082019050919050565b6000610b9882610b2d565b610ba28185610b38565b9350610bad83610b49565b8060005b83811015610bde578151610bc58882610b68565b9750610bd083610b80565b925050600181019050610bb1565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610c20816105f1565b82525050565b6000610c328383610c17565b60208301905092915050565b6000602082019050919050565b6000610c5682610beb565b610c608185610bf6565b9350610c6b83610c07565b8060005b83811015610c9c578151610c838882610c26565b9750610c8e83610c3e565b925050600181019050610c6f565b5085935050505092915050565b6000608082019050610cbe6000830187610694565b610ccb6020830186610b1e565b8181036040830152610cdd8185610b8d565b90508181036060830152610cf18184610c4b565b905095945050505050565b600060208284031215610d1257610d11610577565b5b600082015167ffffffffffffffff811115610d3057610d2f61057c565b5b610d3c848285016109d2565b91505092915050565b6000602082019050610d5a6000830184610b1e565b92915050565b600060208284031215610d7657610d75610577565b5b6000610d8484828501610954565b91505092915050565b6000604082019050610da26000830185610694565b610daf6020830184610b1e565b9392505050565b6000610dc1826105f1565b9150610dcc836105f1565b9250828203905081811115610de457610de3610aa7565b5b92915050565b6000610df5826105f1565b9150610e00836105f1565b9250828202610e0e816105f1565b91508282048414831517610e2557610e24610aa7565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000610e66826105f1565b9150610e71836105f1565b925082610e8157610e80610e2c565b5b82820490509291505056fea26469706673582212203fce91dc46c42ee4e08a545d95b23abd01d522fdb6b1f30761e6b97169b2975064736f6c63430008110033";

type FolioMintRedeemConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FolioMintRedeemConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FolioMintRedeem__factory extends ContractFactory {
  constructor(...args: FolioMintRedeemConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<FolioMintRedeem> {
    return super.deploy(overrides || {}) as Promise<FolioMintRedeem>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FolioMintRedeem {
    return super.attach(address) as FolioMintRedeem;
  }
  override connect(signer: Signer): FolioMintRedeem__factory {
    return super.connect(signer) as FolioMintRedeem__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FolioMintRedeemInterface {
    return new utils.Interface(_abi) as FolioMintRedeemInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FolioMintRedeem {
    return new Contract(address, _abi, signerOrProvider) as FolioMintRedeem;
  }
}
