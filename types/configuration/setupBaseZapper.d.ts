import { Address } from '../base/Address';
import { type Token } from '../entities/Token';
import { type BaseUniverse } from './base';
export declare const setupBaseZapper: (universe: BaseUniverse) => Promise<{
    uni: {
        dex: import("../aggregators/DexAggregator").DexRouter;
        addTradeAction: (inputToken: Token, outputToken: Token) => void;
    };
    curve: null;
    compV3: {
        readonly comets: {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: Token;
            readonly borrowToken: Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: Token;
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
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: Token;
                readonly borrowToken: Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: Token;
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
            readonly wrapperToken: Token;
            toString(): string;
        }[];
        readonly cometByBaseToken: Map<Token, {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: Token;
            readonly borrowToken: Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: Token;
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
        readonly cometByPoolToken: Map<Token, {
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: Token;
            readonly borrowToken: Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: Token;
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
        readonly cometWrapperByWrapperToken: Map<Token, {
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: Token;
                readonly borrowToken: Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: Token;
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
            readonly wrapperToken: Token;
            toString(): string;
        }>;
        readonly cometWrapperByCometToken: Map<Token, {
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: Token;
                readonly borrowToken: Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: Token;
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
            readonly wrapperToken: Token;
            toString(): string;
        }>;
        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
        getComet(poolToken: Token): Promise<{
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly mintAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: any;
                readonly actionName: string;
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometLibrary: import("../tx-gen/Planner").Contract;
            readonly compound: any;
            readonly comet: Token;
            readonly borrowToken: Token;
            readonly collateralTokens: {
                readonly offset: number;
                readonly asset: Token;
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
        getCometWrapper(wrapperToken: Token): Promise<{
            readonly mintAction: {
                readonly cometWrapper: any;
                toString(): string;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly burnAction: {
                readonly cometWrapper: any;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                planAction(planner: import("../tx-gen/Planner").Planner, _: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                toString(): string;
                readonly receiptToken: Token;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                gasEstimate(): bigint;
                readonly comet: {
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    readonly mintAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly burnAction: {
                        planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                        toString(): string;
                        quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        readonly receiptToken: Token;
                        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                        gasEstimate(): bigint;
                        readonly comet: any;
                        readonly actionName: string;
                        plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                        readonly protocol: string;
                        readonly gen: typeof import("../tx-gen/Planner");
                        readonly genUtils: {
                            planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                            erc20: {
                                transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                                balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                            };
                        };
                        outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                        readonly address: Address;
                        readonly inputToken: Token[];
                        readonly outputToken: Token[];
                        readonly interactionConvention: import("../action/Action").InteractionConvention;
                        readonly proceedsOptions: import("../action/Action").DestinationOptions;
                        readonly approvals: import("../base/Approval").Approval[];
                        quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                        exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                        readonly addToGraph: boolean;
                        readonly outputSlippage: bigint;
                    };
                    readonly cometLibrary: import("../tx-gen/Planner").Contract;
                    readonly compound: any;
                    readonly comet: Token;
                    readonly borrowToken: Token;
                    readonly collateralTokens: {
                        readonly offset: number;
                        readonly asset: Token;
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
                plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                readonly addToGraph: boolean;
                readonly outputSlippage: bigint;
            };
            readonly cometWrapperLibrary: import("../tx-gen/Planner").Contract;
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly cometToken: Token;
            readonly cometWrapperInst: import("../contracts").ICusdcV3Wrapper;
            readonly comet: {
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly mintAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly burnAction: {
                    planAction(planner: import("../tx-gen/Planner").Planner, destination: Address, input: import("../tx-gen/Planner").Value | null, predicted: import("../entities/Token").TokenQuantity): void;
                    toString(): string;
                    quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    readonly receiptToken: Token;
                    readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                    gasEstimate(): bigint;
                    readonly comet: any;
                    readonly actionName: string;
                    plan(planner: import("../tx-gen/Planner").Planner, [input]: import("../tx-gen/Planner").Value[], destination: Address, [predicted]: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                    readonly protocol: string;
                    readonly gen: typeof import("../tx-gen/Planner");
                    readonly genUtils: {
                        planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                        erc20: {
                            transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                            balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                        };
                    };
                    outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                    readonly address: Address;
                    readonly inputToken: Token[];
                    readonly outputToken: Token[];
                    readonly interactionConvention: import("../action/Action").InteractionConvention;
                    readonly proceedsOptions: import("../action/Action").DestinationOptions;
                    readonly approvals: import("../base/Approval").Approval[];
                    quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                    exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                    readonly addToGraph: boolean;
                    readonly outputSlippage: bigint;
                };
                readonly cometLibrary: import("../tx-gen/Planner").Contract;
                readonly compound: any;
                readonly comet: Token;
                readonly borrowToken: Token;
                readonly collateralTokens: {
                    readonly offset: number;
                    readonly asset: Token;
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
            readonly wrapperToken: Token;
            toString(): string;
        }>;
        toString(): string;
    };
    aaveV3: {
        readonly reserves: {
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: Token;
            readonly aToken: Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: Token;
            readonly intoAssets: (shares: import("../entities/Token").TokenQuantity) => Promise<import("../entities/Token").TokenQuantity>;
            toString(): string;
        }[];
        readonly tokenToReserve: Map<Token, {
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: Token;
            readonly aToken: Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: Token;
            readonly intoAssets: (shares: import("../entities/Token").TokenQuantity) => Promise<import("../entities/Token").TokenQuantity>;
            toString(): string;
        }>;
        readonly addresss: Address;
        addReserve(token: Token): Promise<{
            readonly supply: {
                readonly outputSlippage: bigint;
                quote(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                gasEstimate(): bigint;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly withdraw: {
                readonly outputSlippage: bigint;
                gasEstimate(): bigint;
                quote([amountsIn]: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                plan(planner: import("../tx-gen/Planner").Planner, inputs: import("../tx-gen/Planner").Value[], destination: Address, predictedInputs: import("../entities/Token").TokenQuantity[]): Promise<import("../tx-gen/Planner").Value[]>;
                readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
                readonly reserve: any;
                readonly protocol: string;
                readonly gen: typeof import("../tx-gen/Planner");
                readonly genUtils: {
                    planForwardERC20(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, amount: import("../tx-gen/Planner").Value, destination: Address): void;
                    erc20: {
                        transfer(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, amount: import("../tx-gen/Planner").Value, token: Token, destination: Address): void;
                        balanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner, token: Token, owner: Address, comment?: string | undefined, varName?: string | undefined): import("../tx-gen/Planner").Value;
                    };
                };
                outputBalanceOf(universe: import("..").Universe<import("./ChainConfiguration").Config>, planner: import("../tx-gen/Planner").Planner): import("../tx-gen/Planner").Value[];
                readonly address: Address;
                readonly inputToken: Token[];
                readonly outputToken: Token[];
                readonly interactionConvention: import("../action/Action").InteractionConvention;
                readonly proceedsOptions: import("../action/Action").DestinationOptions;
                readonly approvals: import("../base/Approval").Approval[];
                quoteWithSlippage(amountsIn: import("../entities/Token").TokenQuantity[]): Promise<import("../entities/Token").TokenQuantity[]>;
                exchange(amountsIn: import("../entities/Token").TokenQuantity[], balances: import("../entities/TokenAmounts").TokenAmounts): Promise<void>;
                toString(): string;
                readonly addToGraph: boolean;
            };
            readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
            readonly poolInst: import("../contracts").IPool;
            readonly aave: any;
            readonly reserveData: import("../contracts/contracts/AaveV3.sol/IPool").DataTypes.ReserveDataStruct;
            readonly reserveToken: Token;
            readonly aToken: Token;
            readonly aTokenInst: import("../contracts").IAToken;
            readonly variableDebtToken: Token;
            readonly intoAssets: (shares: import("../entities/Token").TokenQuantity) => Promise<import("../entities/Token").TokenQuantity>;
            toString(): string;
        }>;
        readonly poolInst: import("../contracts").IPool;
        readonly universe: import("..").Universe<import("./ChainConfiguration").Config>;
        toString(): string;
        addWrapper(wrapper: Token): Promise<void>;
    };
}>;
//# sourceMappingURL=setupBaseZapper.d.ts.map