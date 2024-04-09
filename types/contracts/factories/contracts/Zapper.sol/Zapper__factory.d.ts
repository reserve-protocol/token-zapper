import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Zapper, ZapperInterface } from "../../../contracts/Zapper.sol/Zapper";
type ZapperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Zapper__factory extends ContractFactory {
    constructor(...args: ZapperConstructorParams);
    deploy(wrappedNative_: PromiseOrValue<string>, permit2_: PromiseOrValue<string>, executor_: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<Zapper>;
    getDeployTransaction(wrappedNative_: PromiseOrValue<string>, permit2_: PromiseOrValue<string>, executor_: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): Zapper;
    connect(signer: Signer): Zapper__factory;
    static readonly bytecode = "0x60e06040523480156200001157600080fd5b506040516200242b3803806200242b833981810160405281019062000037919062000200565b60016000819055508273ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250508173ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff16815250508073ffffffffffffffffffffffffffffffffffffffff1660c08173ffffffffffffffffffffffffffffffffffffffff16815250505050506200025c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200011682620000e9565b9050919050565b60006200012a8262000109565b9050919050565b6200013c816200011d565b81146200014857600080fd5b50565b6000815190506200015c8162000131565b92915050565b60006200016f8262000109565b9050919050565b620001818162000162565b81146200018d57600080fd5b50565b600081519050620001a18162000176565b92915050565b6000620001b482620000e9565b9050919050565b6000620001c882620001a7565b9050919050565b620001da81620001bb565b8114620001e657600080fd5b50565b600081519050620001fa81620001cf565b92915050565b6000806000606084860312156200021c576200021b620000e4565b5b60006200022c868287016200014b565b93505060206200023f8682870162000190565b92505060406200025286828701620001e9565b9150509250925092565b60805160a05160c05161216f620002bc60003960008181610238015281816104bb0152818161069401526108ce0152600061064c015260008181603f015281816102a6015281816104160152818161049a01526104dc015261216f6000f3fe6080604052600436106100385760003560e01c80638e0a8e9d146100d2578063dd074ea01461010f578063f78a98611461013f576100cd565b366100cd577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146100cb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100c290610e8a565b60405180910390fd5b005b600080fd5b3480156100de57600080fd5b506100f960048036038101906100f49190610ee2565b61017c565b6040516101069190611043565b60405180910390f35b61012960048036038101906101249190610ee2565b61028f565b6040516101369190611043565b60405180910390f35b34801561014b57600080fd5b50610166600480360381019061016191906110e9565b6105a7565b6040516101739190611043565b60405180910390f35b610184610e0c565b61018c61075c565b60005a905060008360200135036101d8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101cf906111c5565b60405180910390fd5b60008360a001350361021f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161021690611231565b60405180910390fd5b61026183600001602081019061023591906112c1565b337f000000000000000000000000000000000000000000000000000000000000000086602001356107ab565b61026a83610834565b91505a81610278919061131d565b8260400181815250505061028a610ae8565b919050565b610297610e0c565b61029f61075c565b60005a90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168360000160208101906102ee91906112c1565b73ffffffffffffffffffffffffffffffffffffffff1614610344576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161033b9061139d565b60405180910390fd5b3483602001351461038a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610381906111c5565b60405180910390fd5b600034036103cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103c4906111c5565b60405180910390fd5b60008360a0013503610414576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161040b90611231565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0346040518263ffffffff1660e01b81526004016000604051808303818588803b15801561047c57600080fd5b505af1158015610490573d6000803e3d6000fd5b50505050506105797f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161053391906113cc565b602060405180830381865afa158015610550573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105749190611413565b610af2565b61058283610834565b91505a81610590919061131d565b826040018181525050506105a2610ae8565b919050565b6105af610e0c565b6105b761075c565b60005a90506000866020013503610603576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105fa906111c5565b60405180910390fd5b60008660a001350361064a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064190611231565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166330f28b7a8660405180604001604052807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020018a602001358152503388886040518663ffffffff1660e01b81526004016106f99594939291906115ef565b600060405180830381600087803b15801561071357600080fd5b505af1158015610727573d6000803e3d6000fd5b5050505061073486610834565b91505a81610742919061131d565b82604001818152505050610754610ae8565b949350505050565b6002600054036107a1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107989061168a565b60405180910390fd5b6002600081905550565b61082e846323b872dd60e01b8585856040516024016107cc939291906116b9565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610b78565b50505050565b61083c610e0c565b60008260c001602081019061085191906112c1565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b815260040161088991906113cc565b602060405180830381865afa1580156108a6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108ca9190611413565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166308c4b49884806040019061091891906116ff565b8680606001906109289190611762565b88806080019061093891906117c5565b6040518763ffffffff1660e01b815260040161095996959493929190611b1a565b6000604051808303816000875af1158015610978573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906109a19190611d0c565b60000151826000018190525060008360c00160208101906109c291906112c1565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b81526004016109fa91906113cc565b602060405180830381865afa158015610a17573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3b9190611413565b9050818111610a7f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a7690611da1565b60405180910390fd5b60008282610a8d919061131d565b90508460a00135811015610ad6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610acd90611e0d565b60405180910390fd5b80846020018181525050505050919050565b6001600081905550565b610b738363a9059cbb60e01b8484604051602401610b11929190611e2d565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610b78565b505050565b6000610bda826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610c3f9092919063ffffffff16565b9050600081511115610c3a5780806020019051810190610bfa9190611e8e565b610c39576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c3090611f2d565b60405180910390fd5b5b505050565b6060610c4e8484600085610c57565b90509392505050565b606082471015610c9c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c9390611fbf565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610cc59190612050565b60006040518083038185875af1925050503d8060008114610d02576040519150601f19603f3d011682016040523d82523d6000602084013e610d07565b606091505b5091509150610d1887838387610d24565b92505050949350505050565b60608315610d86576000835103610d7e57610d3e85610d99565b610d7d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d74906120b3565b60405180910390fd5b5b829050610d91565b610d908383610dbc565b5b949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600082511115610dcf5781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e039190612117565b60405180910390fd5b60405180606001604052806060815260200160008152602001600081525090565b600082825260208201905092915050565b7f494e56414c49445f43414c4c4552000000000000000000000000000000000000600082015250565b6000610e74600e83610e2d565b9150610e7f82610e3e565b602082019050919050565b60006020820190508181036000830152610ea381610e67565b9050919050565b6000604051905090565b600080fd5b600080fd5b600080fd5b600060e08284031215610ed957610ed8610ebe565b5b81905092915050565b600060208284031215610ef857610ef7610eb4565b5b600082013567ffffffffffffffff811115610f1657610f15610eb9565b5b610f2284828501610ec3565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b610f6a81610f57565b82525050565b6000610f7c8383610f61565b60208301905092915050565b6000602082019050919050565b6000610fa082610f2b565b610faa8185610f36565b9350610fb583610f47565b8060005b83811015610fe6578151610fcd8882610f70565b9750610fd883610f88565b925050600181019050610fb9565b5085935050505092915050565b600060608301600083015184820360008601526110108282610f95565b91505060208301516110256020860182610f61565b5060408301516110386040860182610f61565b508091505092915050565b6000602082019050818103600083015261105d8184610ff3565b905092915050565b60006080828403121561107b5761107a610ebe565b5b81905092915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126110a9576110a8611084565b5b8235905067ffffffffffffffff8111156110c6576110c5611089565b5b6020830191508360018202830111156110e2576110e161108e565b5b9250929050565b60008060008060c0858703121561110357611102610eb4565b5b600085013567ffffffffffffffff81111561112157611120610eb9565b5b61112d87828801610ec3565b945050602061113e87828801611065565b93505060a085013567ffffffffffffffff81111561115f5761115e610eb9565b5b61116b87828801611093565b925092505092959194509250565b7f494e56414c49445f494e5055545f414d4f554e54000000000000000000000000600082015250565b60006111af601483610e2d565b91506111ba82611179565b602082019050919050565b600060208201905081810360008301526111de816111a2565b9050919050565b7f494e56414c49445f4f55545055545f414d4f554e540000000000000000000000600082015250565b600061121b601583610e2d565b9150611226826111e5565b602082019050919050565b6000602082019050818103600083015261124a8161120e565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061127c82611251565b9050919050565b600061128e82611271565b9050919050565b61129e81611283565b81146112a957600080fd5b50565b6000813590506112bb81611295565b92915050565b6000602082840312156112d7576112d6610eb4565b5b60006112e5848285016112ac565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061132882610f57565b915061133383610f57565b925082820390508181111561134b5761134a6112ee565b5b92915050565b7f494e56414c49445f494e5055545f544f4b454e00000000000000000000000000600082015250565b6000611387601383610e2d565b915061139282611351565b602082019050919050565b600060208201905081810360008301526113b68161137a565b9050919050565b6113c681611271565b82525050565b60006020820190506113e160008301846113bd565b92915050565b6113f081610f57565b81146113fb57600080fd5b50565b60008151905061140d816113e7565b92915050565b60006020828403121561142957611428610eb4565b5b6000611437848285016113fe565b91505092915050565b600082905092915050565b61145481611271565b811461145f57600080fd5b50565b6000813590506114718161144b565b92915050565b60006114866020840184611462565b905092915050565b61149781611271565b82525050565b6000813590506114ac816113e7565b92915050565b60006114c1602084018461149d565b905092915050565b604082016114da6000830183611477565b6114e7600085018261148e565b506114f560208301836114b2565b6115026020850182610f61565b50505050565b608082016115196000830183611440565b61152660008501826114c9565b5061153460408301836114b2565b6115416040850182610f61565b5061154f60608301836114b2565b61155c6060850182610f61565b50505050565b604082016000820151611578600085018261148e565b50602082015161158b6020850182610f61565b50505050565b600082825260208201905092915050565b82818337600083830152505050565b6000601f19601f8301169050919050565b60006115ce8385611591565b93506115db8385846115a2565b6115e4836115b1565b840190509392505050565b6000610100820190506116056000830188611508565b6116126080830187611562565b61161f60c08301866113bd565b81810360e08301526116328184866115c2565b90509695505050505050565b7f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00600082015250565b6000611674601f83610e2d565b915061167f8261163e565b602082019050919050565b600060208201905081810360008301526116a381611667565b9050919050565b6116b381610f57565b82525050565b60006060820190506116ce60008301866113bd565b6116db60208301856113bd565b6116e860408301846116aa565b949350505050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261171c5761171b6116f0565b5b80840192508235915067ffffffffffffffff82111561173e5761173d6116f5565b5b60208301925060208202360383131561175a576117596116fa565b5b509250929050565b6000808335600160200384360303811261177f5761177e6116f0565b5b80840192508235915067ffffffffffffffff8211156117a1576117a06116f5565b5b6020830192506020820236038313156117bd576117bc6116fa565b5b509250929050565b600080833560016020038436030381126117e2576117e16116f0565b5b80840192508235915067ffffffffffffffff821115611804576118036116f5565b5b6020830192506020820236038313156118205761181f6116fa565b5b509250929050565b600082825260208201905092915050565b600080fd5b82818337505050565b60006118538385611828565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83111561188657611885611839565b5b60208302925061189783858461183e565b82840190509392505050565b600082825260208201905092915050565b6000819050919050565b600082825260208201905092915050565b60006118db83856118be565b93506118e88385846115a2565b6118f1836115b1565b840190509392505050565b60006119098484846118cf565b90509392505050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261193e5761193d61191c565b5b83810192508235915060208301925067ffffffffffffffff82111561196657611965611912565b5b60018202360383131561197c5761197b611917565b5b509250929050565b6000602082019050919050565b600061199d83856118a3565b9350836020840285016119af846118b4565b8060005b878110156119f55784840389526119ca8284611921565b6119d58682846118fc565b95506119e084611984565b935060208b019a5050506001810190506119b3565b50829750879450505050509392505050565b600082825260208201905092915050565b6000819050919050565b6000819050919050565b6000611a47611a42611a3d84611251565b611a22565b611251565b9050919050565b6000611a5982611a2c565b9050919050565b6000611a6b82611a4e565b9050919050565b611a7b81611a60565b82525050565b6000611a8d8383611a72565b60208301905092915050565b6000611aa860208401846112ac565b905092915050565b6000602082019050919050565b6000611ac98385611a07565b9350611ad482611a18565b8060005b85811015611b0d57611aea8284611a99565b611af48882611a81565b9750611aff83611ab0565b925050600181019050611ad8565b5085925050509392505050565b60006060820190508181036000830152611b3581888a611847565b90508181036020830152611b4a818688611991565b90508181036040830152611b5f818486611abd565b9050979650505050505050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611ba9826115b1565b810181811067ffffffffffffffff82111715611bc857611bc7611b71565b5b80604052505050565b6000611bdb610eaa565b9050611be78282611ba0565b919050565b600080fd5b600067ffffffffffffffff821115611c0c57611c0b611b71565b5b602082029050602081019050919050565b6000611c30611c2b84611bf1565b611bd1565b90508083825260208201905060208402830185811115611c5357611c5261108e565b5b835b81811015611c7c5780611c6888826113fe565b845260208401935050602081019050611c55565b5050509392505050565b600082601f830112611c9b57611c9a611084565b5b8151611cab848260208601611c1d565b91505092915050565b600060208284031215611cca57611cc9611b6c565b5b611cd46020611bd1565b9050600082015167ffffffffffffffff811115611cf457611cf3611bec565b5b611d0084828501611c86565b60008301525092915050565b600060208284031215611d2257611d21610eb4565b5b600082015167ffffffffffffffff811115611d4057611d3f610eb9565b5b611d4c84828501611cb4565b91505092915050565b7f494e56414c49445f4e45575f42414c414e434500000000000000000000000000600082015250565b6000611d8b601383610e2d565b9150611d9682611d55565b602082019050919050565b60006020820190508181036000830152611dba81611d7e565b9050919050565b7f494e53554646494349454e545f4f555400000000000000000000000000000000600082015250565b6000611df7601083610e2d565b9150611e0282611dc1565b602082019050919050565b60006020820190508181036000830152611e2681611dea565b9050919050565b6000604082019050611e4260008301856113bd565b611e4f60208301846116aa565b9392505050565b60008115159050919050565b611e6b81611e56565b8114611e7657600080fd5b50565b600081519050611e8881611e62565b92915050565b600060208284031215611ea457611ea3610eb4565b5b6000611eb284828501611e79565b91505092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b6000611f17602a83610e2d565b9150611f2282611ebb565b604082019050919050565b60006020820190508181036000830152611f4681611f0a565b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b6000611fa9602683610e2d565b9150611fb482611f4d565b604082019050919050565b60006020820190508181036000830152611fd881611f9c565b9050919050565b600081519050919050565b600081905092915050565b60005b83811015612013578082015181840152602081019050611ff8565b60008484015250505050565b600061202a82611fdf565b6120348185611fea565b9350612044818560208601611ff5565b80840191505092915050565b600061205c828461201f565b915081905092915050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b600061209d601d83610e2d565b91506120a882612067565b602082019050919050565b600060208201905081810360008301526120cc81612090565b9050919050565b600081519050919050565b60006120e9826120d3565b6120f38185610e2d565b9350612103818560208601611ff5565b61210c816115b1565b840191505092915050565b6000602082019050818103600083015261213181846120de565b90509291505056fea2646970667358221220e7dfe8d395aea61c824382b25fc2d27549726bec9a45656e64daaa015318948964736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IWrappedNative";
            readonly name: "wrappedNative_";
            readonly type: "address";
        }, {
            readonly internalType: "contract IPermit2";
            readonly name: "permit2_";
            readonly type: "address";
        }, {
            readonly internalType: "contract ZapperExecutor";
            readonly name: "executor_";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
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
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly name: "zapERC20";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "dust";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "gasUsed";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ZapperOutput";
            readonly name: "out";
            readonly type: "tuple";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
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
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct TokenPermissions";
                readonly name: "permitted";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "deadline";
                readonly type: "uint256";
            }];
            readonly internalType: "struct PermitTransferFrom";
            readonly name: "permit";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly name: "zapERC20WithPermit2";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "dust";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "gasUsed";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ZapperOutput";
            readonly name: "out";
            readonly type: "tuple";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "contract IERC20";
                readonly name: "tokenIn";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountIn";
                readonly type: "uint256";
            }, {
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
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "contract IERC20";
                readonly name: "tokenOut";
                readonly type: "address";
            }];
            readonly internalType: "struct ZapERC20Params";
            readonly name: "params";
            readonly type: "tuple";
        }];
        readonly name: "zapETH";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "dust";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "uint256";
                readonly name: "amountOut";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "gasUsed";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ZapperOutput";
            readonly name: "out";
            readonly type: "tuple";
        }];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): ZapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Zapper;
}
export {};
//# sourceMappingURL=Zapper__factory.d.ts.map