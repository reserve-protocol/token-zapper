import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { ParamType } from '@ethersproject/abi'
import { BigNumber, BigNumberish, Contract } from 'ethers'
import {
  CurveCryptoFactoryHelper__factory,
  IERC20,
  IERC20__factory,
} from '../contracts'
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json'
import { TokenQuantity, type Token } from '../entities/Token'
import { Planner, Value, encodeArg } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
  ONE_Val,
} from './Action'
import { SingleSwap, SwapPath } from '../searcher/Swap'
import { BlockCache } from '../base/BlockBasedCache'
import { TokenAmounts } from '../entities/TokenAmounts'
import { MultiChoicePath } from '../searcher/MultiChoicePath'

abstract class CurveFactoryCryptoPoolBase extends Action(
  'CurveFactoryCryptoPool'
) {
  public get outputSlippage(): bigint {
    return 15n
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
      pool.lpToken.address,
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
    return 685_000n
  }
  public get returnsOutput(): boolean {
    return true
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    [amountIn]: TokenQuantity[]
  ): Promise<Value[]> {
    const poolInst = this.gen.Contract.createContract(
      new Contract(
        this.pool.address.address,
        [
          'function add_liquidity(uint256[2], uint256 min_mint_amount, bool use_eth, address receiver) external returns (uint256)',
        ],
        this.universe.provider
      )
    )

    const quote = await this.quoteCache.get(amountIn)

    const tradeInputSplit = this.genUtils.fraction(
      this.universe,
      planner,
      input,
      quote.tradeFraction,
      ` of ${amountIn} into ${quote.subTrade.action.toString()}`,
      `input_trade`
    )

    const [tradeOutput] = await quote.subTrade.action.planWithOutput(
      this.universe,
      planner,
      [tradeInputSplit],
      this.universe.execAddress,
      quote.subTrade.inputs
    )

    const actionInput = this.genUtils.fraction(
      this.universe,
      planner,
      input,
      ONE - quote.tradeFraction,
      ` of ${amountIn} into ${this}`,
      `input_lpdeposit`
    )

    const inputs =
      this.tokenIndex === 0
        ? [actionInput, tradeOutput]
        : [tradeOutput, actionInput]

    return [
      planner.add(
        poolInst.add_liquidity(
          inputs,
          quote.output.amount,
          false,
          destination.address
        ),
        `CurveFactoryCryptoPool.addLiquidity(${quote.amounts.join(', ')}) -> ${
          quote.output
        }`
      )!,
    ]
  }

  get tokenToTradeFor() {
    return this.pool.allPoolTokens[this.tokenIndex === 0 ? 1 : 0]
  }

  get userInputToken() {
    return this.pool.allPoolTokens[this.tokenIndex]
  }

  private async quoteInner(amountIn: TokenQuantity) {
    const { token0, tok0PrLpToken, token1, tok1PrLpToken } =
      await this.pool.calcTokenAmountsPrLp()

    let total = tok0PrLpToken.add(tok1PrLpToken.into(token0))
    const fractionToken0 = tok0PrLpToken.div(total)
    const fractionToken1 = tok1PrLpToken.div(total.into(token1))

    let subTrade: SingleSwap | null = null
    let amounts: [TokenQuantity, TokenQuantity]
    let tradeFraction: bigint
    const abort = AbortSignal.timeout(
      Math.floor(this.universe.config.routerDeadline / 4)
    )
    if (this.tokenIndex === 0) {
      const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken0)

      const tradeQty = amountIn.sub(amountQty)

      tradeFraction = fractionToken1.amount

      const paths = await this.universe.searcher.findSingleInputTokenSwap(
        true,
        tradeQty,
        token1,
        this.universe.execAddress,
        this.universe.config.defaultInternalTradeSlippage,
        abort,
        1
      )
      subTrade = paths.path.steps[0]

      amounts = [amountQty, subTrade.outputs[0]]
    } else {
      const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken1)
      const tradeQty = amountIn.sub(amountQty)

      tradeFraction = fractionToken0.amount

      const paths = await this.universe.searcher.findSingleInputTokenSwap(
        true,
        tradeQty,
        token0,
        this.universe.execAddress,
        this.universe.config.defaultInternalTradeSlippage,
        abort,
        1
      )
      subTrade = paths.path.steps[0]

      amounts = [subTrade.outputs[0], amountQty]
    }

    const out = await this.pool.poolInstance.calc_token_amount([
      amounts[0].amount,
      amounts[1].amount,
    ])

    const lpOut = this.outputToken[0].from(out)

    return {
      subTrade,
      output: lpOut,
      tradeFraction,
      amounts,
    }
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const quote = await this.quoteCache.get(amountsIn)

    return [quote.output]
  }

  private readonly quoteCache: BlockCache<
    TokenQuantity,
    {
      subTrade: SingleSwap
      output: TokenQuantity
      tradeFraction: bigint
      amounts: TokenQuantity[]
    },
    bigint
  >

  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveFactoryCryptoPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.underlying[tokenIndex].address,
      [pool.underlying[tokenIndex]],
      [pool.lpToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      pool.underlying.map(
        (token) =>
          new Approval(
            token === universe.nativeToken
              ? universe.wrappedNativeToken
              : token,
            pool.address
          )
      )
    )
    this.quoteCache = this.universe.createCache(
      async (qty) => await this.quoteInner(qty),
      1,
      (qty) => qty.amount
    )
  }

  get outputSlippage() {
    return 0n
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
    return 600_000n
  }
  get supportsDynamicInput() {
    return true
  }
  get oneUsePrZap() {
    return true
  }
  get returnsOutput() {
    return true
  }
  get outputSlippage() {
    return 0n
  }
  get addressesInUse() {
    return this.pool.addressesInUse
  }
  async plan(
    planner: Planner,
    [lpTokenQtyValue]: Value[],
    _: Address,
    [lpTokenQty]: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(this.pool.poolInstance)
    const mintOutQuote = await this.cache.get(lpTokenQty)
    planner.add(
      lib.remove_liquidity(
        lpTokenQtyValue,
        mintOutQuote.lpBurnOutputs.map((i) => i.amount - i.amount / 1000n),
        false
      ),
      `CurveFactoryCryptoPool.removeLiquidity(${lpTokenQty}) -> ${mintOutQuote.output}`
    )

    let tradeInput = [
      this.genUtils.erc20.balanceOf(
        this.pool.universe,
        planner,
        mintOutQuote.subTrade.path.inputs[0].token,
        this.pool.universe.execAddress,
        `Redeem ${this.inputToken} result`
      ),
    ]
    for (const step of mintOutQuote.subTrade.path.steps) {
      tradeInput = await step.action.planWithOutput(
        this.pool.universe,
        planner,
        tradeInput,
        this.pool.universe.execAddress,
        mintOutQuote.subTrade.path.inputs
      )
    }

    return tradeInput
  }

  private async quoteInner(lpTokenQty: TokenQuantity) {
    const { token0, tok0PrLpToken, token1, tok1PrLpToken } =
      await this.pool.calcTokenAmountsPrLp()

    const qtyTok0 = lpTokenQty
      .sub(lpTokenQty.token.wei)
      .into(token0)
      .mul(tok0PrLpToken)
    const qtyTok1 = lpTokenQty
      .sub(lpTokenQty.token.wei)
      .into(token1)
      .mul(tok1PrLpToken)

    const [qtyToKeep, qtyToTrade] =
      qtyTok0.token === this.outputToken[0]
        ? [qtyTok0, qtyTok1]
        : [qtyTok1, qtyTok0]
    const outputToken = qtyToKeep.token

    const quote = await this.pool.universe.searcher.findSingleInputTokenSwap(
      true,
      qtyToTrade,
      outputToken,
      this.pool.universe.execAddress,
      this.pool.universe.config.defaultInternalTradeSlippage,
      AbortSignal.timeout(this.pool.universe.config.routerDeadline),
      2
    )
    const outputQty = quote.outputs[0].add(qtyToKeep)
    return {
      subTrade: quote,
      output: [outputQty],
      lpBurnOutputs: [qtyTok0, qtyTok1],
    }
  }

  private cache: BlockCache<
    TokenQuantity,
    {
      subTrade: MultiChoicePath
      output: TokenQuantity[]
      lpBurnOutputs: TokenQuantity[]
    },
    bigint
  >

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const quote = await this.cache.get(amountsIn)
    return quote.output
  }
  constructor(
    public readonly universe: Universe,
    public readonly pool: CurveFactoryCryptoPool,
    public readonly tokenIndex: number
  ) {
    super(
      pool.underlying[tokenIndex].address,
      [pool.lpToken],
      [pool.underlying[tokenIndex]],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )

    this.cache = this.pool.universe.createCache(
      async (qty) => await this.quoteInner(qty),
      1,
      (qty) => qty.amount
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

  public async calcTokenAmountsPrLp() {
    const [token0, token1] = this.allPoolTokens

    const lpTokenSupply = this.lpToken.from(
      await this.lpTokenInstance.totalSupply()
    )

    const balanceToken0 = token0.from(await this.poolInstance.balances(0))
    const balanceToken1 = token1.from(await this.poolInstance.balances(1))

    const tok0PrLpToken = balanceToken0.div(lpTokenSupply.into(token0))
    const tok1PrLpToken = balanceToken1.div(lpTokenSupply.into(token1))

    return {
      token0,
      token1,
      tok0PrLpToken,
      tok1PrLpToken,
    }
  }

  public readonly poolInstance: Contract & {
    remove_liquidity: (
      amount: BigNumberish,
      amounts: [BigNumberish, BigNumberish],
      use_eth: boolean
    ) => Promise<[BigNumber, BigNumber]>
    add_liquidity: (
      amounts: [BigNumberish, BigNumberish],
      min_amount: BigNumberish,
      use_eth: boolean
    ) => Promise<BigNumber[]>
    calc_token_amount: (
      amounts: [BigNumberish, BigNumberish]
    ) => Promise<BigNumber>
    balances: (tokenIndex: BigNumberish) => Promise<BigNumber>
  }

  public readonly lpTokenInstance: IERC20

  public get allPoolTokens() {
    return this.underlying
  }

  public readonly addressesInUse: Set<Address>

  public constructor(
    public readonly universe: Universe,
    public readonly pool: Address,
    public readonly lpToken: Token,
    public readonly underlying: Token[]
  ) {
    this.addressesInUse = new Set([pool])
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

    this.lpTokenInstance = IERC20__factory.connect(
      this.lpToken.address.address,
      this.universe.provider
    )

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
    const tok = await universe.getToken(Address.from(token))
    underlying.push(tok)
  }
  const lpToken = await universe.getToken(
    Address.from(await poolInstance.token())
  )

  const out = new CurveFactoryCryptoPool(universe, pool, lpToken, underlying)
  return out
}
