import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { constants } from 'ethers'
import { IStETH__factory } from '../contracts/factories/contracts/IStETH__factory'
import { Planner, Value } from '../tx-gen/Planner'

export class StETHRateProvider {
  constructor(readonly universe: Universe, readonly steth: Token) {}

  async quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return this.steth.from(amountsIn.amount)
  }
  async quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return this.universe.nativeToken.from(amountsIn.amount)
  }
}

export class MintStETH extends Action('Lido') {
  async plan(planner: Planner, inputs: Value[]) {
    const wsteth = this.gen.Contract.createContract(
      IStETH__factory.connect(
        this.steth.address.address,
        this.universe.provider
      )
    )

    planner.add(wsteth.submit(constants.AddressZero).withValue(inputs[0]))
    const out = this.genUtils.erc20.balanceOf(
      this.universe,
      planner,
      this.outputToken[0],
      this.universe.config.addresses.executorAddress
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteMint(amountsIn)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly rateProvider: Pick<StETHRateProvider, 'quoteMint'>
  ) {
    super(
      steth.address,
      [universe.nativeToken],
      [steth],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return 'StETHMint()'
  }
}

export class BurnStETH extends Action('Lido') {
  gasEstimate() {
    return BigInt(500000n)
  }
  async plan(planner: Planner, inputs: Value[]): Promise<Value[]> {
    throw new Error('Not implemented')
  }

  async quote([qty]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteBurn(qty)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly rateProvider: Pick<StETHRateProvider, 'quoteBurn'>
  ) {
    super(
      steth.address,
      [steth],
      [universe.nativeToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return 'BurnStETH()'
  }

  /**
   * Prevents this edge of being picked up by the graph searcher, but it can still be used
   * by the zapper.
   */
  get addToGraph() {
    return false
  }
}
