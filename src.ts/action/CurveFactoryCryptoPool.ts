import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { ParamType } from '@ethersproject/abi'
import { BigNumber, BigNumberish, Contract } from 'ethers'
import { BlockCache } from '../base/BlockBasedCache'
import { IERC20, IERC20__factory } from '../contracts'
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json'
import { TokenQuantity, type Token } from '../entities/Token'
import { MultiChoicePath } from '../searcher/MultiChoicePath'
import { SingleSwap } from '../searcher/Swap'
import { Planner, Value, encodeArg } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'

abstract class CurveFactoryCryptoPoolBase extends Action(
  'CurveFactoryCryptoPool'
) {
  public get outputSlippage(): bigint {
    return 0n
  }
  gasEstimate(): bigint {
    return 10000000n
  }
  public get oneUsePrZap() {
    return true
  }
  public get addressesInUse(): Set<Address> {
    return new Set([this.address])
  }
  public get supportsDynamicInput(): boolean {
    return true
  }
}

class CryptoFactoryPoolAddLiquidity extends CurveFactoryCryptoPoolBase {
  public get returnsOutput(): boolean {
    return true
  }
  public async inputProportions(): Promise<TokenQuantity[]> {
    const { tok0PrLpToken, tok1PrLpToken } =
      await this.pool.calcTokenAmountsPrLp()

    
    const [token0, token1] = this.pool.allPoolTokens
    const [priceA, priceB] = await Promise.all([
      this.pool.universe.fairPrice(tok0PrLpToken),
      this.pool.universe.fairPrice(tok1PrLpToken),
    ])

    console.log(
      `tok0PrLpToken: ${tok0PrLpToken}, price: ${priceA}`
    )
    console.log(
      `tok1PrLpToken: ${tok1PrLpToken}, price: ${priceB}`
    )

    const outPrice = priceA!.add(priceB!)

    return [
      priceA!.into(token0).div(outPrice!.into(token0)),
      priceB!.into(token1).div(outPrice!.into(token1)),
    ]
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const lib = this.gen.Contract.createContract(
      new Contract(
        this.pool.address.address,
        [
          'function add_liquidity(uint256[2], uint256 min_mint_amount, bool use_eth, address receiver) external returns (uint256)',
        ],
        this.pool.universe.provider
      )
    )
    const [minOut] = await this.quote(predictedInputs)
    return [
      planner.add(
        lib.add_liquidity([inputs[0], inputs[1]], minOut.amount, false),
        `CurveFactoryCryptoPool.add_liquidity(${predictedInputs.join(
          ', '
        )}) -> ${predictedInputs.join(', ')}`,
        `${this.protocol}_mint_${this.outputToken.join(
          '_'
        )}_using_${this.inputToken.join('_')}`
      )!,
    ]
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const amts = await this.pool.poolInstance.callStatic.calc_token_amount(
      amountsIn.map((amt) => amt.amount)
    )
    return [this.pool.lpToken.from(amts)]
  }
  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.pool,
      [pool.underlying[0], pool.underlying[1]],
      [pool.lpToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      pool.underlying.map((token) => new Approval(token, pool.pool))
    )
  }
}

class CryptoFactoryPoolRemoveLiquidity extends CurveFactoryCryptoPoolBase {
  public get returnsOutput(): boolean {
    return false
  }

