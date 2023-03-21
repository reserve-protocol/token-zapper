import { CEther__factory, ICToken__factory } from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'

const iCTokenInterface = ICToken__factory.createInterface()
const iCEtherInterface = CEther__factory.createInterface()

export class MintCTokenAction extends Action {
  private readonly rateScale: bigint
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    if (this.underlying === this.universe.nativeToken) {
      return new ContractCall(
        parseHexStringIntoBuffer(iCEtherInterface.encodeFunctionData('mint')),
        this.cToken.address,
        amountsIn.amount,
        'Mint CEther'
      )
    }

    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])
      ),
      this.cToken.address,
      0n,
      'Mint ' + this.cToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountsIn.fpDiv(this.rate.value, this.rateScale).convertTo(this.cToken)]
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
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, cToken.address)]
    )
    this.rateScale = cToken.scale * 10n ** 10n
  }

  toString(): string {
    return `CTokenMint(${this.cToken.toString()})`
  }
}

export class BurnCTokenAction extends Action {
  private readonly rateScale: bigint
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])
      ),
      this.cToken.address,
      0n,
      'Burn ' + this.cToken.symbol
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountsIn.fpMul(this.rate.value, this.rateScale).convertTo(this.underlying)]
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
      DestinationOptions.Recipient,
      []
    )
    this.rateScale = cToken.scale * 10n ** 10n
  }
  toString(): string {
    return `CTokenBurn(${this.cToken.toString()})`
  }
}
