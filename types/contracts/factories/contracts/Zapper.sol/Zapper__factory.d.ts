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
    static readonly bytecode = "0x60e06040523480156200001157600080fd5b506040516200248038038062002480833981810160405281019062000037919062000200565b60016000819055508273ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250508173ffffffffffffffffffffffffffffffffffffffff1660a08173ffffffffffffffffffffffffffffffffffffffff16815250508073ffffffffffffffffffffffffffffffffffffffff1660c08173ffffffffffffffffffffffffffffffffffffffff16815250505050506200025c565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200011682620000e9565b9050919050565b60006200012a8262000109565b9050919050565b6200013c816200011d565b81146200014857600080fd5b50565b6000815190506200015c8162000131565b92915050565b60006200016f8262000109565b9050919050565b620001818162000162565b81146200018d57600080fd5b50565b600081519050620001a18162000176565b92915050565b6000620001b482620000e9565b9050919050565b6000620001c882620001a7565b9050919050565b620001da81620001bb565b8114620001e657600080fd5b50565b600081519050620001fa81620001cf565b92915050565b6000806000606084860312156200021c576200021b620000e4565b5b60006200022c868287016200014b565b93505060206200023f8682870162000190565b92505060406200025286828701620001e9565b9150509250925092565b60805160a05160c0516121c3620002bd600039600081816101e5015281816102f80152818161057b01528181610754015261098e0152600061070c015260008181610366015281816104d60152818161055a015261059c01526121c36000f3fe6080604052600436106100435760003560e01c80638e0a8e9d1461004f578063ceba504d1461008c578063dd074ea0146100bc578063f78a9861146100ec5761004a565b3661004a57005b600080fd5b34801561005b57600080fd5b5061007660048036038101906100719190610f25565b610129565b6040516100839190611086565b60405180910390f35b6100a660048036038101906100a19190610f25565b61023c565b6040516100b39190611086565b60405180910390f35b6100d660048036038101906100d19190610f25565b61034f565b6040516100e39190611086565b60405180910390f35b3480156100f857600080fd5b50610113600480360381019061010e919061112c565b610667565b6040516101209190611086565b60405180910390f35b610131610ecc565b61013961081c565b60005a90506000836020013503610185576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161017c90611219565b60405180910390fd5b60008360a00135036101cc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101c390611285565b60405180910390fd5b61020e8360000160208101906101e29190611315565b337f0000000000000000000000000000000000000000000000000000000000000000866020013561086b565b610217836108f4565b91505a816102259190611371565b82604001818152505050610237610ba8565b919050565b610244610ecc565b61024c61081c565b60005a90506000836020013503610298576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028f90611219565b60405180910390fd5b60008360a00135036102df576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102d690611285565b60405180910390fd5b6103218360000160208101906102f59190611315565b337f0000000000000000000000000000000000000000000000000000000000000000866020013561086b565b61032a836108f4565b91505a816103389190611371565b8260400181815250505061034a610ba8565b919050565b610357610ecc565b61035f61081c565b60005a90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff168360000160208101906103ae9190611315565b73ffffffffffffffffffffffffffffffffffffffff1614610404576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103fb906113f1565b60405180910390fd5b3483602001351461044a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161044190611219565b60405180910390fd5b6000340361048d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161048490611219565b60405180910390fd5b60008360a00135036104d4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104cb90611285565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663d0e30db0346040518263ffffffff1660e01b81526004016000604051808303818588803b15801561053c57600080fd5b505af1158015610550573d6000803e3d6000fd5b50505050506106397f00000000000000000000000000000000000000000000000000000000000000007f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016105f39190611420565b602060405180830381865afa158015610610573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106349190611467565b610bb2565b610642836108f4565b91505a816106509190611371565b82604001818152505050610662610ba8565b919050565b61066f610ecc565b61067761081c565b60005a905060008660200135036106c3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106ba90611219565b60405180910390fd5b60008660a001350361070a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161070190611285565b60405180910390fd5b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166330f28b7a8660405180604001604052807f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1681526020018a602001358152503388886040518663ffffffff1660e01b81526004016107b9959493929190611643565b600060405180830381600087803b1580156107d357600080fd5b505af11580156107e7573d6000803e3d6000fd5b505050506107f4866108f4565b91505a816108029190611371565b82604001818152505050610814610ba8565b949350505050565b600260005403610861576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610858906116de565b60405180910390fd5b6002600081905550565b6108ee846323b872dd60e01b85858560405160240161088c9392919061170d565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610c38565b50505050565b6108fc610ecc565b60008260c00160208101906109119190611315565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b81526004016109499190611420565b602060405180830381865afa158015610966573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061098a9190611467565b90507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166308c4b4988480604001906109d89190611753565b8680606001906109e891906117b6565b8880608001906109f89190611819565b6040518763ffffffff1660e01b8152600401610a1996959493929190611b6e565b6000604051808303816000875af1158015610a38573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190610a619190611d60565b60000151826000018190525060008360c0016020810190610a829190611315565b73ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b8152600401610aba9190611420565b602060405180830381865afa158015610ad7573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610afb9190611467565b9050818111610b3f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b3690611df5565b60405180910390fd5b60008282610b4d9190611371565b90508460a00135811015610b96576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b8d90611e61565b60405180910390fd5b80846020018181525050505050919050565b6001600081905550565b610c338363a9059cbb60e01b8484604051602401610bd1929190611e81565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050610c38565b505050565b6000610c9a826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16610cff9092919063ffffffff16565b9050600081511115610cfa5780806020019051810190610cba9190611ee2565b610cf9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cf090611f81565b60405180910390fd5b5b505050565b6060610d0e8484600085610d17565b90509392505050565b606082471015610d5c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d5390612013565b60405180910390fd5b6000808673ffffffffffffffffffffffffffffffffffffffff168587604051610d8591906120a4565b60006040518083038185875af1925050503d8060008114610dc2576040519150601f19603f3d011682016040523d82523d6000602084013e610dc7565b606091505b5091509150610dd887838387610de4565b92505050949350505050565b60608315610e46576000835103610e3e57610dfe85610e59565b610e3d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e3490612107565b60405180910390fd5b5b829050610e51565b610e508383610e7c565b5b949350505050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600082511115610e8f5781518083602001fd5b806040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ec3919061216b565b60405180910390fd5b60405180606001604052806060815260200160008152602001600081525090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600060e08284031215610f1c57610f1b610f01565b5b81905092915050565b600060208284031215610f3b57610f3a610ef7565b5b600082013567ffffffffffffffff811115610f5957610f58610efc565b5b610f6584828501610f06565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000819050919050565b610fad81610f9a565b82525050565b6000610fbf8383610fa4565b60208301905092915050565b6000602082019050919050565b6000610fe382610f6e565b610fed8185610f79565b9350610ff883610f8a565b8060005b838110156110295781516110108882610fb3565b975061101b83610fcb565b925050600181019050610ffc565b5085935050505092915050565b600060608301600083015184820360008601526110538282610fd8565b91505060208301516110686020860182610fa4565b50604083015161107b6040860182610fa4565b508091505092915050565b600060208201905081810360008301526110a08184611036565b905092915050565b6000608082840312156110be576110bd610f01565b5b81905092915050565b600080fd5b600080fd5b600080fd5b60008083601f8401126110ec576110eb6110c7565b5b8235905067ffffffffffffffff811115611109576111086110cc565b5b602083019150836001820283011115611125576111246110d1565b5b9250929050565b60008060008060c0858703121561114657611145610ef7565b5b600085013567ffffffffffffffff81111561116457611163610efc565b5b61117087828801610f06565b9450506020611181878288016110a8565b93505060a085013567ffffffffffffffff8111156111a2576111a1610efc565b5b6111ae878288016110d6565b925092505092959194509250565b600082825260208201905092915050565b7f494e56414c49445f494e5055545f414d4f554e54000000000000000000000000600082015250565b60006112036014836111bc565b915061120e826111cd565b602082019050919050565b60006020820190508181036000830152611232816111f6565b9050919050565b7f494e56414c49445f4f55545055545f414d4f554e540000000000000000000000600082015250565b600061126f6015836111bc565b915061127a82611239565b602082019050919050565b6000602082019050818103600083015261129e81611262565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006112d0826112a5565b9050919050565b60006112e2826112c5565b9050919050565b6112f2816112d7565b81146112fd57600080fd5b50565b60008135905061130f816112e9565b92915050565b60006020828403121561132b5761132a610ef7565b5b600061133984828501611300565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061137c82610f9a565b915061138783610f9a565b925082820390508181111561139f5761139e611342565b5b92915050565b7f494e56414c49445f494e5055545f544f4b454e00000000000000000000000000600082015250565b60006113db6013836111bc565b91506113e6826113a5565b602082019050919050565b6000602082019050818103600083015261140a816113ce565b9050919050565b61141a816112c5565b82525050565b60006020820190506114356000830184611411565b92915050565b61144481610f9a565b811461144f57600080fd5b50565b6000815190506114618161143b565b92915050565b60006020828403121561147d5761147c610ef7565b5b600061148b84828501611452565b91505092915050565b600082905092915050565b6114a8816112c5565b81146114b357600080fd5b50565b6000813590506114c58161149f565b92915050565b60006114da60208401846114b6565b905092915050565b6114eb816112c5565b82525050565b6000813590506115008161143b565b92915050565b600061151560208401846114f1565b905092915050565b6040820161152e60008301836114cb565b61153b60008501826114e2565b506115496020830183611506565b6115566020850182610fa4565b50505050565b6080820161156d6000830183611494565b61157a600085018261151d565b506115886040830183611506565b6115956040850182610fa4565b506115a36060830183611506565b6115b06060850182610fa4565b50505050565b6040820160008201516115cc60008501826114e2565b5060208201516115df6020850182610fa4565b50505050565b600082825260208201905092915050565b82818337600083830152505050565b6000601f19601f8301169050919050565b600061162283856115e5565b935061162f8385846115f6565b61163883611605565b840190509392505050565b600061010082019050611659600083018861155c565b61166660808301876115b6565b61167360c0830186611411565b81810360e0830152611686818486611616565b90509695505050505050565b7f5265656e7472616e637947756172643a207265656e7472616e742063616c6c00600082015250565b60006116c8601f836111bc565b91506116d382611692565b602082019050919050565b600060208201905081810360008301526116f7816116bb565b9050919050565b61170781610f9a565b82525050565b60006060820190506117226000830186611411565b61172f6020830185611411565b61173c60408301846116fe565b949350505050565b600080fd5b600080fd5b600080fd5b600080833560016020038436030381126117705761176f611744565b5b80840192508235915067ffffffffffffffff82111561179257611791611749565b5b6020830192506020820236038313156117ae576117ad61174e565b5b509250929050565b600080833560016020038436030381126117d3576117d2611744565b5b80840192508235915067ffffffffffffffff8211156117f5576117f4611749565b5b6020830192506020820236038313156118115761181061174e565b5b509250929050565b6000808335600160200384360303811261183657611835611744565b5b80840192508235915067ffffffffffffffff82111561185857611857611749565b5b6020830192506020820236038313156118745761187361174e565b5b509250929050565b600082825260208201905092915050565b600080fd5b82818337505050565b60006118a7838561187c565b93507f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8311156118da576118d961188d565b5b6020830292506118eb838584611892565b82840190509392505050565b600082825260208201905092915050565b6000819050919050565b600082825260208201905092915050565b600061192f8385611912565b935061193c8385846115f6565b61194583611605565b840190509392505050565b600061195d848484611923565b90509392505050565b600080fd5b600080fd5b600080fd5b6000808335600160200384360303811261199257611991611970565b5b83810192508235915060208301925067ffffffffffffffff8211156119ba576119b9611966565b5b6001820236038313156119d0576119cf61196b565b5b509250929050565b6000602082019050919050565b60006119f183856118f7565b935083602084028501611a0384611908565b8060005b87811015611a49578484038952611a1e8284611975565b611a29868284611950565b9550611a34846119d8565b935060208b019a505050600181019050611a07565b50829750879450505050509392505050565b600082825260208201905092915050565b6000819050919050565b6000819050919050565b6000611a9b611a96611a91846112a5565b611a76565b6112a5565b9050919050565b6000611aad82611a80565b9050919050565b6000611abf82611aa2565b9050919050565b611acf81611ab4565b82525050565b6000611ae18383611ac6565b60208301905092915050565b6000611afc6020840184611300565b905092915050565b6000602082019050919050565b6000611b1d8385611a5b565b9350611b2882611a6c565b8060005b85811015611b6157611b3e8284611aed565b611b488882611ad5565b9750611b5383611b04565b925050600181019050611b2c565b5085925050509392505050565b60006060820190508181036000830152611b8981888a61189b565b90508181036020830152611b9e8186886119e5565b90508181036040830152611bb3818486611b11565b9050979650505050505050565b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b611bfd82611605565b810181811067ffffffffffffffff82111715611c1c57611c1b611bc5565b5b80604052505050565b6000611c2f610eed565b9050611c3b8282611bf4565b919050565b600080fd5b600067ffffffffffffffff821115611c6057611c5f611bc5565b5b602082029050602081019050919050565b6000611c84611c7f84611c45565b611c25565b90508083825260208201905060208402830185811115611ca757611ca66110d1565b5b835b81811015611cd05780611cbc8882611452565b845260208401935050602081019050611ca9565b5050509392505050565b600082601f830112611cef57611cee6110c7565b5b8151611cff848260208601611c71565b91505092915050565b600060208284031215611d1e57611d1d611bc0565b5b611d286020611c25565b9050600082015167ffffffffffffffff811115611d4857611d47611c40565b5b611d5484828501611cda565b60008301525092915050565b600060208284031215611d7657611d75610ef7565b5b600082015167ffffffffffffffff811115611d9457611d93610efc565b5b611da084828501611d08565b91505092915050565b7f494e56414c49445f4e45575f42414c414e434500000000000000000000000000600082015250565b6000611ddf6013836111bc565b9150611dea82611da9565b602082019050919050565b60006020820190508181036000830152611e0e81611dd2565b9050919050565b7f494e53554646494349454e545f4f555400000000000000000000000000000000600082015250565b6000611e4b6010836111bc565b9150611e5682611e15565b602082019050919050565b60006020820190508181036000830152611e7a81611e3e565b9050919050565b6000604082019050611e966000830185611411565b611ea360208301846116fe565b9392505050565b60008115159050919050565b611ebf81611eaa565b8114611eca57600080fd5b50565b600081519050611edc81611eb6565b92915050565b600060208284031215611ef857611ef7610ef7565b5b6000611f0684828501611ecd565b91505092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e60008201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b6000611f6b602a836111bc565b9150611f7682611f0f565b604082019050919050565b60006020820190508181036000830152611f9a81611f5e565b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f60008201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b6000611ffd6026836111bc565b915061200882611fa1565b604082019050919050565b6000602082019050818103600083015261202c81611ff0565b9050919050565b600081519050919050565b600081905092915050565b60005b8381101561206757808201518184015260208101905061204c565b60008484015250505050565b600061207e82612033565b612088818561203e565b9350612098818560208601612049565b80840191505092915050565b60006120b08284612073565b915081905092915050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000600082015250565b60006120f1601d836111bc565b91506120fc826120bb565b602082019050919050565b60006020820190508181036000830152612120816120e4565b9050919050565b600081519050919050565b600061213d82612127565b61214781856111bc565b9350612157818560208601612049565b61216081611605565b840191505092915050565b600060208201905081810360008301526121858184612132565b90509291505056fea2646970667358221220227fa7c782cf0e47cede7790b5bdead08534530eab2315da8a1110c580676f5364736f6c63430008110033";
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
        readonly name: "zapToETH";
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