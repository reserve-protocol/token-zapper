import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'

import { Approval } from '../base/Approval'
import { IBeefyVault, IBeefyVault__factory } from '../contracts'
import { Planner, Value } from '../tx-gen/Planner'
import { Address } from '../base/Address'

const rescaleToken = new Set<Address>([
  Address.from('0xbba4d1cecc111bdc74bd2f95050fb11acb3b8a5e'),
  Address.from('0xe36cdbd69adf2f74c8ab987a1cfd448ae91fa153'),
  Address.from('0x562ea6fffd1293b9433e7b81a2682c31892ea013'),
])
abstract class BeefyBase extends Action('Beefy') {
  abstract get actionName(): string

  toString(): string {
    return `Beefy.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class BeefyDepositAction extends BeefyBase {
  private readonly contract: IBeefyVault
  public get actionName(): string {
    return 'deposit'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBeefyVault__factory.connect(
        this.mooToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0]), this.toString())

    return null
  }
  public get returnsOutput(): boolean {
    return false
  }

  public get dependsOnRpc() {
    return true
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const balance = (await this.contract.callStatic.balance()).toBigInt()
    const totalSupply = (
      await this.contract.callStatic.totalSupply()
    ).toBigInt()

    const outQty = (amountsIn.amount * totalSupply) / balance
    const out = this.mooToken.from(outQty)

    return [out]
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
    public readonly mooToken: Token,
    private readonly getRate: () => Promise<bigint>
  ) {
    super(
      mooToken.address,
      [underlying],
      [mooToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, mooToken.address)]
    )
    this.contract = IBeefyVault__factory.connect(
      this.mooToken.address.address,
      this.universe.provider
    )
  }
}

export class BeefyWithdrawAction extends BeefyBase {
  private readonly contract: IBeefyVault
  public get actionName(): string {
    return 'withdraw'
  }
  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(this.contract)
    planner.add(lib.withdraw(inputs[0]), this.toString())

    return null
  }

  public get returnsOutput(): boolean {
    return false
  }

  gasEstimate() {
    return BigInt(200000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.getRate()
    const outQty =
      (amountsIn.amount * this.underlying.scale * rate) /
      ONE /
      this.mooToken.scale

    if (rescaleToken.has(this.mooToken.address)) {
      const scaleUp = this.mooToken.scale / this.underlying.scale
      return [this.underlying.from(outQty * scaleUp)]
    }
    return [this.underlying.from(outQty)]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly mooToken: Token,
    private readonly getRate: () => Promise<bigint>
  ) {
    super(
      mooToken.address,
      [mooToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
    this.contract = IBeefyVault__factory.connect(
      this.mooToken.address.address,
      this.universe.provider
    )
  }
}
