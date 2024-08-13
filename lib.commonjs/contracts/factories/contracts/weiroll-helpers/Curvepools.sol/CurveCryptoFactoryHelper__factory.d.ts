import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type { CurveCryptoFactoryHelper, CurveCryptoFactoryHelperInterface } from "../../../../contracts/weiroll-helpers/Curvepools.sol/CurveCryptoFactoryHelper";
type CurveCryptoFactoryHelperConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CurveCryptoFactoryHelper__factory extends ContractFactory {
    constructor(...args: CurveCryptoFactoryHelperConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<CurveCryptoFactoryHelper>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): CurveCryptoFactoryHelper;
    connect(signer: Signer): CurveCryptoFactoryHelper__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610493806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063b02e94e214610030575b600080fd5b61004a60048036038101906100459190610256565b610060565b60405161005791906102e0565b60405180910390f35b600061006a610151565b6000816000600281106100805761007f6102fb565b5b60200201818152505060008160016002811061009f5761009e6102fb565b5b602002018181525050868187600281106100bc576100bb6102fb565b5b6020020181815250508473ffffffffffffffffffffffffffffffffffffffff1663ee22be238286866040518463ffffffff1660e01b8152600401610102939291906103e4565b6020604051808303816000875af1158015610121573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101459190610430565b91505095945050505050565b6040518060400160405280600290602082028036833780820191505090505090565b600080fd5b6000819050919050565b61018b81610178565b811461019657600080fd5b50565b6000813590506101a881610182565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006101d9826101ae565b9050919050565b60006101eb826101ce565b9050919050565b6101fb816101e0565b811461020657600080fd5b50565b600081359050610218816101f2565b92915050565b60008115159050919050565b6102338161021e565b811461023e57600080fd5b50565b6000813590506102508161022a565b92915050565b600080600080600060a0868803121561027257610271610173565b5b600061028088828901610199565b955050602061029188828901610199565b94505060406102a288828901610209565b93505060606102b388828901610199565b92505060806102c488828901610241565b9150509295509295909350565b6102da81610178565b82525050565b60006020820190506102f560008301846102d1565b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600060029050919050565b600081905092915050565b6000819050919050565b61035381610178565b82525050565b6000610365838361034a565b60208301905092915050565b6000602082019050919050565b6103878161032a565b6103918184610335565b925061039c82610340565b8060005b838110156103cd5781516103b48782610359565b96506103bf83610371565b9250506001810190506103a0565b505050505050565b6103de8161021e565b82525050565b60006080820190506103f9600083018661037e565b61040660408301856102d1565b61041360608301846103d5565b949350505050565b60008151905061042a81610182565b92915050565b60006020828403121561044657610445610173565b5b60006104548482850161041b565b9150509291505056fea26469706673582212207692bcdfb8c114467c99969701cea46f0952df8b75707fe53e6f5bf84b889d5964736f6c63430008110033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "coinIdx";
            readonly type: "uint256";
        }, {
            readonly internalType: "contract ICurveCryptoFactory";
            readonly name: "pool";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "minOut";
            readonly type: "uint256";
        }, {
            readonly internalType: "bool";
            readonly name: "useEth";
            readonly type: "bool";
        }];
        readonly name: "addliquidity";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): CurveCryptoFactoryHelperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CurveCryptoFactoryHelper;
}
export {};
