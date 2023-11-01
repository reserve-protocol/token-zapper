import { type Address } from '../base/Address'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { DestinationOptions, Action, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { IStaticATokenLM__factory } from '../contracts/factories/contracts/ISAtoken.sol/IStaticATokenLM__factory'

const ray = 10n ** 27n
const halfRay = ray / 2n
const rayMul = (a: bigint, b: bigint) => {
  return (halfRay + a * b) / ray
}
function rayDiv(a: bigint, b: bigint): bigint {
  const halfB = b / 2n
  return (halfB + a * ray) / b
}
const saTokenInterface = IStaticATokenLM__factory.createInterface()
export class MintSATokensAction extends Action {
  get outputSlippage() {
    return 3000000n;
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
          destination.address,
          amountsIn.amount,
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
      DestinationOptions.Recipient,
      [new Approval(underlying, saToken.address)]
    )
  }

  toString(): string {
    return `SATokenMint(${this.saToken.toString()})`
  }
}
export class BurnSATokensAction extends Action {

  get outputSlippage() {
    return 3000000n;
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
          destination.address,
          amountsIn.amount,
          true,
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
    return `SATokenBurn(${this.saToken.toString()})`
  }
}
