import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import {
  ETHTokenVault,
  ETHTokenVault__factory,
  IERC4626,
  IStakedEthenaUSD__factory,
  IWrappedNative__factory,
} from '../contracts'

import { IERC4626__factory } from '../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory'
import { type Token, type TokenQuantity } from '../entities/Token'

import { Planner, Value } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'
export class ERC4626TokenVault {
  constructor(
    public readonly shareToken: Token,
    public readonly underlying: Token
  ) {}

  get address(): Address {
    return this.shareToken.address
  }
}

const mapKey = (k: bigint) => {
  if (k > 100000n) {
    return (k / 100000n) * 100000n
  }
  if (k > 10000n) {
    return (k / 10000n) * 10000n
  }
  if (k > 1000n) {
    return (k / 1000n) * 1000n
  }
  if (k > 100n) {
    return (k / 100n) * 100n
  }
  return k
}

export class ETHTokenVaultDepositAction extends BaseAction {
  public get supportsDynamicInput(): boolean {
    return true
  }
  get outputSlippage() {
    return this.slippage
  }
  public get returnsOutput(): boolean {
    return true
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predicted: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.inst)
    const weth = this.gen.Contract.createContract(
      IWrappedNative__factory.connect(
        this.universe.wrappedNativeToken.address.address,
        this.universe.provider
      )
    )
    planner.add(weth.withdraw(inputs[0]))
    const out = planner.add(
      lib.deposit(destination.address).withValue(inputs[0]),
      `${this.protocol}: ETH ERC4626 vault, deposit ${predicted.join(', ')}`,
      `${this.protocol}_${this.shareToken.symbol}_deposit`
    )
    return [out!]
  }
  gasEstimate() {
    return BigInt(150_000n)
  }
  public get protocol() {
    return this.proto
  }
  public readonly inst: ETHTokenVault
  public quote: (amountIn: TokenQuantity[]) => Promise<TokenQuantity[]>
  constructor(
    readonly universe: Universe,
    readonly shareToken: Token,
    readonly vaultAddress: Address,
    readonly slippage: bigint,
    private readonly proto: string
  ) {
    super(
      shareToken.address,
      [universe.wrappedNativeToken],
      [shareToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(universe.wrappedNativeToken, shareToken.address)]
    )
    this.inst = ETHTokenVault__factory.connect(
      vaultAddress.address,
      this.universe.provider
    )
    const rateFn = this.universe.createCache(
      async (amt: bigint) => {
        const inputToken = this.inputToken[0]
        if (amt < 1n) {
          amt = 1n
        }
        const rate = await this.inst.callStatic.previewDeposit(
          amt * inputToken.scale
        )
        return inputToken.from(rate.toBigInt() / amt)
      },
      24000,
      mapKey
    )

    this.quote = async ([amountIn]: TokenQuantity[]) => {
      const inputToken = this.inputToken[0]
      const rate = await rateFn.get(amountIn.amount / inputToken.scale)
      return [rate.mul(amountIn).into(this.outputToken[0])]
    }
  }

  toString(): string {
    return `ETHTokenVaultDeposit(${this.shareToken.toString()})`
  }
}

export const ERC4626DepositAction = (proto: string) =>
  class ERC4626DepositAction extends Action(proto) {
    public get supportsDynamicInput(): boolean {
      return true
    }
    get outputSlippage() {
      return this.slippage
    }
    public get returnsOutput(): boolean {
      return true
    }
    async plan(
      planner: Planner,
      inputs: Value[],
      destination: Address,
      predicted: TokenQuantity[]
    ) {
      const lib = this.gen.Contract.createContract(
        IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        )
      )
      const out = planner.add(
        lib.deposit(inputs[0] || predicted[0].amount, destination.address)
      )
      return [out!]
    }
    gasEstimate() {
      return BigInt(150_000n)
    }
    public quote: (amountIn: TokenQuantity[]) => Promise<TokenQuantity[]>

    public readonly inst: IERC4626
    constructor(
      readonly universe: Universe,
      readonly underlying: Token,
      readonly shareToken: Token,
      readonly slippage: bigint
    ) {
      super(
        shareToken.address,
        [underlying],
        [shareToken],
        InteractionConvention.ApprovalRequired,
        DestinationOptions.Recipient,
        [new Approval(underlying, shareToken.address)]
      )
      this.inst = IERC4626__factory.connect(
        this.shareToken.address.address,
        this.universe.provider
      )

      this.quote = async ([amountIn]: TokenQuantity[]) => {
        const amtOut = await this.inst.callStatic.previewDeposit(
          amountIn.amount
        )
        return [this.outputToken[0].from(amtOut)]
      }
    }
    get dependsOnRpc(): boolean {
      return true
    }

    toString(): string {
      return `ERC4626Deposit(${this.shareToken.toString()})`
    }
  }

export const ERC4626WithdrawAction = (proto: string) =>
  class ERC4626WithdrawAction extends Action(proto) {
    public get returnsOutput(): boolean {
      return true
    }
    async plan(
      planner: Planner,
      inputs: Value[],
      destination: Address,
      predicted: TokenQuantity[]
    ) {
      const inputBal = inputs[0] ?? predicted[0].amount

      if (
        this.shareToken.address.address ===
        '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497'
      ) {
        const lib = this.gen.Contract.createContract(
          IStakedEthenaUSD__factory.connect(
            this.shareToken.address.address,
            this.universe.provider
          )
        )
        planner.add(lib.cooldownShares(inputBal))
        return this.outputBalanceOf(this.universe, planner)
      }
      const lib = this.gen.Contract.createContract(
        IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        )
      )
      planner.add(
        lib.redeem(
          inputBal,
          this.universe.config.addresses.executorAddress.address,
          this.universe.config.addresses.executorAddress.address
        )
      )
      return this.outputBalanceOf(this.universe, planner)
    }
    gasEstimate() {
      return BigInt(150_000n)
    }
    public readonly inst: IERC4626

    public quote: (amountIn: TokenQuantity[]) => Promise<TokenQuantity[]>

    get dependsOnRpc(): boolean {
      return true
    }
    constructor(
      readonly universe: Universe,
      readonly underlying: Token,
      readonly shareToken: Token,
      readonly slippage: bigint
    ) {
      super(
        shareToken.address,
        [shareToken],
        [underlying],
        InteractionConvention.None,
        DestinationOptions.Callee,
        []
      )

      this.inst = IERC4626__factory.connect(
        this.shareToken.address.address,
        this.universe.provider
      )
      this.quote = async ([amountIn]: TokenQuantity[]) => {
        const inputToken = this.inputToken[0]
        const amtOut = await this.inst.callStatic.previewRedeem(amountIn.amount)
        return [this.outputToken[0].from(amtOut)]
      }
    }
    toString(): string {
      return `ERC4626Withdraw(${this.shareToken.toString()})`
    }

    get outputSliptepage() {
      return this.slippage
    }
  }
