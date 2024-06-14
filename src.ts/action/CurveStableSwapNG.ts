import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import {
  CurveStableSwapNGHelper__factory,
  ICurveStableSwapNG,
  ICurveStableSwapNG__factory,
} from '../contracts'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'

abstract class NGSwapBase extends Action('CurveStableSwapNG') {
  gasEstimate(): bigint {
    return 10000000n
  }
  plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<Value[] | null> {
    throw new Error('Method not implemented.')
  }

  public get addToGraph(): boolean {
    return false
  }
}

class NGSwapMint extends NGSwapBase {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const amts = await this.pool.poolInstance.callStatic.calc_token_amount(
      amountsIn.map((amt) => amt.amount),
      true
    )
    return [this.pool.lpToken.from(amts)]
  }
  constructor(public readonly pool: CurveStableSwapNGPool) {
    super(
      pool.pool.address,
      pool.underlying,
      [pool.lpToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      pool.underlying.map((token) => new Approval(token, pool.pool.address))
    )
  }
}
class NGSwapBurn extends NGSwapBase {
  async quote(amounts: TokenQuantity[]): Promise<TokenQuantity[]> {
    const amts = await this.pool.poolInstance.callStatic.remove_liquidity(
      amounts[0].amount,
      this.pool.underlying.map((_) => 0)
    )
    return amts.map((amt, i) => this.pool.underlying[i].from(amt))
  }
  constructor(public readonly pool: CurveStableSwapNGPool) {
    super(
      pool.pool.address,
      [pool.lpToken],
      pool.underlying,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
export class CurveStableSwapNGPool {
  public readonly actions: {
    add: BaseAction
    remove: BaseAction
  }[]

  get outputSlippage() {
    return 1n
  }
  get address() {
    return this.pool.address
  }

  public readonly poolInstance: ICurveStableSwapNG

  public get lpToken() {
    return this.pool
  }
  public get allPoolTokens() {
    return this.underlying
  }

  public constructor(
    public readonly universe: Universe,
    public readonly pool: Token,
    public readonly underlying: Token[]
  ) {
    this.actions = underlying.map((_, index) => ({
      remove: new CurveStableSwapNGRemoveLiquidity(universe, this, index),
      add: new CurveStableSwapNGAddLiquidity(universe, this, index),
    }))

    const mintable = {
      mint: new NGSwapMint(this),
      burn: new NGSwapBurn(this),
    }

    this.poolInstance = ICurveStableSwapNG__factory.connect(
      pool.address.address,
      universe.provider
    )
    for (const { add, remove } of this.actions) {
      universe.addAction(add)
      universe.addAction(remove)
    }

    universe.defineMintable(mintable.mint, mintable.burn)
  }

  toString(): string {
    return `CurveStableSwapNGPool(addr=${this.pool.address}, lp=${
      this.pool
    }, coins=[${this.underlying.join(', ')}])`
  }
}

export class CurveStableSwapNGAddLiquidity extends Action('CurveStableSwapNG') {
  get outputSlippage() {
    return 1n
  }
  gasEstimate() {
    return BigInt(300000n)
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createLibrary(
      CurveStableSwapNGHelper__factory.connect(
        this.universe.config.addresses.curveStableSwapNGHelper.address,
        this.universe.provider
      )
    )
    const mintOutQuote = await this.quote(predicted)
    const minOut = 0 // mintOutQuote[0].amount - mintOutQuote[0].amount / 1000n;

    const add = planner.add(
      lib.addliquidity(
        input,
        this.tokenIndex,
        this.pool.pool.address.address,
        minOut
      ),
      `CurveStableSwapNGAddLiquidity: ${predicted.join(
        ', '
      )} -> ${mintOutQuote.join(', ')}`
    )!
    return [add!]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.pool.poolInstance.calc_token_amount(
      this.pool.underlying.map((_, index) =>
        this.tokenIndex === index ? amountsIn.amount : 0n
      ),
      true
    )

    return [this.outputToken[0].from(out)]
  }

  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveStableSwapNGPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.pool.address,
      [pool.underlying[tokenIndex]],
      [pool.pool],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(pool.underlying[tokenIndex], pool.pool.address)]
    )
  }

  toString(): string {
    return `CurveStableSwapNGAddLiquidity(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class CurveStableSwapNGRemoveLiquidity extends Action(
  'CurveStableSwapNG'
) {
  get outputSlippage() {
    return 1n
  }
  gasEstimate() {
    return BigInt(300000n)
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      ICurveStableSwapNG__factory.connect(
        this.pool.pool.address.address,
        this.universe.provider
      )
    )
    const mintOutQuote = await this.quote(predicted)
    const minOut = mintOutQuote[0].amount
    return [
      planner.add(
        lib.remove_liquidity_one_coin(inputs[0], this.tokenIndex, minOut),
        `CurveStableSwapNGRemoveLiquidity: ${predicted.join(
          ', '
        )} -> ${mintOutQuote.join(', ')}`
      )!,
    ]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.pool.poolInstance.calc_withdraw_one_coin(
      amountsIn.amount,
      this.tokenIndex
    )

    return [this.outputToken[0].from(out)]
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveStableSwapNGPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.pool.address,
      [pool.pool],
      [pool.underlying[tokenIndex]],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(pool.underlying[tokenIndex], pool.pool.address)]
    )
  }
  toString(): string {
    return `CurveStableSwapNGRemoveLiquidity(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export const setupCurveStableSwapNGPool = async (
  universe: Universe,
  pool: Token
) => {
  const poolInstance = ICurveStableSwapNG__factory.connect(
    pool.address.address,
    universe.provider
  )
  const n = (await poolInstance.N_COINS()).toNumber()
  const underlying: Token[] = []
  for (let i = 0; i < n; i++) {
    const token = await poolInstance.coins(i)
    underlying.push(await universe.getToken(Address.from(token)))
  }

  return new CurveStableSwapNGPool(universe, pool, underlying)
}
