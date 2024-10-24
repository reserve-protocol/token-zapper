import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IBeefyVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'

export class BeefyDepositAction extends Action('Beefy') {
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.inputToken[0].address.toString(),
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]))

    return null
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await IBeefyVault__factory.connect(
      this.inputToken[0].address.toString(),
      this.universe.provider
    ).callStatic.getPricePerFullShare()
    return [
      this.mooToken.from((amountsIn.amount * rate.toBigInt()) / 10n ** 18n),
    ]
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  get outputSlippage() {
    return 1n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly mooToken: Token
  ) {
    super(
      mooToken.address,
      [underlying],
      [mooToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, mooToken.address)]
    )
  }

  toString(): string {
    return `BeefyDeposit(${this.mooToken.toString()})`
  }
}

// export class StargateWithdrawAction extends Action('Stargate') {
//   async plan(planner: Planner, inputs: Value[], destination: Address) {
//     const lib = this.gen.Contract.createContract(
//       IStargateRouter__factory.connect(
//         this.router.address,
//         this.universe.provider
//       )
//     )
//     const out = planner.add(
//       lib.instantRedeemLocal(this.poolId, inputs[0], destination.address)
//     )!

//     return [out!]
//   }
//   gasEstimate() {
//     return BigInt(200000n)
//   }

//   async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     return [this.underlying.from(amountsIn.amount)]
//   }

//   constructor(
//     readonly universe: Universe,
//     readonly underlying: Token,
//     readonly stargateToken: Token,
//     readonly poolId: number,
//     readonly router: Address
//   ) {
//     super(
//       stargateToken.address,
//       [stargateToken],
//       [underlying],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Recipient,
//       []
//     )
//   }
//   toString(): string {
//     return `StargateWithdraw(${this.stargateToken.toString()})`
//   }
// }
