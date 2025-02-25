/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface ICurveRouterInterface extends utils.Interface {
  functions: {
    "exchange(address[11],uint256[5][5],uint256,uint256)": FunctionFragment;
    "exchange_multiple(address[9],uint256[3][4],uint256,uint256,address[4])": FunctionFragment;
    "get_dy(address[11],uint256[5][5],uint256,address[5])": FunctionFragment;
    "get_dy(address[11],uint256[5][5],uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "exchange"
      | "exchange_multiple"
      | "get_dy(address[11],uint256[5][5],uint256,address[5])"
      | "get_dy(address[11],uint256[5][5],uint256)"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "exchange",
    values: [
      PromiseOrValue<string>[],
      [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "exchange_multiple",
    values: [
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
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "get_dy(address[11],uint256[5][5],uint256,address[5])",
    values: [
      PromiseOrValue<string>[],
      [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      PromiseOrValue<BigNumberish>,
      [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "get_dy(address[11],uint256[5][5],uint256)",
    values: [
      PromiseOrValue<string>[],
      [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(functionFragment: "exchange", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "exchange_multiple",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "get_dy(address[11],uint256[5][5],uint256,address[5])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "get_dy(address[11],uint256[5][5],uint256)",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ICurveRouter extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICurveRouterInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    exchange(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exchange_multiple(
      route: PromiseOrValue<string>[],
      swapParams: [
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
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "get_dy(address[11],uint256[5][5],uint256,address[5])"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "get_dy(address[11],uint256[5][5],uint256)"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  exchange(
    route: PromiseOrValue<string>[],
    swapParams: [
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ]
    ],
    amount: PromiseOrValue<BigNumberish>,
    expected: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exchange_multiple(
    route: PromiseOrValue<string>[],
    swapParams: [
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
    amount: PromiseOrValue<BigNumberish>,
    expected: PromiseOrValue<BigNumberish>,
    pools: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "get_dy(address[11],uint256[5][5],uint256,address[5])"(
    route: PromiseOrValue<string>[],
    swapParams: [
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ]
    ],
    amount: PromiseOrValue<BigNumberish>,
    pools: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ],
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "get_dy(address[11],uint256[5][5],uint256)"(
    route: PromiseOrValue<string>[],
    swapParams: [
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ],
      [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
      ]
    ],
    amount: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    exchange(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exchange_multiple(
      route: PromiseOrValue<string>[],
      swapParams: [
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
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "get_dy(address[11],uint256[5][5],uint256,address[5])"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "get_dy(address[11],uint256[5][5],uint256)"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    exchange(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exchange_multiple(
      route: PromiseOrValue<string>[],
      swapParams: [
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
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "get_dy(address[11],uint256[5][5],uint256,address[5])"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "get_dy(address[11],uint256[5][5],uint256)"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    exchange(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exchange_multiple(
      route: PromiseOrValue<string>[],
      swapParams: [
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
      amount: PromiseOrValue<BigNumberish>,
      expected: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "get_dy(address[11],uint256[5][5],uint256,address[5])"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      pools: [
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<string>
      ],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "get_dy(address[11],uint256[5][5],uint256)"(
      route: PromiseOrValue<string>[],
      swapParams: [
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ],
        [
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>,
          PromiseOrValue<BigNumberish>
        ]
      ],
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
