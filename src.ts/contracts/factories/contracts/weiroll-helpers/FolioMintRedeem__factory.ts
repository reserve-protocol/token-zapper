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
  "0x608060405234801561001057600080fd5b50610d3d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80631e9a69501461003b5780636a62784214610057575b600080fd5b610055600480360381019061005091906105c9565b610087565b005b610071600480360381019061006c9190610609565b6101d1565b60405161007e9190610645565b60405180910390f35b6000808373ffffffffffffffffffffffffffffffffffffffff1663647bec256040518163ffffffff1660e01b8152600401600060405180830381865afa1580156100d5573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906100fe91906108bd565b9150915060005b825181101561014257600082828151811061012357610122610935565b5b602002602001018181525050808061013a90610993565b915050610105565b508373ffffffffffffffffffffffffffffffffffffffff1663b0384a0b843085856040518563ffffffff1660e01b81526004016101829493929190610b66565b6000604051808303816000875af11580156101a1573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906101ca9190610bb9565b5050505050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1663647bec256040518163ffffffff1660e01b8152600401600060405180830381865afa158015610221573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525081019061024a91906108bd565b91509150600061025a83836103f5565b905060008573ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016102979190610c02565b602060405180830381865afa1580156102b4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102d89190610c1d565b90508573ffffffffffffffffffffffffffffffffffffffff166394bf804d83306040518363ffffffff1660e01b8152600401610315929190610c4a565b6000604051808303816000875af1158015610334573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525081019061035d91906108bd565b505060008673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161039a9190610c02565b602060405180830381865afa1580156103b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103db9190610c1d565b905081816103e99190610c73565b95505050505050919050565b6000806000905060005b84518110156104eb57600085828151811061041d5761041c610935565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161045d9190610c02565b602060405180830381865afa15801561047a573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061049e9190610c1d565b905060008583815181106104b5576104b4610935565b5b602002602001015190506104d48482846104cf9190610cd6565b6104f6565b9350505080806104e390610993565b9150506103ff565b508091505092915050565b60008183116105055781610507565b825b905092915050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061054e82610523565b9050919050565b600061056082610543565b9050919050565b61057081610555565b811461057b57600080fd5b50565b60008135905061058d81610567565b92915050565b6000819050919050565b6105a681610593565b81146105b157600080fd5b50565b6000813590506105c38161059d565b92915050565b600080604083850312156105e0576105df610519565b5b60006105ee8582860161057e565b92505060206105ff858286016105b4565b9150509250929050565b60006020828403121561061f5761061e610519565b5b600061062d8482850161057e565b91505092915050565b61063f81610593565b82525050565b600060208201905061065a6000830184610636565b92915050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6106ae82610665565b810181811067ffffffffffffffff821117156106cd576106cc610676565b5b80604052505050565b60006106e061050f565b90506106ec82826106a5565b919050565b600067ffffffffffffffff82111561070c5761070b610676565b5b602082029050602081019050919050565b600080fd5b61072b81610543565b811461073657600080fd5b50565b60008151905061074881610722565b92915050565b600061076161075c846106f1565b6106d6565b905080838252602082019050602084028301858111156107845761078361071d565b5b835b818110156107ad57806107998882610739565b845260208401935050602081019050610786565b5050509392505050565b600082601f8301126107cc576107cb610660565b5b81516107dc84826020860161074e565b91505092915050565b600067ffffffffffffffff821115610800576107ff610676565b5b602082029050602081019050919050565b6000815190506108208161059d565b92915050565b6000610839610834846107e5565b6106d6565b9050808382526020820190506020840283018581111561085c5761085b61071d565b5b835b8181101561088557806108718882610811565b84526020840193505060208101905061085e565b5050509392505050565b600082601f8301126108a4576108a3610660565b5b81516108b4848260208601610826565b91505092915050565b600080604083850312156108d4576108d3610519565b5b600083015167ffffffffffffffff8111156108f2576108f161051e565b5b6108fe858286016107b7565b925050602083015167ffffffffffffffff81111561091f5761091e61051e565b5b61092b8582860161088f565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061099e82610593565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036109d0576109cf610964565b5b600182019050919050565b6109e481610543565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610a1f81610543565b82525050565b6000610a318383610a16565b60208301905092915050565b6000602082019050919050565b6000610a55826109ea565b610a5f81856109f5565b9350610a6a83610a06565b8060005b83811015610a9b578151610a828882610a25565b9750610a8d83610a3d565b925050600181019050610a6e565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610add81610593565b82525050565b6000610aef8383610ad4565b60208301905092915050565b6000602082019050919050565b6000610b1382610aa8565b610b1d8185610ab3565b9350610b2883610ac4565b8060005b83811015610b59578151610b408882610ae3565b9750610b4b83610afb565b925050600181019050610b2c565b5085935050505092915050565b6000608082019050610b7b6000830187610636565b610b8860208301866109db565b8181036040830152610b9a8185610a4a565b90508181036060830152610bae8184610b08565b905095945050505050565b600060208284031215610bcf57610bce610519565b5b600082015167ffffffffffffffff811115610bed57610bec61051e565b5b610bf98482850161088f565b91505092915050565b6000602082019050610c1760008301846109db565b92915050565b600060208284031215610c3357610c32610519565b5b6000610c4184828501610811565b91505092915050565b6000604082019050610c5f6000830185610636565b610c6c60208301846109db565b9392505050565b6000610c7e82610593565b9150610c8983610593565b9250828203905081811115610ca157610ca0610964565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000610ce182610593565b9150610cec83610593565b925082610cfc57610cfb610ca7565b5b82820490509291505056fea2646970667358221220a78383dbeea1b50367bb64707408ed217fc24224a7e4c8f7a8696b5da665144764736f6c63430008110033";

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
