import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { Address } from '../base/Address'
import { IStargateRewardableWrapper__factory } from '../contracts/factories/contracts/IStargadeWrapper.sol/IStargateRewardableWrapper__factory'
import { Planner, Value } from '../tx-gen/Planner'

/**
 * Used to mint/burn wrapped stargate tokens
 * They mint/burn 1:1
 */
const vaultInterface = IStargateRewardableWrapper__factory.createInterface()

export class StargateWrapperDepositAction extends Action {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const wSGToken = this.gen.Contract.createLibrary(IStargateRewardableWrapper__factory.connect(
      this.stargateToken.address.address,
      this.universe.provider
    ))
    const out = planner.add(wSGToken.deposit(inputs[0], destination.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        vaultInterface.encodeFunctionData('deposit', [
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.stargateToken.address,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} into Stargate(${this.stargateToken.address}) vault receiving ${amountsIn.into(this.stargateToken)}`
    )
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

export class StargateWrapperWithdrawAction extends Action {
  gasEstimate() {
    return BigInt(200000n)
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const wSGToken = this.gen.Contract.createLibrary(IStargateRewardableWrapper__factory.connect(
      this.stargateToken.address.address,
      this.universe.provider
    ))
    const out = planner.add(wSGToken.withdraw(inputs[0], destination.address))

    return [out!]
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        vaultInterface.encodeFunctionData('withdraw', [
          amountsIn.amount,
          destination.address
        ])
      ),
      this.stargateToken.address,
      0n,
      this.gasEstimate(),
      `Withdraw ${amountsIn} from ERC4626(${this.stargateToken.address}) vault`
    )
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
