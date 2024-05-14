import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import { IERC4626 } from '../contracts'

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

export const ERC4626DepositAction = (proto: string) =>
  class ERC4626DepositAction extends Action(proto) {
    get outputSlippage() {
      return this.slippage
    }
    async plan(
      planner: Planner,
      inputs: Value[],
      destination: Address
    ): Promise<Value[]> {
      const lib = this.gen.Contract.createContract(
        IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        )
      )
      const out = planner.add(lib.deposit(inputs[0], destination.address))
      return [out!]
    }
    gasEstimate() {
      return BigInt(200000n)
    }

    public async _quote(amountIn: bigint): Promise<TokenQuantity[]> {
      const x = (
        await this.inst.callStatic.previewDeposit(amountIn, {
          blockTag: 'pending',
        })
      ).toBigInt()
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
        DestinationOptions.Callee,
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
    async plan(
      planner: Planner,
      inputs: Value[],
      destination: Address,
      predicted: TokenQuantity[]
    ): Promise<Value[]> {
      const lib = this.gen.Contract.createContract(
        IERC4626__factory.connect(
          this.shareToken.address.address,
          this.universe.provider
        )
      )
      planner.add(
        lib.redeem(
          inputs[0] ?? predicted[0].amount,
          destination.address,
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
