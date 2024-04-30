import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'

import { Approval } from '../base/Approval'
import { Address } from '../base/Address'
import { IStargateRewardableWrapper__factory } from '../contracts/factories/contracts/IStargadeWrapper.sol/IStargateRewardableWrapper__factory'
import { Planner, Value } from '../tx-gen/Planner'

/**
 * Used to mint/burn wrapped stargate tokens
 * They mint/burn 1:1
 */
const vaultInterface = IStargateRewardableWrapper__factory.createInterface()

export class StargateWrapperDepositAction extends Action("ReserveWrapper(Stargate)") {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory.connect(
      this.stargateToken.address.address,
      this.universe.provider
    ))
    const out = planner.add(wSGToken.deposit(inputs[0], destination.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.stargateToken.from(
        amountsIn.amount
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly stargateToken: Token
  ) {
    super(
      stargateToken.address,
      [underlying],
      [stargateToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, stargateToken.address)]
    )
  }

  toString(): string {
    return `StargateWrapperDeposit(${this.stargateToken.toString()})`
  }
}

export class StargateWrapperWithdrawAction extends Action("ReserveWrapper(Stargate)") {
  gasEstimate() {
    return BigInt(200000n)
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const wSGToken = this.gen.Contract.createContract(IStargateRewardableWrapper__factory.connect(
      this.stargateToken.address.address,
      this.universe.provider
    ))
    planner.add(wSGToken.withdraw(inputs[0], destination.address))

    return this.outputBalanceOf(this.universe, planner)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.underlying.from(
        amountsIn.amount
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly stargateToken: Token
  ) {
    super(
      stargateToken.address,
      [stargateToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `StargateWrapperWithdraw(${this.stargateToken.toString()})`
  }
}
