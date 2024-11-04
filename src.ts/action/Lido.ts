import { ParamType } from '@ethersproject/abi'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'

import {
  IStETH,
  IStETH__factory,
  IWrappedNative__factory,
  ZapperExecutor__factory,
} from '../contracts'
import { type IWStETH } from '../contracts/contracts/IWStETH'
import { IWStETH__factory } from '../contracts/factories/contracts/IWStETH__factory'

import { type Token, type TokenQuantity } from '../entities/Token'
import * as gen from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'
import { constants } from 'ethers'
import { DepositAction, WithdrawAction } from './WrappedNative'

export class LidoDeployment {
  public readonly contracts: {
    wstethInstance: IWStETH
    stethInstance: IStETH
  }
  public readonly weiroll: {
    wstethInstance: gen.Contract
    stethInstance: gen.Contract
    weth: gen.Contract
  }
  private rateCache: BlockCache<TokenQuantity, TokenQuantity>

  public readonly actions: {
    stake: {
      eth: BaseStETHAction
      // weth: BaseAction
    }
    wrap: {
      steth: BaseWSTETHAction
    }
    unwrap: {
      stEth: BaseWSTETHAction
    }
  }
  constructor(
    public readonly universe: Universe,
    public readonly steth: Token,
    public readonly wsteth: Token
  ) {
    this.contracts = {
      wstethInstance: IWStETH__factory.connect(
        wsteth.address.address,
        universe.provider
      ),
      stethInstance: IStETH__factory.connect(
        steth.address.address,
        universe.provider
      ),
    }
    this.weiroll = {
      wstethInstance: gen.Contract.createContract(
        this.contracts.wstethInstance
      ),
      stethInstance: gen.Contract.createContract(this.contracts.stethInstance),
      weth: gen.Contract.createContract(
        IWrappedNative__factory.connect(
          universe.wrappedNativeToken.address.address,
          universe.provider
        )
      ),
    }
    this.rateCache = universe.createCache(async (qty) => {
      if (qty.token === wsteth) {
        return await this.quoteBurn_(qty)
      } else {
        return await this.quoteMint_(qty)
      }
    })

    const wrap = new STETHToWSTETH(this)
    const unwrap = new WSTETHToSTETH(this)
    const stake = new ETHToSTETH(this)
    // const unwrapWeth = new WithdrawAction(universe, universe.wrappedNativeToken)

    // const stakeFromWETH = new (unwrapWeth.combine(stake))(universe)

    universe.defineMintable(wrap, unwrap, true)
    universe.addAction(stake, steth.address)
    // universe.addAction(stakeFromWETH, steth.address)

    this.actions = {
      stake: {
        eth: stake,
        // weth: stakeFromWETH,
      },
      wrap: {
        steth: wrap,
      },
      unwrap: {
        stEth: unwrap,
      },
    }
  }

  public async quoteWrap(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return await this.rateCache.get(amountsIn)
  }
  public async quoteUnwrap(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return await this.rateCache.get(amountsIn)
  }

  private async quoteMint_(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    const out = (
      await this.contracts.wstethInstance.callStatic.getWstETHByStETH(
        amountsIn.amount
      )
    ).toBigInt()
    return this.wsteth.from(out)
  }

  private async quoteBurn_(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    const out = await this.contracts.wstethInstance.callStatic.getStETHByWstETH(
      amountsIn.amount
    )
    return this.steth.from(out)
  }

  public static async load(
    universe: Universe,
    config: {
      steth: string
      wsteth: string
    }
  ): Promise<LidoDeployment> {
    const [steth, wsteth] = await Promise.all([
      universe.getToken(Address.from(config.steth)),
      universe.getToken(Address.from(config.wsteth)),
    ])
    return new LidoDeployment(universe, steth, wsteth)
  }
}

abstract class BaseLidoAction extends Action('Lido') {
  abstract get actionName(): string
  get oneUsePrZap() {
    return false
  }
  get supportsDynamicInput() {
    return true
  }
  get returnsOutput() {
    return false
  }
  async plan(
    planner: gen.Planner,
    inputs: gen.Value[],
    _: Address,
    __: TokenQuantity[]
  ) {
    const input = inputs[0]
    const out = planner.add(this.planAction(input))
    if (out == null) {
      throw new Error('Failed to plan action')
    }
    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.quoteAction(amountsIn)]
  }

  abstract planAction(inputs: gen.Value): gen.FunctionCall
  abstract quoteAction(inputs: TokenQuantity): Promise<TokenQuantity>

  toString(): string {
    return `Lido(${this.inputToken[0]}.${this.actionName} -> ${this.outputToken[0]})`
  }
}

abstract class BaseStETHAction extends BaseLidoAction {
  get outputSlippage() {
    return 0n
  }
  public async quoteAction(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return this.output.from(amountsIn.amount - 1n)
  }
  gasEstimate() {
    return BigInt(175000n)
  }
  constructor(
    readonly lido: LidoDeployment,
    readonly input: Token,
    readonly output: Token
  ) {
    super(
      output.address,
      [input],
      [output],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class ETHToSTETH extends BaseStETHAction {
  get actionName() {
    return 'submit'
  }
  get outputSlippage() {
    return 0n
  }
  get returnsOutput() {
    return false
  }
  get supportsDynamicInput() {
    return true
  }
  get oneUsePrZap() {
    return false
  }
  planAction(input: gen.Value) {
    return this.lido.weiroll.stethInstance
      .submit(constants.AddressZero)
      .withValue(input)
  }
  constructor(readonly lido: LidoDeployment) {
    super(lido, lido.universe.nativeToken, lido.steth)
  }
}

abstract class BaseWSTETHAction extends BaseLidoAction {
  get outputSlippage() {
    return 0n
  }
  get returnsOutput() {
    return true
  }
  get supportsDynamicInput() {
    return true
  }
  get oneUsePrZap() {
    return false
  }
  gasEstimate() {
    return BigInt(175000n)
  }

  abstract planAction(inputs: gen.Value): gen.FunctionCall
  abstract quoteAction(inputs: TokenQuantity): Promise<TokenQuantity>

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.quoteAction(amountsIn)]
  }
  constructor(
    readonly lido: LidoDeployment,
    readonly input: Token,
    readonly output: Token
  ) {
    super(
      output.address,
      [input],
      [output],
      input === lido.steth
        ? InteractionConvention.ApprovalRequired
        : InteractionConvention.None,
      DestinationOptions.Callee,
      input === lido.steth ? [new Approval(input, output.address)] : []
    )
  }
}

class STETHToWSTETH extends BaseWSTETHAction {
  get actionName() {
    return 'wrap'
  }
  planAction(input: gen.Value) {
    return this.lido.weiroll.wstethInstance.wrap(input)
  }
  async quoteAction(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return await this.lido.quoteWrap(amountsIn)
  }
  constructor(readonly lido: LidoDeployment) {
    super(lido, lido.steth, lido.wsteth)
  }
}

class WSTETHToSTETH extends BaseWSTETHAction {
  get actionName() {
    return 'unwrap'
  }
  planAction(input: gen.Value) {
    return this.lido.weiroll.wstethInstance.unwrap(input)
  }
  async quoteAction(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return await this.lido.quoteUnwrap(amountsIn)
  }
  constructor(readonly lido: LidoDeployment) {
    super(lido, lido.wsteth, lido.steth)
  }
}
