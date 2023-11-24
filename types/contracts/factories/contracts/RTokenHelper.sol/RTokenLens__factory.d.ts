import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { RTokenLens, RTokenLensInterface } from "../../../contracts/RTokenHelper.sol/RTokenLens";
type RTokenLensConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class RTokenLens__factory extends ContractFactory {
    constructor(...args: RTokenLensConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<RTokenLens>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): RTokenLens;
    connect(signer: Signer): RTokenLens__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610b47806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063ba036b4014610030575b600080fd5b61004a600480360381019061004591906103c4565b610061565b6040516100589291906105a7565b60405180910390f35b6060808573ffffffffffffffffffffffffffffffffffffffff1663f8ac93e86040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156100ac57600080fd5b505af11580156100c0573d6000803e3d6000fd5b5050505060006100d08585610167565b5090508573ffffffffffffffffffffffffffffffffffffffff1663c620f0fc8260026040518363ffffffff1660e01b815260040161010f929190610688565b600060405180830381865afa15801561012c573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f82011682018060405250810190610155919061090e565b80935081945050505094509492505050565b6000808373ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156101b5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d99190610986565b838573ffffffffffffffffffffffffffffffffffffffff16637121c2736040518163ffffffff1660e01b8152600401602060405180830381865afa158015610225573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061024991906109df565b77ffffffffffffffffffffffffffffffffffffffffffffffff1661026d9190610a3b565b6102779190610aac565b915081816102859190610add565b90509250929050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102cd826102a2565b9050919050565b60006102df826102c2565b9050919050565b6102ef816102d4565b81146102fa57600080fd5b50565b60008135905061030c816102e6565b92915050565b600061031d826102c2565b9050919050565b61032d81610312565b811461033857600080fd5b50565b60008135905061034a81610324565b92915050565b600061035b826102c2565b9050919050565b61036b81610350565b811461037657600080fd5b50565b60008135905061038881610362565b92915050565b6000819050919050565b6103a18161038e565b81146103ac57600080fd5b50565b6000813590506103be81610398565b92915050565b600080600080608085870312156103de576103dd610298565b5b60006103ec878288016102fd565b94505060206103fd8782880161033b565b935050604061040e87828801610379565b925050606061041f878288016103af565b91505092959194509250565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610460816102c2565b82525050565b60006104728383610457565b60208301905092915050565b6000602082019050919050565b60006104968261042b565b6104a08185610436565b93506104ab83610447565b8060005b838110156104dc5781516104c38882610466565b97506104ce8361047e565b9250506001810190506104af565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61051e8161038e565b82525050565b60006105308383610515565b60208301905092915050565b6000602082019050919050565b6000610554826104e9565b61055e81856104f4565b935061056983610505565b8060005b8381101561059a5781516105818882610524565b975061058c8361053c565b92505060018101905061056d565b5085935050505092915050565b600060408201905081810360008301526105c1818561048b565b905081810360208301526105d58184610549565b90509392505050565b600077ffffffffffffffffffffffffffffffffffffffffffffffff82169050919050565b61060b816105de565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6003811061065157610650610611565b5b50565b600081905061066282610640565b919050565b600061067282610654565b9050919050565b61068281610667565b82525050565b600060408201905061069d6000830185610602565b6106aa6020830184610679565b9392505050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6106ff826106b6565b810181811067ffffffffffffffff8211171561071e5761071d6106c7565b5b80604052505050565b600061073161028e565b905061073d82826106f6565b919050565b600067ffffffffffffffff82111561075d5761075c6106c7565b5b602082029050602081019050919050565b600080fd5b61077c816102c2565b811461078757600080fd5b50565b60008151905061079981610773565b92915050565b60006107b26107ad84610742565b610727565b905080838252602082019050602084028301858111156107d5576107d461076e565b5b835b818110156107fe57806107ea888261078a565b8452602084019350506020810190506107d7565b5050509392505050565b600082601f83011261081d5761081c6106b1565b5b815161082d84826020860161079f565b91505092915050565b600067ffffffffffffffff821115610851576108506106c7565b5b602082029050602081019050919050565b60008151905061087181610398565b92915050565b600061088a61088584610836565b610727565b905080838252602082019050602084028301858111156108ad576108ac61076e565b5b835b818110156108d657806108c28882610862565b8452602084019350506020810190506108af565b5050509392505050565b600082601f8301126108f5576108f46106b1565b5b8151610905848260208601610877565b91505092915050565b6000806040838503121561092557610924610298565b5b600083015167ffffffffffffffff8111156109435761094261029d565b5b61094f85828601610808565b925050602083015167ffffffffffffffff8111156109705761096f61029d565b5b61097c858286016108e0565b9150509250929050565b60006020828403121561099c5761099b610298565b5b60006109aa84828501610862565b91505092915050565b6109bc816105de565b81146109c757600080fd5b50565b6000815190506109d9816109b3565b92915050565b6000602082840312156109f5576109f4610298565b5b6000610a03848285016109ca565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610a468261038e565b9150610a518361038e565b9250828202610a5f8161038e565b91508282048414831517610a7657610a75610a0c565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000610ab78261038e565b9150610ac28361038e565b925082610ad257610ad1610a7d565b5b828204905092915050565b6000610ae88261038e565b9150610af38361038e565b9250828203905081811115610b0b57610b0a610a0c565b5b9291505056fea264697066735822122089ed4f4dfc493deca792dc2389f6445f1e079f403ce13068610e8acb66d83aa964736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IAssetRegistry";
            readonly name: "assetRegistry";
            readonly type: "address";
        }, {
            readonly internalType: "contract IBasketHandler";
            readonly name: "basketHandler";
            readonly type: "address";
        }, {
            readonly internalType: "contract IRToken";
            readonly name: "rToken";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "redeem";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "erc20s";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "quantities";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): RTokenLensInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): RTokenLens;
}
export {};
//# sourceMappingURL=RTokenLens__factory.d.ts.map