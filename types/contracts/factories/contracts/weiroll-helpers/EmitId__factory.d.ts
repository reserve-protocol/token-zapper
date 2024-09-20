import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { EmitId, EmitIdInterface } from "../../../contracts/weiroll-helpers/EmitId";
type EmitIdConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class EmitId__factory extends ContractFactory {
    constructor(...args: EmitIdConstructorParams);
    deploy(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<EmitId>;
    getDeployTransaction(overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): TransactionRequest;
    attach(address: string): EmitId;
    connect(signer: Signer): EmitId__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061014e806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063c1c4eae714610030575b600080fd5b61004a600480360381019061004591906100c1565b61004c565b005b7fa1516f6784b75b19c0c5fcf1293f6a3a472188b8775eda8e33d9209b007ea22c8160405161007b91906100fd565b60405180910390a150565b600080fd5b6000819050919050565b61009e8161008b565b81146100a957600080fd5b50565b6000813590506100bb81610095565b92915050565b6000602082840312156100d7576100d6610086565b5b60006100e5848285016100ac565b91505092915050565b6100f78161008b565b82525050565b600060208201905061011260008301846100ee565b9291505056fea26469706673582212208745e45893b4e7cc79e243312bb105d726a62429ca8b187a97842b350c72897d64736f6c63430008110033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "id";
            readonly type: "uint256";
        }];
        readonly name: "ReserveZapId";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "id";
            readonly type: "uint256";
        }];
        readonly name: "emitId";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): EmitIdInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): EmitId;
}
export {};
//# sourceMappingURL=EmitId__factory.d.ts.map