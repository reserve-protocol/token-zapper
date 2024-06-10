import { Address } from '../base/Address'
import { TokenQuantity, type Token } from '../entities/Token'
import {
  IChainlinkAggregator__factory,
  IERC4626,
  IERC4626__factory,
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

class FrxETHMint extends BaseFrxETH {
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
      [universe.nativeToken],
      [frxeth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  get actionName() {
    return 'FrxETH.mint'
  }
  get outputSlippage(): bigint {
    return 0n
  }
  get oneUsePrZap(): boolean {
    return false
  }
  get returnsOutput(): boolean {
    return false
  }

  quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return Promise.resolve([
      this.frxeth.from(
        amountsIn[0].amount
      )
    ])
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[] | null> {
    const lib = gen.Contract.createContract(this.minter)
    const inp = inputs[0] || predictedInputs[0].amount
    planner.add(lib.submit(this.universe.execAddress.address).withValue(inp))
    return null
  }
}

class SFrxETHMint extends BaseFrxETH {
  gasEstimate(): bigint {
    return 100000n
  }
  get outputSlippage(): bigint {
    return 1n
  }
  constructor(
    private readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly frxeth: Token,
    public readonly sfrxeth: Token,
    public readonly vault: IERC4626
  ) {
    super(
      sfrxeth.address,
      [frxeth],
      [sfrxeth],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      []
    )
  }
  get actionName() {
    return 'FrxETH.mint'
  }

  public get returnsOutput(): boolean {
    return false
  }

  public get oneUsePrZap(): boolean {
    return false
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[] | null> {
    const lib = gen.Contract.createContract(this.vault)
    const inp = inputs[0] || predictedInputs[0].amount
    planner.add(
      lib.deposit(inp, this.universe.execAddress.address)
    )
    return null
  }

  async quote(amountsIn: TokenQuantity[]) {
    return [
      this.sfrxeth.from(
        await this.vault.previewDeposit(amountsIn[0].amount))
    ]
  }
}

class SFrxETHburn extends BaseFrxETH {
  gasEstimate(): bigint {
    return 100000n
  }
  get outputSlippage(): bigint {
    return 0n
  }
  constructor(
    private readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly frxeth: Token,
    public readonly sfrxeth: Token,
    public readonly vault: IERC4626
  ) {
    super(
      sfrxeth.address,
      [sfrxeth],
      [frxeth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  get actionName() {
    return 'FrxETH.burn'
  }

  public get returnsOutput(): boolean {
    return false
  }

  public get oneUsePrZap(): boolean {
    return false
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[] | null> {
    const lib = gen.Contract.createContract(this.vault)
    const inp = inputs[0] || predictedInputs[0].amount
    planner.add(
      lib.redeem(
        inp,
        this.universe.execAddress.address
      )
    )
    return null
  }

  async quote(amountsIn: TokenQuantity[]) {
    return [
      this.frxeth.from(
        await this.vault.previewRedeem(amountsIn[0].amount))
    ]
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
  const vaultInst = IERC4626__factory.connect(
    config.sfrxeth,
    universe.provider
  )

  const frxETH = await universe.getToken(Address.from(config.frxeth))
  const sfrxETH = await universe.getToken(Address.from(config.sfrxeth))

  const mintSfrxETH = new SFrxETHMint(
    universe,
    frxETH,
    sfrxETH,
    vaultInst
  )

  const mintFrxETH = new FrxETHMint(
    universe,
    frxETH,
    poolInst
  )

  const burnSfrxETH = new SFrxETHburn(
    universe,
    frxETH,
    sfrxETH,
    vaultInst
  )

  universe.defineMintable(
    mintSfrxETH,
    burnSfrxETH,
    true
  )

  universe.addAction(mintFrxETH)

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
    sfrxETH,
    () =>
      burnSfrxETH
        .quote([sfrxETH.one])
        .then((o) =>
          frxEthOracle
            .quote(o[0].token)
            .then((i) => o[0].into(universe.usd).mul(i))
        )
  )
  universe.oracles.push(sfrxEthOracle)
}
