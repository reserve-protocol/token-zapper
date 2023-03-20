import { type Address } from '../base/Address'
import { IStaticATokenLM__factory } from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { DestinationOptions, Action, InteractionConvention } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'

const ray = 10n ** 27n
const halfRay = ray / 2n
const rayMul = (a: bigint, b: bigint) => {
  return (halfRay + a * b) / ray
}
function rayDiv (a: bigint, b: bigint): bigint {
  const halfB = b / 2n
  return (halfB + a * ray) / b
}
const saTokenInterface = IStaticATokenLM__factory.createInterface()
export class MintSATokensAction extends Action {
  async encode ([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(saTokenInterface.encodeFunctionData('deposit', [destination.address, amountsIn.amount, 0, true])),
      this.saToken.address,
      0n,
      'Mint ' + this.saToken.name
    )
  }

  async quote ([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.output[0].quantityFromBigInt(rayDiv(
      amountsIn.amount,
      this.rate
    ))]
  }

  constructor (
    readonly universe: Universe,
    readonly underlying: Token,
    readonly saToken: Token,
    private readonly rate: bigint
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
}
export class BurnSATokensAction extends Action {
  async encode ([amountsIn]: TokenQuantity[], destination: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(saTokenInterface.encodeFunctionData('withdraw', [destination.address, amountsIn.amount, true])),
      this.saToken.address,
      0n,
      'Burn ' + this.saToken.name
    )
  }

  async quote ([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.output[0].quantityFromBigInt(rayMul(
      amountsIn.amount,
      this.rate
    ))]
  }

  constructor (
    readonly universe: Universe,
    readonly underlying: Token,
    readonly saToken: Token,
    private readonly rate: bigint
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
}
