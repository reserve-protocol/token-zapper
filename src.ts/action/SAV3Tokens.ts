import { type Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { DestinationOptions, Action, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { IStaticAV3TokenLM__factory } from '../contracts/factories/contracts/ISAV3Token.sol/IStaticAV3TokenLM__factory'
import { Planner, Value } from '../tx-gen/Planner'

const ray = 10n ** 27n
const halfRay = ray / 2n
const rayMul = (a: bigint, b: bigint) => {
  return (halfRay + a * b) / ray
}
function rayDiv(a: bigint, b: bigint): bigint {
  const halfB = b / 2n
  return (halfB + a * ray) / b
}
const saTokenInterface = IStaticAV3TokenLM__factory.createInterface()
export class MintSAV3TokensAction extends Action {
  get outputSlippage() {
    return 3000000n
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createLibrary(
      IStaticAV3TokenLM__factory.connect(
        this.input[0].address.address,
        this.universe.provider
      )
    )
    const out = planner.add(
      lib.deposit(inputs[0], destination.address, 0, true)
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(300000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        saTokenInterface.encodeFunctionData('deposit', [
          amountsIn.amount,
          destination.address,
          0,
          true,
        ])
      ),
      this.saToken.address,
      0n,
      this.gasEstimate(),
      `Mint(${this.saToken}, input: ${amountsIn}, destination: ${destination})`
    )
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
      DestinationOptions.Recipient,
      [new Approval(underlying, saToken.address)]
    )
  }

  toString(): string {
    return `SAV3TokenMint(${this.saToken.toString()})`
  }
}
export class BurnSAV3TokensAction extends Action {
  get outputSlippage() {
    return 3000000n
  }
  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createLibrary(
      IStaticAV3TokenLM__factory.connect(
        this.input[0].address.address,
        this.universe.provider
      )
    )
    const out = planner.add(
      lib.withdraw(
        inputs[0],
        destination.address,
        this.universe.config.addresses.executorAddress.address
      )
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(300000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        saTokenInterface.encodeFunctionData('withdraw', [
          amountsIn.amount,
          destination.address,
          this.universe.config.addresses.executorAddress.address,
        ])
      ),
      this.saToken.address,
      0n,
      this.gasEstimate(),
      'Burn ' + this.saToken.name
    )
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
      DestinationOptions.Recipient,
      []
    )
  }

  toString(): string {
    return `SAV3TokenBurn(${this.saToken.toString()})`
  }
}
