import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'

import { ZapperExecutor__factory } from '../contracts'
import { type IWStETH } from '../contracts/contracts/IWStETH'
import { IWStETH__factory } from '../contracts/factories/contracts/IWStETH__factory'

import { type Token, type TokenQuantity } from '../entities/Token'
import * as gen from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class WStETHRateProvider {
  get outputSlippage() {
    return 0n
  }
  private wstethInstance: IWStETH
  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly wsteth: Token
  ) {
    this.wstethInstance = IWStETH__factory.connect(
      wsteth.address.address,
      universe.provider
    )
  }

  async quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    const out = (
      await this.wstethInstance.callStatic.getWstETHByStETH(amountsIn.amount)
    ).toBigInt()
    return this.wsteth.from(out)
  }

  async quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    const out = await this.wstethInstance.callStatic.getStETHByWstETH(
      amountsIn.amount
    )
    return this.steth.from(out)
  }
}

export class MintWStETH extends Action('WrappedStETH') {
  get outputSlippage() {
    return 0n
  }
  gasEstimate() {
    return BigInt(175000n)
  }

  async plan(planner: gen.Planner, inputs: gen.Value[]) {
    const zapperLib = gen.Contract.createContract(
      ZapperExecutor__factory.connect(
        this.universe.config.addresses.executorAddress.address,
        this.universe.provider
      )
    )
    const wsteth = gen.Contract.createContract(
      IWStETH__factory.connect(
        this.wsteth.address.address,
        this.universe.provider
      )
    )
    const input = planner.add(zapperLib.add(inputs[0], 1n))
    const out = planner.add(wsteth.wrap(input))
    return [out!]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteMint(amountsIn)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly wsteth: Token,
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteMint'>
  ) {
    super(
      wsteth.address,
      [steth],
      [wsteth],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(steth, wsteth.address)]
    )
  }

  toString(): string {
    return `WStETHMint(${this.wsteth.toString()})`
  }
}

export class BurnWStETH extends Action('WrappedStETH') {
  get outputSlippage() {
    return 0n
  }
  gasEstimate() {
    return BigInt(175000n)
  }
  async plan(planner: gen.Planner, inputs: gen.Value[]) {
    const wsteth = gen.Contract.createContract(
      IWStETH__factory.connect(
        this.wsteth.address.address,
        this.universe.provider
      )
    )
    const out = planner.add(wsteth.unwrap(inputs[0]))
    return [out!]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteBurn(amountsIn)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly wsteth: Token,
    readonly rateProvider: Pick<WStETHRateProvider, 'quoteBurn'>
  ) {
    super(
      wsteth.address,
      [wsteth],
      [steth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  toString(): string {
    return `WStETHBurn(${this.wsteth.toString()})`
  }
}
