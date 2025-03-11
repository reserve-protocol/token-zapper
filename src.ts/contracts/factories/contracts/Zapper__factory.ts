/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { Zapper, ZapperInterface } from "../../contracts/Zapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IWrappedNative",
        name: "wrappedNative_",
        type: "address",
      },
      {
        internalType: "contract IPermit2",
        name: "permit2_",
        type: "address",
      },
      {
        internalType: "contract ZapperExecutor",
        name: "executor_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
    ],
    name: "zapERC20",
    outputs: [
      {
        components: [
          {
            internalType: "uint256[]",
            name: "dust",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gasUsed",
            type: "uint256",
          },
        ],
        internalType: "struct ZapperOutput",
        name: "out",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct TokenPermissions",
            name: "permitted",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct PermitTransferFrom",
        name: "permit",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "zapERC20WithPermit2",
    outputs: [
      {
        components: [
          {
            internalType: "uint256[]",
            name: "dust",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gasUsed",
            type: "uint256",
          },
        ],
        internalType: "struct ZapperOutput",
        name: "out",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "contract IERC20",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
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
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "contract IERC20",
            name: "tokenOut",
            type: "address",
          },
        ],
        internalType: "struct ZapERC20Params",
        name: "params",
        type: "tuple",
      },
    ],
    name: "zapETH",
    outputs: [
      {
        components: [
          {
            internalType: "uint256[]",
            name: "dust",
            type: "uint256[]",
          },
          {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gasUsed",
            type: "uint256",
          },
        ],
        internalType: "struct ZapperOutput",
        name: "out",
        type: "tuple",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60e06040523480156200001157600080fd5b506040516200232b3803806200232b833981810160405281019062000037919062000200565b60016000819055508273ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250508173ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff16815250508073ffffffffffffffffffffffffffffffffffffffff1660c08173ffffffffffffffffffffffffffffffffffffffff16815250505050506200025c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200011682620000e9565b9050919050565b60006200012a8262000109565b9050919050565b6200013c816200011d565b81146200014857600080fd5b50565b6000815190506200015c8162000131565b92915050565b60006200016f8262000109565b9050919050565b620001818162000162565b81146200018d57600080fd5b50565b600081519050620001a18162000176565b92915050565b6000620001b482620000e9565b9050919050565b6000620001c882620001a7565b9050919050565b620001da81620001bb565b8114620001e657600080fd5b50565b600081519050620001fa81620001cf565b92915050565b6000806000606084860312156200021c576200021b620000e4565b5b60006200022c868287016200014b565b93505060206200023f8682870162000190565b92505060406200025286828701620001e9565b9150509250925092565b60805160a05160c051612075620002b6600039600081816101aa0152818161042d015281816106060152610840015260006105be015260008181610218015281816103880152818161040c015261044e01526120756000f3fe6080604052600436106100385760003560e01c80638e0a8e9d14610044578063dd074ea014610081578063f78a9861146100b15761003f565b3661003f57005b600080fd5b34801561005057600080fd5b5061006b60048036038101906100669190610dd7565b6100ee565b6040516100789190610f38565b60405180910390f35b61009b60048036038101906100969190610dd7565b610201565b6040516100a89190610f38565b60405180910390f35b3480156100bd57600080fd5b506100d860048036038101906100d39190610fde565b610519565b6040516100e59190610f38565b60405180910390f35b6100f6610d7e565b6100fe6106ce565b60005a9050600083602001350361014a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610141906110cb565b60405180910390fd5b60008360a0013503610191576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161018890611137565b60405180910390fd5b6101d38360000160208101906101a791906111c7565b337f0000000000000000000000000000000000000000000000000000000000000000866020013561071d565b6101dc836107a6565b91505a816101ea9190611223565b826040018181525050506101fc610a5a565b919050565b610209610d7e565b6102116106ce565b60005a90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1683600001602081019061026091906111c7565b73ffffffffffffffffffffffffffffffffffffffff16146102b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102ad906112a3565b60405180910390fd5b348360200135146102fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102f3906110cb565b60405180910390fd5b6000340361033f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610336906110cb565b60405180910390fd5b60008360a0013503610386576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161037d90611137565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0346040518263ffffffff1660e01b81526004016000604051808303818588803b1580156103ee57600080fd5b505af1158015610402573d6000803e3d6000fd5b50505050506104eb7f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016104a591906112d2565b602060405180830381865afa1580156104c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104e69190611319565b610a64565b6104f4836107a6565b91505a816105029190611223565b82604001818152505050610514610a5a565b919050565b610521610d7e565b6105296106ce565b60005a90506000866020013503610575576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161056c906110cb565b60405180910390fd5b60008660a00135036105bc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105b390611137565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166330f28b7a8660405180604001604052807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020018a602001358152503388886040518663ffffffff1660e01b815260040161066b9594939291906114f5565b600060405180830381600087803b15801561068557600080fd5b505af1158015610699573d6000803e3d6000fd5b505050506106a6866107a6565b91505a816106b49190611223565b826040018181525050506106c6610a5a565b949350505050565b600260005403610713576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161070a90611590565b60405180910390fd5b6002600081905550565b6107a0846323b872dd60e01b85858560405160240161073e939291906115bf565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610aea565b50505050565b6107ae610d7e565b60008260c00160208101906107c391906111c7565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b81526004016107fb91906112d2565b602060405180830381865afa158015610818573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061083c9190611319565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166308c4b49884806040019061088a9190611605565b86806060019061089a9190611668565b8880608001906108aa91906116cb565b6040518763ffffffff1660e01b81526004016108cb96959493929190611a20565b6000604051808303816000875af11580156108ea573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906109139190611c12565b60000151826000018190525060008360c001602081019061093491906111c7565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b815260040161096c91906112d2565b602060405180830381865afa158015610989573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109ad9190611319565b90508181116109f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e890611ca7565b60405180910390fd5b600082826109ff9190611223565b90508460a00135811015610a48576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a3f90611d13565b60405180910390fd5b80846020018181525050505050919050565b6001600081905550565b610ae58363a9059cbb60e01b8484604051602401610a83929190611d33565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610aea565b505050565b6000610b4c826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610bb19092919063ffffffff16565b9050600081511115610bac5780806020019051810190610b6c9190611d94565b610bab576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ba290611e33565b60405180910390fd5b5b505050565b6060610bc08484600085610bc9565b90509392505050565b606082471015610c0e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c0590611ec5565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610c379190611f56565b60006040518083038185875af1925050503d8060008114610c74576040519150601f19603f3d011682016040523d82523d6000602084013e610c79565b606091505b5091509150610c8a87838387610c96565b92505050949350505050565b60608315610cf8576000835103610cf057610cb085610d0b565b610cef576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ce690611fb9565b60405180910390fd5b5b829050610d03565b610d028383610d2e565b5b949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600082511115610d415781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d75919061201d565b60405180910390fd5b60405180606001604052806060815260200160008152602001600081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600060e08284031215610dce57610dcd610db3565b5b81905092915050565b600060208284031215610ded57610dec610da9565b5b600082013567ffffffffffffffff811115610e0b57610e0a610dae565b5b610e1784828501610db8565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b610e5f81610e4c565b82525050565b6000610e718383610e56565b60208301905092915050565b6000602082019050919050565b6000610e9582610e20565b610e9f8185610e2b565b9350610eaa83610e3c565b8060005b83811015610edb578151610ec28882610e65565b9750610ecd83610e7d565b925050600181019050610eae565b5085935050505092915050565b60006060830160008301518482036000860152610f058282610e8a565b9150506020830151610f1a6020860182610e56565b506040830151610f2d6040860182610e56565b508091505092915050565b60006020820190508181036000830152610f528184610ee8565b905092915050565b600060808284031215610f7057610f6f610db3565b5b81905092915050565b600080fd5b600080fd5b600080fd5b60008083601f840112610f9e57610f9d610f79565b5b8235905067ffffffffffffffff811115610fbb57610fba610f7e565b5b602083019150836001820283011115610fd757610fd6610f83565b5b9250929050565b60008060008060c08587031215610ff857610ff7610da9565b5b600085013567ffffffffffffffff81111561101657611015610dae565b5b61102287828801610db8565b945050602061103387828801610f5a565b93505060a085013567ffffffffffffffff81111561105457611053610dae565b5b61106087828801610f88565b925092505092959194509250565b600082825260208201905092915050565b7f494e56414c49445f494e5055545f414d4f554e54000000000000000000000000600082015250565b60006110b560148361106e565b91506110c08261107f565b602082019050919050565b600060208201905081810360008301526110e4816110a8565b9050919050565b7f494e56414c49445f4f55545055545f414d4f554e540000000000000000000000600082015250565b600061112160158361106e565b915061112c826110eb565b602082019050919050565b6000602082019050818103600083015261115081611114565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061118282611157565b9050919050565b600061119482611177565b9050919050565b6111a481611189565b81146111af57600080fd5b50565b6000813590506111c18161119b565b92915050565b6000602082840312156111dd576111dc610da9565b5b60006111eb848285016111b2565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061122e82610e4c565b915061123983610e4c565b9250828203905081811115611251576112506111f4565b5b92915050565b7f494e56414c49445f494e5055545f544f4b454e00000000000000000000000000600082015250565b600061128d60138361106e565b915061129882611257565b602082019050919050565b600060208201905081810360008301526112bc81611280565b9050919050565b6112cc81611177565b82525050565b60006020820190506112e760008301846112c3565b92915050565b6112f681610e4c565b811461130157600080fd5b50565b600081519050611313816112ed565b92915050565b60006020828403121561132f5761132e610da9565b5b600061133d84828501611304565b91505092915050565b600082905092915050565b61135a81611177565b811461136557600080fd5b50565b60008135905061137781611351565b92915050565b600061138c6020840184611368565b905092915050565b61139d81611177565b82525050565b6000813590506113b2816112ed565b92915050565b60006113c760208401846113a3565b905092915050565b604082016113e0600083018361137d565b6113ed6000850182611394565b506113fb60208301836113b8565b6114086020850182610e56565b50505050565b6080820161141f6000830183611346565b61142c60008501826113cf565b5061143a60408301836113b8565b6114476040850182610e56565b5061145560608301836113b8565b6114626060850182610e56565b50505050565b60408201600082015161147e6000850182611394565b5060208201516114916020850182610e56565b50505050565b600082825260208201905092915050565b82818337600083830152505050565b6000601f19601f8301169050919050565b60006114d48385611497565b93506114e18385846114a8565b6114ea836114b7565b840190509392505050565b60006101008201905061150b600083018861140e565b6115186080830187611468565b61152560c08301866112c3565b81810360e08301526115388184866114c8565b90509695505050505050565b7f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00600082015250565b600061157a601f8361106e565b915061158582611544565b602082019050919050565b600060208201905081810360008301526115a98161156d565b9050919050565b6115b981610e4c565b82525050565b60006060820190506115d460008301866112c3565b6115e160208301856112c3565b6115ee60408301846115b0565b949350505050565b600080fd5b600080fd5b600080fd5b60008083356001602003843603038112611622576116216115f6565b5b80840192508235915067ffffffffffffffff821115611644576116436115fb565b5b6020830192506020820236038313156116605761165f611600565b5b509250929050565b60008083356001602003843603038112611685576116846115f6565b5b80840192508235915067ffffffffffffffff8211156116a7576116a66115fb565b5b6020830192506020820236038313156116c3576116c2611600565b5b509250929050565b600080833560016020038436030381126116e8576116e76115f6565b5b80840192508235915067ffffffffffffffff82111561170a576117096115fb565b5b60208301925060208202360383131561172657611725611600565b5b509250929050565b600082825260208201905092915050565b600080fd5b82818337505050565b6000611759838561172e565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561178c5761178b61173f565b5b60208302925061179d838584611744565b82840190509392505050565b600082825260208201905092915050565b6000819050919050565b600082825260208201905092915050565b60006117e183856117c4565b93506117ee8385846114a8565b6117f7836114b7565b840190509392505050565b600061180f8484846117d5565b90509392505050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261184457611843611822565b5b83810192508235915060208301925067ffffffffffffffff82111561186c5761186b611818565b5b6001820236038313156118825761188161181d565b5b509250929050565b6000602082019050919050565b60006118a383856117a9565b9350836020840285016118b5846117ba565b8060005b878110156118fb5784840389526118d08284611827565b6118db868284611802565b95506118e68461188a565b935060208b019a5050506001810190506118b9565b50829750879450505050509392505050565b600082825260208201905092915050565b6000819050919050565b6000819050919050565b600061194d61194861194384611157565b611928565b611157565b9050919050565b600061195f82611932565b9050919050565b600061197182611954565b9050919050565b61198181611966565b82525050565b60006119938383611978565b60208301905092915050565b60006119ae60208401846111b2565b905092915050565b6000602082019050919050565b60006119cf838561190d565b93506119da8261191e565b8060005b85811015611a13576119f0828461199f565b6119fa8882611987565b9750611a05836119b6565b9250506001810190506119de565b5085925050509392505050565b60006060820190508181036000830152611a3b81888a61174d565b90508181036020830152611a50818688611897565b90508181036040830152611a658184866119c3565b9050979650505050505050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611aaf826114b7565b810181811067ffffffffffffffff82111715611ace57611acd611a77565b5b80604052505050565b6000611ae1610d9f565b9050611aed8282611aa6565b919050565b600080fd5b600067ffffffffffffffff821115611b1257611b11611a77565b5b602082029050602081019050919050565b6000611b36611b3184611af7565b611ad7565b90508083825260208201905060208402830185811115611b5957611b58610f83565b5b835b81811015611b825780611b6e8882611304565b845260208401935050602081019050611b5b565b5050509392505050565b600082601f830112611ba157611ba0610f79565b5b8151611bb1848260208601611b23565b91505092915050565b600060208284031215611bd057611bcf611a72565b5b611bda6020611ad7565b9050600082015167ffffffffffffffff811115611bfa57611bf9611af2565b5b611c0684828501611b8c565b60008301525092915050565b600060208284031215611c2857611c27610da9565b5b600082015167ffffffffffffffff811115611c4657611c45610dae565b5b611c5284828501611bba565b91505092915050565b7f494e56414c49445f4e45575f42414c414e434500000000000000000000000000600082015250565b6000611c9160138361106e565b9150611c9c82611c5b565b602082019050919050565b60006020820190508181036000830152611cc081611c84565b9050919050565b7f494e53554646494349454e545f4f555400000000000000000000000000000000600082015250565b6000611cfd60108361106e565b9150611d0882611cc7565b602082019050919050565b60006020820190508181036000830152611d2c81611cf0565b9050919050565b6000604082019050611d4860008301856112c3565b611d5560208301846115b0565b9392505050565b60008115159050919050565b611d7181611d5c565b8114611d7c57600080fd5b50565b600081519050611d8e81611d68565b92915050565b600060208284031215611daa57611da9610da9565b5b6000611db884828501611d7f565b91505092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b6000611e1d602a8361106e565b9150611e2882611dc1565b604082019050919050565b60006020820190508181036000830152611e4c81611e10565b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b6000611eaf60268361106e565b9150611eba82611e53565b604082019050919050565b60006020820190508181036000830152611ede81611ea2565b9050919050565b600081519050919050565b600081905092915050565b60005b83811015611f19578082015181840152602081019050611efe565b60008484015250505050565b6000611f3082611ee5565b611f3a8185611ef0565b9350611f4a818560208601611efb565b80840191505092915050565b6000611f628284611f25565b915081905092915050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b6000611fa3601d8361106e565b9150611fae82611f6d565b602082019050919050565b60006020820190508181036000830152611fd281611f96565b9050919050565b600081519050919050565b6000611fef82611fd9565b611ff9818561106e565b9350612009818560208601611efb565b612012816114b7565b840191505092915050565b600060208201905081810360008301526120378184611fe4565b90509291505056fea264697066735822122064686df31b8aca615f0a0830e4f115f22b6efd4f9917d89473971670b57b16fe64736f6c63430008110033";

type ZapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ZapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Zapper__factory extends ContractFactory {
  constructor(...args: ZapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    wrappedNative_: PromiseOrValue<string>,
    permit2_: PromiseOrValue<string>,
    executor_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Zapper> {
    return super.deploy(
      wrappedNative_,
      permit2_,
      executor_,
      overrides || {}
    ) as Promise<Zapper>;
  }
  override getDeployTransaction(
    wrappedNative_: PromiseOrValue<string>,
    permit2_: PromiseOrValue<string>,
    executor_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      wrappedNative_,
      permit2_,
      executor_,
      overrides || {}
    );
  }
  override attach(address: string): Zapper {
    return super.attach(address) as Zapper;
  }
  override connect(signer: Signer): Zapper__factory {
    return super.connect(signer) as Zapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZapperInterface {
    return new utils.Interface(_abi) as ZapperInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Zapper {
    return new Contract(address, _abi, signerOrProvider) as Zapper;
  }
}
