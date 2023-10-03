import { type Universe } from '../Universe'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { type IWStETH } from '../contracts/contracts/IWStETH'
import { IWStETH__factory } from '../contracts/factories/contracts/IWStETH__factory'

import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const wstETHInterface = IWStETH__factory.createInterface()
export class WStETHRateProvider {
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
    const out = await this.wstethInstance.callStatic.getWstETHByStETH(
      amountsIn.amount
    )
    return this.wsteth.from(out)
  }

  async quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity> {
    const out = await this.wstethInstance.callStatic.getStETHByWstETH(
      amountsIn.amount
    )
    return this.steth.from(out)
  }
}

export class MintWStETH extends Action {
  gasEstimate() {
    return BigInt(175000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('wrap', [
      amountsIn.amount,
    ])
    return new ContractCall(
      parseHexStringIntoBuffer(hexEncodedWrapCall),
      this.wsteth.address,
      0n,
      this.gasEstimate(),
      'Mint wstETH'
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteMint(amountsIn)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly wsteth: Token,
    readonly rateProvider: Pick<WStETHRateProvider, "quoteMint">
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

export class BurnWStETH extends Action {
  gasEstimate() {
    return BigInt(175000n)
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    const hexEncodedWrapCall = wstETHInterface.encodeFunctionData('unwrap', [
      amountsIn.amount,
    ])
    return new ContractCall(
      parseHexStringIntoBuffer(hexEncodedWrapCall),
      this.wsteth.address,
      0n,
      this.gasEstimate(),
      'Mint wstETH'
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.rateProvider.quoteBurn(amountsIn)]
  }

  constructor(
    readonly universe: Universe,
    readonly steth: Token,
    readonly wsteth: Token,
    readonly rateProvider: Pick<WStETHRateProvider, "quoteBurn">
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
