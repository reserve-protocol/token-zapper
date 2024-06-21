import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IEACAggregatorProxy, IEACAggregatorProxyInterface } from "../../contracts/IEACAggregatorProxy";
export declare class IEACAggregatorProxy__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "latestAnswer";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IEACAggregatorProxyInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IEACAggregatorProxy;
}
