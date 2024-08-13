import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { ParamType } from '@ethersproject/abi'
import { BigNumber, BigNumberish, Contract } from 'ethers'
import {
  CurveCryptoFactoryHelper__factory,
  IERC20__factory,
} from '../contracts'
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value, encodeArg } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'

abstract class CurveFactoryCryptoPoolBase extends Action(
  'CurveFactoryCryptoPool'
) {
  public get outputSlippage(): bigint {
    return 1n
  }
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

class CryptoFactoryPoolSwapMint extends CurveFactoryCryptoPoolBase {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const amts = await this.pool.poolInstance.callStatic.calc_token_amount(
      amountsIn.map((amt) => amt.amount)
    )
    return [this.pool.lpToken.from(amts)]
  }
  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.pool,
      pool.underlying,
      [pool.lpToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      pool.underlying.map((token) => new Approval(token, pool.pool))
    )
  }
}

class CryptoFactoryPoolSwapBurn extends CurveFactoryCryptoPoolBase {
  async quote([amount]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const [bal0, bal1, totalSupply] = (await Promise.all([
      this.pool.poolInstance.callStatic.balances(0),
      this.pool.poolInstance.callStatic.balances(1),
      IERC20__factory.connect(
        this.pool.lpToken.address.address,
        this.pool.universe.provider
      ).callStatic.totalSupply(),
    ])) as [BigNumber, BigNumber, BigNumber]

    return [
      this.outputToken[0].from(
        (bal0.toBigInt() *
          ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
          amount.token.scale
      ),
      this.outputToken[1].from(
        (bal1.toBigInt() *
          ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
          amount.token.scale
      ),
    ]
  }

  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.pool.poolInstance)
    planner.add(
      lib.remove_liquidity(
        inputs[0] ?? predictedInputs[0].amount,
        encodeArg([0, 0], ParamType.fromString('uint256[2]')),
        false
      )
    )
    return null
  }
  public get returnsOutput(): boolean {
    return false
  }

  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.pool,
      [pool.lpToken],
      pool.underlying,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class CurveFactoryCryptoPoolAddLiquidityAction extends Action(
  'CurveFactoryCryptoPool'
) {
  gasEstimate(): bigint {
    return 100000n
  }
  public get returnsOutput(): boolean {
    return true
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const helper = CurveCryptoFactoryHelper__factory.connect(
      this.universe.config.addresses.curveCryptoFactoryHelper.address,
      this.universe.provider
    )

    const lib = this.gen.Contract.createLibrary(helper)
    const mintOutQuote = await this.quote(predicted)
    const input =
      inputs[0] ?? encodeArg(predicted[0].amount, ParamType.from('uint256'))

    return [
      planner.add(
        lib.addliquidity(
          input,
          this.tokenIndex,
          this.pool.address.address,
          0n,
          this.inputToken[0] === this.universe.nativeToken
        ),
        `CurveFactoryCryptoPool.add_liquidity: ${predicted.join(
          ', '
        )} -> ${mintOutQuote.join(', ')}`
      )!,
    ]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.pool.poolInstance.calc_token_amount(
      this.tokenIndex === 0 ? [amountsIn.amount, 0n] : [0n, amountsIn.amount]
    )

    return [this.outputToken[0].from(out)]
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveFactoryCryptoPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.pool,
      [pool.underlying[tokenIndex]],
      [pool.lpToken],
      pool.underlying[tokenIndex] === universe.nativeToken
        ? InteractionConvention.None
        : InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      pool.underlying[tokenIndex] === universe.nativeToken
        ? []
        : [new Approval(pool.underlying[tokenIndex], pool.address)]
    )
  }
  toString(): string {
    return `CurveFactoryCryptoPool.addLiquidity(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

class CurveFactoryCryptoPoolRemoveLiquidityAction extends Action(
  'CurveFactoryCryptoPool'
) {
  gasEstimate(): bigint {
    return 100000n
  }
  get outputSlippage() {
    return 1n
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predicted: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(this.pool.poolInstance)
    const mintOutQuote = await this.quote(predicted)
    const input =
      inputs[0] ?? encodeArg(predicted[0].amount, ParamType.from('uint256'))
    return [
      planner.add(
        lib.remove_liquidity_one_coin(
          input,
          this.tokenIndex,
          this.universe.execAddress.address,
          false
        ),
        `CurveFactoryCryptoPool.removeLiquidity: ${predicted.join(
          ', '
        )} -> ${mintOutQuote.join(', ')}`
      )!,
    ]
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const out = await this.pool.poolInstance.callStatic.calc_withdraw_one_coin(
      amountsIn.amount,
      this.tokenIndex
    )
    return [this.outputToken[0].from(BigNumber.from(out))]
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveFactoryCryptoPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.pool,
      [pool.lpToken],
      [pool.underlying[tokenIndex]],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
  toString(): string {
    return `CurveFactoryCryptoPool.removeLiquidity(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class CurveFactoryCryptoPool {
  public readonly actions: {
    add: BaseAction
    remove: BaseAction
  }[]

  get outputSlippage() {
    return 1n
  }
  get address() {
    return this.pool
  }

  public readonly poolInstance: Contract & {
    remove_liquidity_one_coin: (
      _amount: BigNumberish,
      i: BigNumberish,
      use_eth: boolean,
      receiver: string
    ) => Promise<BigNumber>
    add_liquidity: (
      amounts: [BigNumberish, BigNumberish],
      min_amount: BigNumberish,
      use_eth: boolean
    ) => Promise<BigNumber[]>
    calc_withdraw_one_coin: (
      token_amount: BigNumberish,
      i: BigNumberish
    ) => Promise<BigNumber>
    calc_token_amount: (
      amounts: [BigNumberish, BigNumberish]
    ) => Promise<BigNumber>
    balances: (tokenIndex: BigNumberish) => Promise<BigNumber>
  }

  public get allPoolTokens() {
    return this.underlying
  }

  public constructor(
    public readonly universe: Universe,
    public readonly pool: Address,
    public readonly lpToken: Token,
    public readonly underlying: Token[]
  ) {
    this.actions = underlying.map((_, index) => ({
      remove: new CurveFactoryCryptoPoolRemoveLiquidityAction(
        universe,
        this,
        index
      ),
      add: new CurveFactoryCryptoPoolAddLiquidityAction(universe, this, index),
    }))

    const mintable = {
      mint: new CryptoFactoryPoolSwapMint(this),
      burn: new CryptoFactoryPoolSwapBurn(this),
    }

    this.poolInstance = new Contract(
      this.pool.address,
      ABI,
      this.universe.provider
    ) as any
    for (const { add, remove } of this.actions) {
      universe.addAction(add)
      universe.addAction(remove)
    }

    universe.addSingleTokenPriceSource({
      token: this.lpToken,
      priceFn: async () => {
        const out = await mintable.burn.quote([this.lpToken.one])
        const underlyingTokens = await Promise.all(
          out.map(
            async (i) => (await universe.fairPrice(i)) ?? universe.usd.zero
          )
        )
        const sum = underlyingTokens.reduce(
          (a, b) => a.add(b),
          universe.usd.zero
        )
        return sum
      },
      priceToken: universe.usd,
    })

    universe.defineMintable(mintable.mint, mintable.burn, true)
  }

  toString(): string {
    return `CurveFactoryCryptoPool(addr=${this.pool.address}, lp=${
      this.lpToken
    }, coins=[${this.underlying.join(', ')}])`
  }
}

export const setupCurveFactoryCryptoPool = async (
  universe: Universe,
  pool: Address
) => {
  const poolInstance = new Contract(pool.address, ABI, universe.provider) as any
  const n = 2
  const underlying: Token[] = []
  for (let i = 0; i < n; i++) {
    const token = await poolInstance.coins(i)
    underlying.push(await universe.getToken(Address.from(token)))
  }
  const lpToken = await universe.getToken(
    Address.from(await poolInstance.token())
  )

  const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying)
  return out
}
