/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  CurveStableSwapNGHelper,
  CurveStableSwapNGHelperInterface,
} from "../../../../contracts/weiroll-helpers/Curvepools.sol/CurveStableSwapNGHelper";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "coinIdx",
        type: "uint256",
      },
      {
        internalType: "contract ICurveStableSwapNG",
        name: "pool",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
    ],
    name: "addliquidity",
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
  "0x608060405234801561001057600080fd5b506104c5806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063349f150214610030575b600080fd5b61004a60048036038101906100459190610270565b610060565b60405161005791906102e6565b60405180910390f35b6000808373ffffffffffffffffffffffffffffffffffffffff1663293577506040518163ffffffff1660e01b8152600401602060405180830381865afa1580156100ae573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100d29190610316565b67ffffffffffffffff8111156100eb576100ea610343565b5b6040519080825280602002602001820160405280156101195781602001602082028036833780820191505090505b509050858186815181106101305761012f610372565b5b6020026020010181815250508373ffffffffffffffffffffffffffffffffffffffff1663b72df5de82856040518363ffffffff1660e01b815260040161017792919061045f565b6020604051808303816000875af1158015610196573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101ba9190610316565b915050949350505050565b600080fd5b6000819050919050565b6101dd816101ca565b81146101e857600080fd5b50565b6000813590506101fa816101d4565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061022b82610200565b9050919050565b600061023d82610220565b9050919050565b61024d81610232565b811461025857600080fd5b50565b60008135905061026a81610244565b92915050565b6000806000806080858703121561028a576102896101c5565b5b6000610298878288016101eb565b94505060206102a9878288016101eb565b93505060406102ba8782880161025b565b92505060606102cb878288016101eb565b91505092959194509250565b6102e0816101ca565b82525050565b60006020820190506102fb60008301846102d7565b92915050565b600081519050610310816101d4565b92915050565b60006020828403121561032c5761032b6101c5565b5b600061033a84828501610301565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6103d6816101ca565b82525050565b60006103e883836103cd565b60208301905092915050565b6000602082019050919050565b600061040c826103a1565b61041681856103ac565b9350610421836103bd565b8060005b8381101561045257815161043988826103dc565b9750610444836103f4565b925050600181019050610425565b5085935050505092915050565b600060408201905081810360008301526104798185610401565b905061048860208301846102d7565b939250505056fea264697066735822122070550ec7e756c5045cd6f4d165a34eb3761dd5a96727d4e786d4bdb6671f862564736f6c63430008110033";

type CurveStableSwapNGHelperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CurveStableSwapNGHelperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class CurveStableSwapNGHelper__factory extends ContractFactory {
  constructor(...args: CurveStableSwapNGHelperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<CurveStableSwapNGHelper> {
    return super.deploy(overrides || {}) as Promise<CurveStableSwapNGHelper>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): CurveStableSwapNGHelper {
    return super.attach(address) as CurveStableSwapNGHelper;
  }
  override connect(signer: Signer): CurveStableSwapNGHelper__factory {
    return super.connect(signer) as CurveStableSwapNGHelper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CurveStableSwapNGHelperInterface {
    return new utils.Interface(_abi) as CurveStableSwapNGHelperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CurveStableSwapNGHelper {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as CurveStableSwapNGHelper;
  }
}
