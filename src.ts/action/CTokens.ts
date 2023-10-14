
import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { ICToken__factory } from '../contracts/factories/contracts/ICToken.sol/ICToken__factory'
import { CEther__factory } from '../contracts/factories/contracts/ICToken.sol/CEther__factory'

const iCTokenInterface = ICToken__factory.createInterface()
const iCEtherInterface = CEther__factory.createInterface()

const ONEFP18 = 10n ** 18n

export class MintCTokenAction extends Action {
  gasEstimate() {
    return BigInt(175000n)
  }
  private readonly rateScale: bigint
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    if (this.underlying === this.universe.nativeToken) {
      return new ContractCall(
        parseHexStringIntoBuffer(iCEtherInterface.encodeFunctionData('mint')),
        this.cToken.address,
        amountsIn.amount,
        this.gasEstimate(),
        'Mint CEther'
      )
    }

    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenInterface.encodeFunctionData('mint', [amountsIn.amount])
      ),
      this.cToken.address,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} into ${this.cToken.symbol}`
    )
  }
  
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    let out = (amountsIn.amount * this.rateScale) / this.rate.value / this.underlying.scale
    out = out - out / 3_000_000n;
    return [
      this.cToken.fromBigInt(
        out
      ),
    ]
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
    this.rateScale = ONEFP18 * underlying.scale
  }

  toString(): string {
    return `CTokenMint(${this.cToken.toString()})`
  }
}

export class BurnCTokenAction extends Action {
  gasEstimate() {
    return BigInt(175000n)
  }
  private readonly rateScale: bigint
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        iCTokenInterface.encodeFunctionData('redeem', [amountsIn.amount])
      ),
      this.cToken.address,
      0n,
      this.gasEstimate(),
      'Burn ' + this.cToken.symbol,
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    await this.universe.refresh(this.address)
    let out = (amountsIn.amount * this.rate.value * this.underlying.scale) / this.rateScale
    out = out - 5n;
    // const fourDigits = 10n ** BigInt(this.underlying.decimals - 5)
    // out = (out / fourDigits) * fourDigits;


    return [
      this.underlying.fromBigInt(
        out
      ),
    ]
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
    this.rateScale = ONEFP18 * underlying.scale
  }
  toString(): string {
    return `CTokenBurn(${this.cToken.toString()})`
  }
}
