import { Address } from '../base/Address';
import { type EthereumUniverse } from './ethereum';
export declare const setupEthereumZapper: (universe: EthereumUniverse) => Promise<{
    aaveV3: {
        readonly reserves: {
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: import("..").Token;
            readonly aToken: import("..").Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: import("..").Token;
            readonly intoAssets: (shares: import("..").TokenQuantity) => Promise<import("..").TokenQuantity>;
            toString(): string;
        }[];
        readonly tokenToReserve: Map<import("..").Token, {
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: import("..").Token;
            readonly aToken: import("..").Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: import("..").Token;
            readonly intoAssets: (shares: import("..").TokenQuantity) => Promise<import("..").TokenQuantity>;
            toString(): string;
        }>;
        readonly addresss: Address;
        addReserve(token: import("..").Token): Promise<{
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: import("..").Token;
            readonly aToken: import("..").Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: import("..").Token;
            readonly intoAssets: (shares: import("..").TokenQuantity) => Promise<import("..").TokenQuantity>;
            toString(): string;
        }>;
        readonly poolInst: import("../contracts").IPool;
        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
        toString(): string;
        addWrapper(wrapper: import("..").Token): Promise<void>;
    };
    compV3: {
        readonly comets: {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: import("..").Token;
            readonly borrowToken: import("..").Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: import("..").Token;
                readonly priceFeed: Address;
                readonly scale: bigint;
                readonly borrowCollateralFactor: bigint;
                readonly liquidateCollateralFactor: bigint;
                readonly liquidationFactor: bigint;
                readonly supplyCap: bigint;
                toString(): string;
            }[];
            toString(): string;
        }[];
        readonly cometWrappers: {
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: import("..").Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: import("..").Token;
                readonly borrowToken: import("..").Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: import("..").Token;
                    readonly priceFeed: Address;
                    readonly scale: bigint;
                    readonly borrowCollateralFactor: bigint;
                    readonly liquidateCollateralFactor: bigint;
                    readonly liquidationFactor: bigint;
                    readonly supplyCap: bigint;
                    toString(): string;
                }[];
                toString(): string;
            };
            readonly wrapperToken: import("..").Token;
            toString(): string;
        }[];
        readonly cometByBaseToken: Map<import("..").Token, {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: import("..").Token;
            readonly borrowToken: import("..").Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: import("..").Token;
                readonly priceFeed: Address;
                readonly scale: bigint;
                readonly borrowCollateralFactor: bigint;
                readonly liquidateCollateralFactor: bigint;
                readonly liquidationFactor: bigint;
                readonly supplyCap: bigint;
                toString(): string;
            }[];
            toString(): string;
        }>;
        readonly cometByPoolToken: Map<import("..").Token, {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: import("..").Token;
            readonly borrowToken: import("..").Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: import("..").Token;
                readonly priceFeed: Address;
                readonly scale: bigint;
                readonly borrowCollateralFactor: bigint;
                readonly liquidateCollateralFactor: bigint;
                readonly liquidationFactor: bigint;
                readonly supplyCap: bigint;
                toString(): string;
            }[];
            toString(): string;
        }>;
        readonly cometWrapperByWrapperToken: Map<import("..").Token, {
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: import("..").Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: import("..").Token;
                readonly borrowToken: import("..").Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: import("..").Token;
                    readonly priceFeed: Address;
                    readonly scale: bigint;
                    readonly borrowCollateralFactor: bigint;
                    readonly liquidateCollateralFactor: bigint;
                    readonly liquidationFactor: bigint;
                    readonly supplyCap: bigint;
                    toString(): string;
                }[];
                toString(): string;
            };
            readonly wrapperToken: import("..").Token;
            toString(): string;
        }>;
        readonly cometWrapperByCometToken: Map<import("..").Token, {
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: import("..").Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: import("..").Token;
                readonly borrowToken: import("..").Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: import("..").Token;
                    readonly priceFeed: Address;
                    readonly scale: bigint;
                    readonly borrowCollateralFactor: bigint;
                    readonly liquidateCollateralFactor: bigint;
                    readonly liquidationFactor: bigint;
                    readonly supplyCap: bigint;
                    toString(): string;
                }[];
                toString(): string;
            };
            readonly wrapperToken: import("..").Token;
            toString(): string;
        }>;
        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
        getComet(poolToken: import("..").Token): Promise<{
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: import("..").Token;
            readonly borrowToken: import("..").Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: import("..").Token;
                readonly priceFeed: Address;
                readonly scale: bigint;
                readonly borrowCollateralFactor: bigint;
                readonly liquidateCollateralFactor: bigint;
                readonly liquidationFactor: bigint;
                readonly supplyCap: bigint;
                toString(): string;
            }[];
            toString(): string;
        }>;
        getCometWrapper(wrapperToken: import("..").Token): Promise<{
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: import("..").Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        readonly receiptToken: import("..").Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: import("..").Token[];
                        readonly outputToken: import("..").Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                        exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: import("..").Token;
                    readonly borrowToken: import("..").Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: import("..").Token;
                        readonly priceFeed: Address;
                        readonly scale: bigint;
                        readonly borrowCollateralFactor: bigint;
                        readonly liquidateCollateralFactor: bigint;
                        readonly liquidationFactor: bigint;
                        readonly supplyCap: bigint;
                        toString(): string;
                    }[];
                    toString(): string;
                };
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: import("..").Token[];
                readonly outputToken: import("..").Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: import("..").Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("..").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    readonly receiptToken: import("..").Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("..").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: import("..").Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: import("..").Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: import("..").Token[];
                    readonly outputToken: import("..").Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("..").TokenQuantity[]): Promise<import("..").TokenQuantity[]>;
                    exchange(amountsIn: import("..").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: import("..").Token;
                readonly borrowToken: import("..").Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: import("..").Token;
                    readonly priceFeed: Address;
                    readonly scale: bigint;
                    readonly borrowCollateralFactor: bigint;
                    readonly liquidateCollateralFactor: bigint;
                    readonly liquidationFactor: bigint;
                    readonly supplyCap: bigint;
                    toString(): string;
                }[];
                toString(): string;
            };
            readonly wrapperToken: import("..").Token;
            toString(): string;
        }>;
        toString(): string;
    };
    uni: {
        dex: import("../aggregators/DexAggregator").DexRouter;
        addTradeAction: (inputToken: import("..").Token, outputToken: import("..").Token) => void;
    };
    curve: {
        stables: Set<import("..").Token>;
        setupConvexEdge: (universe: import("..").Universe<import("./ChainConfiguration").Config>, stakedConvexToken: import("..").Token, convex: Address) => Promise<{
            pool: {
                readonly convexBooster: Address;
                readonly convexPoolId: bigint;
                readonly curveLPToken: import("..").Token;
                readonly convexDepositToken: import("..").Token;
                readonly stakedConvexDepositToken: import("..").Token;
                readonly rewardsAddress: Address;
                toString(): string;
            };
            depositAndStakeAction: import("../action/Convex").ConvexDepositAndStake;
            unstakeAndWithdrawAction: import("../action/Convex").ConvexUnstakeAndWithdraw;
        }>;
        makeStkConvexSourcingRule: (depositAndStake: import("../action/Action").BaseAction) => import("../searcher/SourcingRule").SourcingRule;
        convexBoosterAddress: Address;
    } | null;
}>;
//# sourceMappingURL=setupEthereumZapper.d.ts.map