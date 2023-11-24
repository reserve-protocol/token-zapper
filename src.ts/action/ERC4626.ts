import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { IERC4626__factory } from '../contracts/factories/contracts/IERC4626__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Planner, Value } from '../tx-gen/Planner'

const vaultInterface = IERC4626__factory.createInterface()

export class ERC4626TokenVault {
  constructor(
    public readonly shareToken: Token,
    public readonly underlying: Token,
  ) { }

  get address(): Address {
    return this.shareToken.address
  }
}

export class ERC4626DepositAction extends Action {
  get outputSlippage() {
    return 3000000n;
  }
  plan(planner: Planner, inputs: Value[], destination: Address): Value[] {
    const lib = this.gen.Contract.createLibrary(IERC4626__factory.connect(
      this.input[0].address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.deposit(inputs[0], destination.address))
    return [out!]
  }
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
    const x = (await IERC4626__factory.connect(
      this.shareToken.address.address,
      this.universe.provider
    ).previewDeposit(amountsIn.amount)).toBigInt()
    return [
      this.shareToken.from(
        x
      )
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
  plan(planner: Planner, inputs: Value[], destination: Address): Value[] {
    const lib = this.gen.Contract.createLibrary(IERC4626__factory.connect(
      this.input[0].address.address,
      this.universe.provider
    ))
    const out = planner.add(lib.withdraw(inputs[0], destination.address, this.universe.config.addresses.executorAddress.address))
    return [out!]
  }
  gasEstimate() {
    return BigInt(200000n)
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        vaultInterface.encodeFunctionData('redeem', [
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
      this.underlying.from(
        await IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        ).previewRedeem(amountsIn.amount)
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

  get outputSliptepage() {
    return 3000000n;
  }
}
