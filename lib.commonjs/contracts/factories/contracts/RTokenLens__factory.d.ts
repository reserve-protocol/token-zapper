import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { RTokenLens, RTokenLensInterface } from "../../contracts/RTokenLens";
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
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610aee806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063ba036b4014610030575b600080fd5b61004a6004803603810190610045919061039f565b610061565b604051610058929190610582565b60405180910390f35b6060808573ffffffffffffffffffffffffffffffffffffffff1663f8ac93e86040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156100ac57600080fd5b505af11580156100c0573d6000803e3d6000fd5b5050505060008473ffffffffffffffffffffffffffffffffffffffff166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610111573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061013591906105ce565b848673ffffffffffffffffffffffffffffffffffffffff16637121c2736040518163ffffffff1660e01b8152600401602060405180830381865afa158015610181573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101a5919061064b565b77ffffffffffffffffffffffffffffffffffffffffffffffff166101c991906106a7565b6101d39190610718565b90508573ffffffffffffffffffffffffffffffffffffffff1663c620f0fc8260006040518363ffffffff1660e01b81526004016102119291906107cf565b600060405180830381865afa15801561022e573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906102579190610a40565b80935081945050505094509492505050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102a88261027d565b9050919050565b60006102ba8261029d565b9050919050565b6102ca816102af565b81146102d557600080fd5b50565b6000813590506102e7816102c1565b92915050565b60006102f88261029d565b9050919050565b610308816102ed565b811461031357600080fd5b50565b600081359050610325816102ff565b92915050565b60006103368261029d565b9050919050565b6103468161032b565b811461035157600080fd5b50565b6000813590506103638161033d565b92915050565b6000819050919050565b61037c81610369565b811461038757600080fd5b50565b60008135905061039981610373565b92915050565b600080600080608085870312156103b9576103b8610273565b5b60006103c7878288016102d8565b94505060206103d887828801610316565b93505060406103e987828801610354565b92505060606103fa8782880161038a565b91505092959194509250565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61043b8161029d565b82525050565b600061044d8383610432565b60208301905092915050565b6000602082019050919050565b600061047182610406565b61047b8185610411565b935061048683610422565b8060005b838110156104b757815161049e8882610441565b97506104a983610459565b92505060018101905061048a565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6104f981610369565b82525050565b600061050b83836104f0565b60208301905092915050565b6000602082019050919050565b600061052f826104c4565b61053981856104cf565b9350610544836104e0565b8060005b8381101561057557815161055c88826104ff565b975061056783610517565b925050600181019050610548565b5085935050505092915050565b6000604082019050818103600083015261059c8185610466565b905081810360208301526105b08184610524565b90509392505050565b6000815190506105c881610373565b92915050565b6000602082840312156105e4576105e3610273565b5b60006105f2848285016105b9565b91505092915050565b600077ffffffffffffffffffffffffffffffffffffffffffffffff82169050919050565b610628816105fb565b811461063357600080fd5b50565b6000815190506106458161061f565b92915050565b60006020828403121561066157610660610273565b5b600061066f84828501610636565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006106b282610369565b91506106bd83610369565b92508282026106cb81610369565b915082820484148315176106e2576106e1610678565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061072382610369565b915061072e83610369565b92508261073e5761073d6106e9565b5b828204905092915050565b610752816105fb565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6003811061079857610797610758565b5b50565b60008190506107a982610787565b919050565b60006107b98261079b565b9050919050565b6107c9816107ae565b82525050565b60006040820190506107e46000830185610749565b6107f160208301846107c0565b9392505050565b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610846826107fd565b810181811067ffffffffffffffff821117156108655761086461080e565b5b80604052505050565b6000610878610269565b9050610884828261083d565b919050565b600067ffffffffffffffff8211156108a4576108a361080e565b5b602082029050602081019050919050565b600080fd5b6108c38161029d565b81146108ce57600080fd5b50565b6000815190506108e0816108ba565b92915050565b60006108f96108f484610889565b61086e565b9050808382526020820190506020840283018581111561091c5761091b6108b5565b5b835b81811015610945578061093188826108d1565b84526020840193505060208101905061091e565b5050509392505050565b600082601f830112610964576109636107f8565b5b81516109748482602086016108e6565b91505092915050565b600067ffffffffffffffff8211156109985761099761080e565b5b602082029050602081019050919050565b60006109bc6109b78461097d565b61086e565b905080838252602082019050602084028301858111156109df576109de6108b5565b5b835b81811015610a0857806109f488826105b9565b8452602084019350506020810190506109e1565b5050509392505050565b600082601f830112610a2757610a266107f8565b5b8151610a378482602086016109a9565b91505092915050565b60008060408385031215610a5757610a56610273565b5b600083015167ffffffffffffffff811115610a7557610a74610278565b5b610a818582860161094f565b925050602083015167ffffffffffffffff811115610aa257610aa1610278565b5b610aae85828601610a12565b915050925092905056fea2646970667358221220455adabfe3e2b53d19aa3453c0765d1eb60c174500bc4e5bdf5d31385760401d64736f6c63430008110033";
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
            readonly name: "amtRToken";
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