import { Address } from '../base/Address'
import {
  IERC4626,
  IERC4626__factory,
  IFrxEthFraxOracle__factory,
  IfrxETHMinter,
  IfrxETHMinter__factory,
} from '../contracts'
import { TokenQuantity, type Token } from '../entities/Token'

import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { UniverseWithERC20GasTokenDefined } from '../searcher/UniverseWithERC20GasTokenDefined'
import * as gen from '../tx-gen/Planner'

import { ParamType } from '@ethersproject/abi'
import { Approval } from '../base/Approval'
import { wrapAction, wrapGasToken } from '../searcher/TradeAction'

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
    return 1n
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
    return 50000n
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
  get oneUsePrZap(): boolean {
    return false
  }
  get returnsOutput(): boolean {
    return true
  }

  async quote(amountsIn: TokenQuantity[]) {
    return [this.frxeth.from(amountsIn[0].amount)]
  }

  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<gen.Value[]> {
    const lib = gen.Contract.createContract(this.minter)
    const inp =
      inputs[0] ||
      gen.encodeArg(predictedInputs[0].amount, ParamType.from('uint256'))
    planner.add(lib.submit().withValue(inp))!
    return [inp]
  }
}

class SFrxETHMint extends BaseFrxETH {
  private mintRate: () => Promise<TokenQuantity>

  gasEstimate(): bigint {
    return 100000n
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
      [new Approval(frxeth, Address.from(vault.address))]
    )
    this.mintRate = universe.createCachedProducer(async () => {
      const rate = frxeth.from(
        await vault.callStatic.previewDeposit(frxeth.one.amount)
      )
      return rate
    }, 12000)
  }
  get actionName() {
    return 'SFrxETH.mint'
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
    const inp =
      inputs[0] ||
      gen.encodeArg(predictedInputs[0].amount, ParamType.from('uint256'))

    planner.add(lib.deposit(inp, this.universe.execAddress.address))
    return null
  }

  async quote([amountsIn]: TokenQuantity[]) {
    const r = await this.mintRate()

    return [r.mul(amountsIn).into(this.sfrxeth)]
  }
}

class SFrxETHburn extends BaseFrxETH {
  private burnRate: () => Promise<TokenQuantity>
  gasEstimate(): bigint {
    return 100000n
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
    this.burnRate = universe.createCachedProducer(async () => {
      return frxeth.from(
        await vault.callStatic.previewRedeem(sfrxeth.one.amount)
      )
    }, 12000)
  }
  get actionName() {
    return 'SFrxETH.burn'
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
    const inp =
      inputs[0] ||
      gen.encodeArg(predictedInputs[0].amount, ParamType.from('uint256'))
    planner.add(
      lib.redeem(
        inp,
        this.universe.execAddress.address,
        this.universe.execAddress.address
      )
    )
    return null
  }

  async quote([amountIn]: TokenQuantity[]) {
    const r = await this.burnRate()
    return [r.mul(amountIn).into(this.frxeth)]
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
  const vaultInst = IERC4626__factory.connect(config.sfrxeth, universe.provider)

  const frxETH = await universe.getToken(Address.from(config.frxeth))
  const sfrxETH = await universe.getToken(Address.from(config.sfrxeth))

  const mintFrxETH = wrapGasToken(
    universe,
    new FrxETHMint(universe, frxETH, poolInst)
  )

  const burnSfrxETH = new SFrxETHburn(universe, frxETH, sfrxETH, vaultInst)
  const mintSfrxETH = new SFrxETHMint(universe, frxETH, sfrxETH, vaultInst)

  universe.defineMintable(mintSfrxETH, burnSfrxETH, true)

  universe.addAction(mintFrxETH)
  universe.mintableTokens.set(frxETH, mintFrxETH)

  const oracle = IFrxEthFraxOracle__factory.connect(
    config.frxethOracle,
    universe.provider
  )
  const frxEthOracle = universe.addSingleTokenPriceSource({
    token: frxETH,
    priceFn: async () => {
      const [, low, high] = await oracle.getPrices()
      const weth = universe.nativeToken.fromBigInt(
        (low.toBigInt() + high.toBigInt()) / 2n
      )
      const out = (await universe.fairPrice(weth)) ?? universe.usd.zero
      return out
    },
  })

  universe.addSingleTokenPriceSource({
    token: sfrxETH,
    priceFn: async () => {
      const out = await burnSfrxETH.quote([sfrxETH.one])
      const i = (await frxEthOracle.quote(out[0].token)) ?? universe.usd.zero
      const res = out[0].into(universe.usd).mul(i)
      return res
    },
  })
}
