import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAerodromeSugar, IAerodromeSugarInterface } from "../../../contracts/Aerodrome.sol/IAerodromeSugar";
export declare class IAerodromeSugar__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "limit";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "offset";
            readonly type: "uint256";
        }];
        readonly name: "forSwaps";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "lp";
                readonly type: "address";
            }, {
                readonly internalType: "int24";
                readonly name: "poolType";
                readonly type: "int24";
            }, {
                readonly internalType: "address";
                readonly name: "token0";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "token1";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "factory";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "poolFee";
                readonly type: "uint256";
            }];
            readonly internalType: "struct SwapLp[]";
            readonly name: "";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IAerodromeSugarInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAerodromeSugar;
}
//# sourceMappingURL=IAerodromeSugar__factory.d.ts.map