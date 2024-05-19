import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IFrxEthFraxOracle, IFrxEthFraxOracleInterface } from "../../../contracts/IFrxEthFraxOracle.sol/IFrxEthFraxOracle";
export declare class IFrxEthFraxOracle__factory {
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
        readonly name: "decimals";
        readonly outputs: readonly [{
            readonly internalType: "uint8";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "description";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "view";
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
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "_roundId";
            readonly type: "uint80";
        }];
        readonly name: "getRoundData";
        readonly outputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "roundId";
            readonly type: "uint80";
        }, {
            readonly internalType: "int256";
            readonly name: "answer";
            readonly type: "int256";
        }, {
            readonly internalType: "uint256";
            readonly name: "startedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "updatedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint80";
            readonly name: "answeredInRound";
            readonly type: "uint80";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "latestRoundData";
        readonly outputs: readonly [{
            readonly internalType: "uint80";
            readonly name: "roundId";
            readonly type: "uint80";
        }, {
            readonly internalType: "int256";
            readonly name: "answer";
            readonly type: "int256";
        }, {
            readonly internalType: "uint256";
            readonly name: "startedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "updatedAt";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint80";
            readonly name: "answeredInRound";
            readonly type: "uint80";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "version";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IFrxEthFraxOracleInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IFrxEthFraxOracle;
}
//# sourceMappingURL=IFrxEthFraxOracle__factory.d.ts.map