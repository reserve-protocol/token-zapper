import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "../../../common";
export interface CurveRouterInterface extends utils.Interface {
    functions: {
        "exchange_multiple(address[9],uint256[3][4],uint256,uint256,address[4])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "exchange_multiple"): FunctionFragment;
    encodeFunctionData(functionFragment: "exchange_multiple", values: [
        PromiseOrValue<string>[],
        [
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ]
        ],
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        [
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>
        ]
    ]): string;
    decodeFunctionResult(functionFragment: "exchange_multiple", data: BytesLike): Result;
    events: {};
}
export interface CurveRouter extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: CurveRouterInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        exchange_multiple(_route: PromiseOrValue<string>[], _swap_params: [
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ]
        ], _amount: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, _pools: [
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>
        ], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    exchange_multiple(_route: PromiseOrValue<string>[], _swap_params: [
        [
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>
        ],
        [
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>
        ],
        [
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>
        ],
        [
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>,
            PromiseOrValue<BigNumberish>
        ]
    ], _amount: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, _pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
    ], overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        exchange_multiple(_route: PromiseOrValue<string>[], _swap_params: [
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ]
        ], _amount: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, _pools: [
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>
        ], overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        exchange_multiple(_route: PromiseOrValue<string>[], _swap_params: [
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ]
        ], _amount: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, _pools: [
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>
        ], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        exchange_multiple(_route: PromiseOrValue<string>[], _swap_params: [
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ],
            [
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>,
                PromiseOrValue<BigNumberish>
            ]
        ], _amount: PromiseOrValue<BigNumberish>, _expected: PromiseOrValue<BigNumberish>, _pools: [
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>,
            PromiseOrValue<string>
        ], overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
