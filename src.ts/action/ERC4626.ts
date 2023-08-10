import { type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { parseHexStringIntoBuffer } from '../base/utils'
import { InteractionConvention, DestinationOptions, Action } from './Action'
import { ContractCall } from '../base/ContractCall'
import { Approval } from '../base/Approval'
import { Address } from '../base/Address'
import { IERC4626__factory } from '../contracts/factories/IERC4626__factory'

const vaultInterface = IERC4626__factory.createInterface()

export class ERC4626TokenVault {
  constructor(
    public readonly shareToken: Token,
    public readonly underlying: Token,
  ) {}

  get address(): Address {
    return this.shareToken.address
  }
}

export class ERC4626DepositAction extends Action {
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        vaultInterface.encodeFunctionData('deposit', [
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.shareToken.address,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} into ERC4626(${this.shareToken.address}) vault`
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.shareToken.from(
        await IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        ).previewDeposit(amountsIn.amount)
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
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        vaultInterface.encodeFunctionData('withdraw', [
          amountsIn.amount,
          destination.address,
          this.universe.config.addresses.executorAddress.address,
        ])
      ),
      this.shareToken.address,
      0n,
      this.gasEstimate(),
      `Withdraw ${amountsIn} from ERC4626(${this.shareToken.address}) vault`
    )
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.shareToken.from(
        await IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        ).previewDeposit(amountsIn.amount)
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
}
