import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { parseHexStringIntoBuffer } from '../base/utils'
import { IERC4626__factory } from '../contracts/factories/contracts/IERC4626__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Planner, Value } from '../tx-gen/Planner'

const vaultInterface = IERC4626__factory.createInterface()

export class ERC4626TokenVault {
  constructor(
    public readonly shareToken: Token,
    public readonly underlying: Token,
  ) { }

  get address(): Address {
    return this.shareToken.address
  }
}

export class ERC4626DepositAction extends Action {
  get outputSlippage() {
    return 3000000n;
  }
  async plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(IERC4626__factory.connect(
      this.shareToken.address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.deposit(inputs[0], destination.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const x = (await IERC4626__factory.connect(
      this.shareToken.address.address,
      this.universe.provider
    ).previewDeposit(amountsIn.amount)).toBigInt()
    return [
      this.shareToken.from(
        x
      )
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly shareToken: Token
  ) {
    super(
      shareToken.address,
      [underlying],
      [shareToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, shareToken.address)]
    )
  }

  toString(): string {
    return `ERC4626Deposit(${this.shareToken.toString()})`
  }
}

export class ERC4626WithdrawAction extends Action {
  async plan(planner: Planner, inputs: Value[], destination: Address): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(IERC4626__factory.connect(
      this.shareToken.address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.redeem(inputs[0], destination.address, this.universe.config.addresses.executorAddress.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }
  
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.underlying.from(
        await IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        ).previewRedeem(amountsIn.amount)
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly shareToken: Token
  ) {
    super(
      shareToken.address,
      [shareToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Recipient,
      []
    )
  }
  toString(): string {
    return `ERC4626Withdraw(${this.shareToken.toString()})`
  }

  get outputSliptepage() {
    return 3000000n;
  }
}
