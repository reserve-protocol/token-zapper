import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
import {
  IChainlinkAggregator__factory,
  IFrxEthFraxOracle__factory,
  IWrappedNative__factory,
  IfrxETHMinter,
  IfrxETHMinter__factory,
} from '../contracts'

import * as gen from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  isMultiChoiceEdge,
} from '../action/Action'
import { UniverseWithERC20GasTokenDefined } from '../searcher/UniverseWithERC20GasTokenDefined'
import { ERC4626Deployment, setupERC4626 } from './setupERC4626'

import { PriceOracle } from '../oracles/PriceOracle'

abstract class BaseFrxETH extends Action('FrxETH') {
  public get supportsDynamicInput() {
    return true
  }
  public get oneUsePrZap() {
    return false
  }
  public get returnsOutput() {
    return false
  }
  get outputSlippage() {
    return 0n
  }
  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) => tok.into(this.outputToken[i]))
  }

  abstract get actionName(): string

  toString(): string {
    return `FrxETH.${this.actionName}(${this.inputToken.join(
      ','
    )} -> ${this.outputToken.join(',')})`
  }
}

interface IFrxETHConfig {
  minter: string
  frxeth: string
  sfrxeth: string
  frxethOracle: string
}

class FrxETH extends BaseFrxETH {
  gasEstimate(): bigint {
    return 100000n
  }
  constructor(
    private readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly frxeth: Token,
    public readonly minter: IfrxETHMinter
  ) {
    super(
      frxeth.address,
      [universe.wrappedNativeToken],
      [frxeth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  get actionName() {
    return 'FrxETH.mint'
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[] | null> {
    const lib = gen.Contract.createContract(this.minter)
    const inp = inputs[0] || predictedInputs[0].amount
    const wethlib = gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.universe.wrappedNativeToken.address.address,
        this.universe.provider
      )
    )

    planner.add(wethlib.withdraw(inp))
    planner.add(lib.submit(this.universe.execAddress.address).withValue(inp))
    return null
  }
}

class SFrxETHMint extends BaseFrxETH {
  gasEstimate(): bigint {
    return 100000n
  }
  constructor(
    private readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly sfrxeth: ERC4626Deployment,
    public readonly minter: IfrxETHMinter
  ) {
    super(
      sfrxeth.shareToken.address,
      [universe.wrappedNativeToken],
      [sfrxeth.shareToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  get actionName() {
    return 'FrxETH.mint'
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[] | null> {
    const lib = gen.Contract.createContract(this.minter)
    const inp = inputs[0] || predictedInputs[0].amount
    const wethlib = gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.universe.wrappedNativeToken.address.address,
        this.universe.provider
      )
    )

    planner.add(wethlib.withdraw(inp))
    planner.add(
      lib.submitAndDeposit(this.universe.execAddress.address).withValue(inp)
    )
    return null
  }
}

export const setupFrxETH = async (
  universe: UniverseWithERC20GasTokenDefined,
  config: IFrxETHConfig
) => {
  const poolInst = IfrxETHMinter__factory.connect(
    config.minter,
    universe.provider
  )

  const frxETH = await universe.getToken(Address.from(config.frxeth))

  const sfrxeth = await setupERC4626(universe, {
    protocol: 'FraxETH',
    vaultAddress: config.sfrxeth,
    slippage: 0n,
  })

  const oracle = IFrxEthFraxOracle__factory.connect(
    config.frxethOracle,
    universe.provider
  )
  const frxEthOracle = PriceOracle.createSingleTokenOracle(
    universe,
    frxETH,
    () =>
      oracle
        .getPrices()
        .then(([, low, high]) =>
          universe.wrappedNativeToken.fromBigInt(
            (low.toBigInt() + high.toBigInt()) / 2n
          )
        )
        .then((price) => universe.fairPrice(price).then((i) => i!))
  )
  universe.oracles.push(frxEthOracle)
  const sfrxEthOracle = PriceOracle.createSingleTokenOracle(
    universe,
    sfrxeth.shareToken,
    () =>
      sfrxeth.burn
        .quote([sfrxeth.shareToken.one])
        .then((o) =>
          frxEthOracle
            .quote(o[0].token)
            .then((i) => o[0].into(universe.usd).mul(i))
        )
  )
  universe.oracles.push(sfrxEthOracle)

  const frxETHToETH = await universe.createTradeEdge(
    frxETH,
    universe.wrappedNativeToken
  )!
  if (isMultiChoiceEdge(frxETHToETH)) {
    for (const edge of frxETHToETH.choices) {
      universe.addAction(edge)
    }
  } else {
    universe.addAction(frxETHToETH)
  }
}