  public async outputProportions(): Promise<TokenQuantity[]> {
    const [priceLp, [a, b]] = await Promise.all([
      this.pool.universe.fairPrice(this.pool.lpToken.one),
      this.quote([this.pool.lpToken.one]),
    ])

    const [token0, token1] = this.pool.allPoolTokens
    const [priceA, priceB] = await Promise.all([
      this.pool.universe.fairPrice(a),
      this.pool.universe.fairPrice(b),
    ])

    ;[
      [priceLp, this.pool.lpToken],
      [priceA, token0],
      [priceB, token1],
    ].forEach(([price, token]) => {
      if (price == null) {
        throw new Error(`Failed to price ${token}`)
      }
    })
    return [
      priceA!.div(priceLp!).into(token0),
      priceB!.div(priceLp!).into(token1),
    ]
  }
  async quote([amount]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const {
      totalSupply,
      balance0: bal0,
      balance1: bal1,
    } = await this.pool.poolInfo()
    const [token0, token1] = this.pool.allPoolTokens
    return [
      bal0
        .fpMul(amount.amount, amount.token.scale)
        .div(totalSupply.into(token0)),
      bal1
        .fpMul(amount.amount, amount.token.scale)
        .div(totalSupply.into(token1)),
    ]
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [amt0, amt1]: TokenQuantity[]
  ) {
    const lib = this.gen.Contract.createContract(this.pool.poolInstance)
    planner.add(
      lib.remove_liquidity(
        input,
        encodeArg(
          [amt0.amount, amt1.amount],
          ParamType.fromString('uint256[2]')
        ),
        false
      )
    )
    return null
  }

  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.pool,
      [pool.lpToken],
      [pool.underlying[0], pool.underlying[1]],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class WrappedLPAdd extends Action('curve') {
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
  ) {
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

    return await this.pool.actions.add.plan(
      planner,
      inputs,
      destination,
      quote.amounts
    )
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

    const total = tok0PrLpToken.add(tok1PrLpToken.into(token0))
    const fractionToken0 = tok0PrLpToken.div(total)
    const fractionToken1 = tok1PrLpToken.div(total.into(token1))

    let subTrade: SingleSwap | null = null
    let amounts: [TokenQuantity, TokenQuantity]
    let tradeFraction: bigint
    const abort = AbortSignal.timeout(this.universe.config.routerDeadline)
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
      pool.pool,
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
    return `${this.protocol}.WrappedLPAdd(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

class WrappedLPRemove extends Action('curve') {
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
      pool.pool,
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
    return `${this.protocol}.WrappedLPRemove(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
}

export class CurveFactoryCryptoPool {
  public readonly actions: {
    add: BaseAction
    remove: BaseAction
  }

  public async poolInfo() {
    const [bal0, bal1, totalSupply] = (await Promise.all([
      this.poolInstance.callStatic.balances(0),
      this.poolInstance.callStatic.balances(1),
      IERC20__factory.connect(
        this.lpToken.address.address,
        this.universe.provider
      ).callStatic.totalSupply(),
    ])) as [BigNumber, BigNumber, BigNumber]
    const [token0, token1] = this.allPoolTokens
    return {
      totalSupply: this.lpToken.from(totalSupply),
      balance0: token0.from(bal0),
      balance1: token1.from(bal1),
    }
  }

  get outputSlippage() {
    return 1n
  }
  get address() {
    return this.pool
  }

  public async calcTokenAmountsPrLp() {
    const [token0, token1] = this.allPoolTokens

    const {
      totalSupply: lpTokenSupply,
      balance0: balanceToken0,
      balance1: balanceToken1,
    } = await this.poolInfo()

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

    this.actions = {
      add: new CryptoFactoryPoolAddLiquidity(this),
      remove: new CryptoFactoryPoolRemoveLiquidity(this),
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

    universe.addSingleTokenPriceSource({
      token: this.lpToken,
      priceFn: async () => {
        const out = await this.actions.remove.quote([this.lpToken.one])
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
    })

    universe.defineMintable(this.actions.add, this.actions.remove, true)

    // for (let i = 0; i < this.underlying.length; i++) {
    //   universe.addAction(new WrappedLPAdd(this.universe, this, i))
    //   universe.addAction(new WrappedLPRemove(this.universe, this, i))
    // }
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

  await universe.defineLPToken(
    out.lpToken,
    (qty) => out.actions.remove.quote([qty]),
    (qty) => out.actions.add.quote(qty).then((i) => i[0])
  )

  return out
}
