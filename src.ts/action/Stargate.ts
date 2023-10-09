import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { Address } from '../base/Address'
import { IStargateRouter__factory } from '../contracts'

/**
 * Used to mint/burn stargate LP tokens
 * They mint/burn 1:1
 */
const routerInterface = IStargateRouter__factory.createInterface()

export class StargateDepositAction extends Action {
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        routerInterface.encodeFunctionData('addLiquidity', [
          this.poolId,
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.router,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} into Stargate via router (${this.router}) receiving ${amountsIn.into(this.stargateToken)}`
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
    readonly stargateToken: Token,
    readonly poolId: number,
    readonly router: Address
  ) {
    super(
      stargateToken.address,
      [underlying],
      [stargateToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, router)]
    )
  }

  toString(): string {
    return `StargateDeposit(${this.stargateToken.toString()})`
  }
}

export class StargateWithdrawAction extends Action {
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        routerInterface.encodeFunctionData('instantRedeemLocal', [
          this.poolId,
          amountsIn.amount,
          destination.address
        ])
      ),
      this.router,
      0n,
      this.gasEstimate(),
      `Redeem ${amountsIn} from Stargate via router (${this.router}) receiving ${amountsIn.into(this.underlying)}`
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
    readonly stargateToken: Token,
    readonly poolId: number,
    readonly router: Address
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
    return `StargateWithdraw(${this.stargateToken.toString()})`
  }
}
