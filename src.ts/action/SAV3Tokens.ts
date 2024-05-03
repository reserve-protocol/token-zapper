import { type Universe } from '../Universe'
import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { IStaticATokenV3LM__factory } from '../contracts/factories/contracts/AaveV3.sol/IStaticATokenV3LM__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

const ray = 10n ** 27n
const halfRay = ray / 2n
const rayMul = (a: bigint, b: bigint) => {
  return (halfRay + a * b) / ray
}
function rayDiv(a: bigint, b: bigint): bigint {
  const halfB = b / 2n
  return (halfB + a * ray) / b
}
export class MintSAV3TokensAction extends Action('AaveV3') {
  get outputSlippage() {
    return 1n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ) {
    const inp = inputs[0] ?? predicted[0].amount
    const lib = this.gen.Contract.createContract(
      IStaticATokenV3LM__factory.connect(
        this.outputToken[0].address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.deposit(
        inp,
        this.universe.execAddress.address,
        0,
        true
      ),
      `AaveV3 mint: ${predicted.join(', ')} -> ${await this.quote(predicted)}`
    )
    return this.outputBalanceOf(this.universe, planner)
  }
  gasEstimate() {
    return BigInt(300000n)
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    const x = rayDiv(amountsIn.into(this.saToken).amount, this.rate.value)
    return [this.saToken.fromBigInt(x)]
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
    return `SAV3TokenMint(${this.saToken.toString()})`
  }
}
export class BurnSAV3TokensAction extends Action('AaveV3') {
  get outputSlippage() {
    return 1n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(
      IStaticATokenV3LM__factory.connect(
        this.inputToken[0].address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.redeem(
        inputs[0],
        destination.address,
        this.universe.execAddress.address,
        true
      ),
      `AaveV3 burn: ${predicted.join(', ')} -> ${await this.quote(predicted)}`
    )
    return this.outputBalanceOf(this.universe, planner)
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
    return `SAV3TokenBurn(${this.saToken.toString()})`
  }
}
