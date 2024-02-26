import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { Address } from '../base/Address'
import { IStargateRouter__factory, ZapperExecutor__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

/**
 * Used to mint/burn stargate LP tokens
 * They mint/burn 1:1
 */
const routerInterface = IStargateRouter__factory.createInterface()

export class StargateDepositAction extends Action {
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IStargateRouter__factory.connect(
        this.router.address,
        this.universe.provider
      )
    )
    planner.add(lib.addLiquidity(this.poolId, inputs[0], destination.address))

    return [
      this.genUtils.erc20.balanceOf(
        this.universe,
        planner,
        this.output[0],
        destination
      ),
    ]
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
        routerInterface.encodeFunctionData('addLiquidity', [
          this.poolId,
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.router,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} into Stargate via router (${
        this.router
      }) receiving ${amountsIn.into(this.stargateToken)}`
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    let slipapgeAmt = amountsIn.amount / 100000n
    if (slipapgeAmt <= 100n) {
      slipapgeAmt = 100n
    }
    return [this.stargateToken.from(amountsIn.amount - slipapgeAmt)]
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
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IStargateRouter__factory.connect(
        this.router.address,
        this.universe.provider
      )
    )
    const out = planner.add(
      lib.instantRedeemLocal(this.poolId, inputs[0], destination.address)
    )!

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
        routerInterface.encodeFunctionData('instantRedeemLocal', [
          this.poolId,
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.router,
      0n,
      this.gasEstimate(),
      `Redeem ${amountsIn} from Stargate via router (${
        this.router
      }) receiving ${amountsIn.into(this.underlying)}`
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.underlying.from(amountsIn.amount)]
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
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `StargateWithdraw(${this.stargateToken.toString()})`
  }
}
