import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import {
  ETHTokenVault,
  ETHTokenVault__factory,
  IERC4626,
  IStakedEthenaUSD__factory,
} from '../contracts'

import { IERC4626__factory } from '../contracts/factories/@openzeppelin/contracts/interfaces/IERC4626__factory'
import { type Token, type TokenQuantity } from '../entities/Token'

import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
export class ERC4626TokenVault {
  constructor(
    public readonly shareToken: Token,
    public readonly underlying: Token
  ) {}

  get address(): Address {
    return this.shareToken.address
  }
}

export const ETHTokenVaultDepositAction = (proto: string) =>
  class ETHTokenVaultDepositAction extends Action(proto) {
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
      const out = planner.add(
        lib
          .deposit(destination.address)
          .withValue(inputs[0] || predicted[0].amount)
      )
      return [out!]
    }
    gasEstimate() {
      return BigInt(200000n)
    }

    public async _quote(amountIn: bigint): Promise<TokenQuantity[]> {
      const x = (await this.inst.callStatic.previewDeposit(amountIn)).toBigInt()
      return [this.outputToken[0].fromBigInt(x)]
    }
    public readonly inst: ETHTokenVault
    public readonly quoteCache: BlockCache<bigint, TokenQuantity[]>
    async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
      return await this.quoteCache.get(amountIn.amount)
    }
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
      this.inst = ETHTokenVault__factory.connect(
        this.shareToken.address.address,
        this.universe.provider
      )
      this.quoteCache = this.universe.createCache<bigint, TokenQuantity[]>(
        async (a) => await this._quote(a),
        1
      )
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
      return BigInt(200000n)
    }

    public async _quote(amountIn: bigint): Promise<TokenQuantity[]> {
      const x = (await this.inst.callStatic.previewDeposit(amountIn)).toBigInt()
      return [this.outputToken[0].fromBigInt(x)]
    }
    public readonly inst: IERC4626
    public readonly quoteCache: BlockCache<bigint, TokenQuantity[]>
    async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
      return await this.quoteCache.get(amountIn.amount)
    }
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
      this.quoteCache = this.universe.createCache<bigint, TokenQuantity[]>(
        async (a) => await this._quote(a),
        1
      )
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
      return BigInt(200000n)
    }
    public async _quote(amountIn: bigint): Promise<TokenQuantity[]> {
      const x = (await this.inst.previewRedeem(amountIn)).toBigInt()
      return [this.outputToken[0].fromBigInt(x)]
    }
    public readonly inst: IERC4626
    public readonly quoteCache: BlockCache<bigint, TokenQuantity[]>
    async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
      return await this.quoteCache.get(amountIn.amount)
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
      this.quoteCache = this.universe.createCache<bigint, TokenQuantity[]>(
        async (a) => await this._quote(a),
        1
      )
    }
    toString(): string {
      return `ERC4626Withdraw(${this.shareToken.toString()})`
    }

    get outputSliptepage() {
      return this.slippage
    }
  }
