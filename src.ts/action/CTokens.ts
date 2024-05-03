import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { CEther__factory } from '../contracts/factories/contracts/ICToken.sol/CEther__factory'
import { ICToken__factory } from '../contracts/factories/contracts/ICToken.sol/ICToken__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const ONEFP18 = 10n ** 18n

export class MintCTokenAction extends Action('CompoundV2') {
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPredicted]: TokenQuantity[]
  ): Promise<Value[]> {
    if (this.underlying === this.universe.nativeToken) {
      const lib = this.gen.Contract.createContract(
        CEther__factory.connect(
          this.cToken.address.address,
          this.universe.provider
        )
      )
      planner.add(lib.mint().withValue(input ?? inputPredicted.amount))
      return this.outputBalanceOf(this.universe, planner)
    }
    const lib = this.gen.Contract.createContract(
      ICToken__factory.connect(
        this.cToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.mint(input ?? inputPredicted.amount))

    return this.outputBalanceOf(this.universe, planner)
  }
  gasEstimate() {
    return BigInt(175000n)
  }
  private readonly rateScale: bigint

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    let out =
      (amountsIn.amount * this.rateScale) /
      this.rate.value /
      this.underlying.scale
    return [this.cToken.fromBigInt(out)]
  }

  get outputSlippage() {
    return 30n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly cToken: Token,
    private readonly rate: { value: bigint }
  ) {
    super(
      cToken.address,
      [underlying],
      [cToken],
      underlying === universe.nativeToken
        ? InteractionConvention.None
        : InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      underlying === universe.nativeToken
        ? []
        : [new Approval(underlying, cToken.address)]
    )
    this.rateScale = ONEFP18 * underlying.scale
  }

  toString(): string {
    return `CTokenMint(${this.cToken.toString()})`
  }
}

export class BurnCTokenAction extends Action('CompoundV2') {
  get outputSlippage() {
    return 30n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    dest: Address,
    [inputPredicted]: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      ICToken__factory.connect(
        this.cToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.redeem(input ?? inputPredicted.amount))
    return this.outputBalanceOf(this.universe, planner)
  }
  gasEstimate() {
    return BigInt(175000n)
  }
  private readonly rateScale: bigint

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    let out =
      (amountsIn.amount * this.rate.value * this.underlying.scale) /
      this.rateScale

    return [this.underlying.fromBigInt(out)]
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    readonly cToken: Token,
    private readonly rate: { value: bigint }
  ) {
    super(
      cToken.address,
      [cToken],
      [underlying],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
    this.rateScale = ONEFP18 * underlying.scale
  }
  toString(): string {
    return `CTokenBurn(${this.cToken.toString()})`
  }
}
