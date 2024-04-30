import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

import { Approval } from '../base/Approval'
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory'
import { Planner, Value } from '../tx-gen/Planner'
import { rayDiv, rayMul } from './aaveMath'

export class MintSATokensAction extends Action('AaveV2') {
  get outputSlippage() {
    return 1n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [predicted]: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(
      IStaticATokenLM__factory.connect(
        this.saToken.address.address,
        this.universe.provider
      )
    )
    const out = planner.add(
      lib.deposit(
        this.universe.execAddress.address,
        input ?? predicted.amount,
        0,
        true
      ),
      undefined,
      `bal_${this.outputToken[0].symbol}`
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(300000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    return [
      this.saToken.fromBigInt(
        rayDiv(amountsIn.into(this.saToken).amount, this.rate.value)
      ),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly saToken: Token,
    private readonly rate: { value: bigint }
  ) {
    super(
      saToken.address,
      [underlying],
      [saToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, saToken.address)]
    )
  }

  toString(): string {
    return `SATokenMint(${this.saToken.toString()})`
  }
}
export class BurnSATokensAction extends Action('AaveV2') {
  get outputSlippage() {
    return 1n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [predicted]: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(
      IStaticATokenLM__factory.connect(
        this.saToken.address.address,
        this.universe.provider
      )
    )
    const out = planner.add(
      lib.withdraw(
        this.universe.execAddress.address,
        input ?? predicted.amount,
        true
      ),
      undefined,
      `bal_${this.outputToken[0].symbol}`
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(300000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    return [
      this.saToken
        .fromBigInt(rayMul(amountsIn.amount, this.rate.value))
        .into(this.underlying),
    ]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly saToken: Token,
    private readonly rate: { value: bigint }
  ) {
    super(
      saToken.address,
      [saToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }

  toString(): string {
    return `SATokenBurn(${this.saToken.toString()})`
  }
}
