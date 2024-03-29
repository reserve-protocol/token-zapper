import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { AddressZero } from '@ethersproject/constants'
import { parseHexStringIntoBuffer } from '../base/utils'
import { IStETH__factory } from '../contracts/factories/contracts/IStETH__factory'
import { Planner, Value } from '../tx-gen/Planner'
import { Address } from '..'
import { constants } from 'ethers'

const stETHInterface = IStETH__factory.createInterface()
export class StETHRateProvider {
  constructor(readonly universe: Universe, readonly steth: Token) {}

  async quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return this.steth.from(amountsIn.amount)
  }
  async quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    return this.universe.nativeToken.from(amountsIn.amount)
  }
}

export class MintStETH extends Action {
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
      this.output[0],
      this.universe.config.addresses.executorAddress
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    const hexEncodedWrapCall = stETHInterface.encodeFunctionData('submit', [
      AddressZero,
    ])
    return new ContractCall(
      parseHexStringIntoBuffer(hexEncodedWrapCall),
      this.steth.address,
      amountsIn.amount,
      this.gasEstimate(),
      'Mint stETH'
    )
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

export class BurnStETH extends Action {
  gasEstimate() {
    return BigInt(0n)
  }
  async encode(_: TokenQuantity[]): Promise<ContractCall> {
    throw new Error('Not implemented')
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
