import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IPriceOracleGetter, IPriceOracleGetterInterface } from "../../../contracts/AaveV3.sol/IPriceOracleGetter";
export declare class IPriceOracleGetter__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "BASE_CURRENCY";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "BASE_CURRENCY_UNIT";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "asset";
            readonly type: "address";
        }];
        readonly name: "getAssetPrice";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IPriceOracleGetterInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IPriceOracleGetter;
}
//# sourceMappingURL=IPriceOracleGetter__factory.d.ts.map