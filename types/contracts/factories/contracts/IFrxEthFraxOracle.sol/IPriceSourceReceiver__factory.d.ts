import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceSourceReceiver, IPriceSourceReceiverInterface } from "../../../contracts/IFrxEthFraxOracle.sol/IPriceSourceReceiver";
export declare class IPriceSourceReceiver__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "isBadData";
            readonly type: "bool";
        }, {
            readonly internalType: "uint104";
            readonly name: "priceLow";
            readonly type: "uint104";
        }, {
            readonly internalType: "uint104";
            readonly name: "priceHigh";
            readonly type: "uint104";
        }, {
            readonly internalType: "uint40";
            readonly name: "timestamp";
            readonly type: "uint40";
        }];
        readonly name: "addRoundData";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getPrices";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "isBadData";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "priceLow";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "priceHigh";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IPriceSourceReceiverInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceSourceReceiver;
}
//# sourceMappingURL=IPriceSourceReceiver__factory.d.ts.map