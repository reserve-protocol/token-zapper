import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAaveIncentivesController, IAaveIncentivesControllerInterface } from "../../../contracts/AaveV3.sol/IAaveIncentivesController";
export declare class IAaveIncentivesController__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "userBalance";
            readonly type: "uint256";
        }];
        readonly name: "handleAction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IAaveIncentivesControllerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAaveIncentivesController;
}
//# sourceMappingURL=IAaveIncentivesController__factory.d.ts.map