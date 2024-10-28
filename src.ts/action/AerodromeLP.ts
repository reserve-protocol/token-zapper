import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'

import { IAerodromeRouter } from '../contracts'
import { SwapLpStructOutput } from '../contracts/contracts/Aerodrome.sol/IAerodromeSugar'
import { Token, TokenQuantity } from '../entities/Token'

// class CryptoFactoryPoolSwapMint extends CurveFactoryCryptoPoolBase {
//   async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
//     const amts = await this.pool.poolInstance.callStatic.calc_token_amount(
//       amountsIn.map((amt) => amt.amount)
//     )
//     return [this.pool.lpToken.from(amts)]
//   }
//   constructor(public readonly pool: CurveFactoryCryptoPool) {
//     super(
//       pool.pool,
//       pool.underlying,
//       [pool.lpToken],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Callee,
//       pool.underlying.map((token) => new Approval(token, pool.pool))
//     )
//   }
// }

// class CryptoFactoryPoolSwapBurn extends CurveFactoryCryptoPoolBase {
//   async quote([amount]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     const [bal0, bal1, totalSupply] = (await Promise.all([
//       this.pool.poolInstance.callStatic.balances(0),
//       this.pool.poolInstance.callStatic.balances(1),
//       IERC20__factory.connect(
//         this.pool.lpToken.address.address,
//         this.pool.universe.provider
//       ).callStatic.totalSupply(),
//     ])) as [BigNumber, BigNumber, BigNumber]

//     return [
//       this.outputToken[0].from(
//         (bal0.toBigInt() *
//           ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
//           amount.token.scale
//       ),
//       this.outputToken[1].from(
//         (bal1.toBigInt() *
//           ((amount.amount * amount.token.scale) / totalSupply.toBigInt())) /
//           amount.token.scale
//       ),
//     ]
//   }

//   async plan(
//     planner: Planner,
//     inputs: Value[],
//     _: Address,
//     predictedInputs: TokenQuantity[]
//   ) {
//     const lib = this.gen.Contract.createContract(this.pool.poolInstance)
//     planner.add(
//       lib.remove_liquidity(
//         inputs[0] ?? predictedInputs[0].amount,
//         encodeArg([0, 0], ParamType.fromString('uint256[2]')),
//         false
//       )
//     )
//     return null
//   }
//   public get returnsOutput(): boolean {
//     return false
//   }

//   constructor(public readonly pool: CurveFactoryCryptoPool) {
//     super(
//       pool.pool,
//       [pool.lpToken],
//       pool.underlying,
//       InteractionConvention.None,
//       DestinationOptions.Callee,
//       []
//     )
//   }
// }

// class CurveFactoryCryptoPoolAddLiquidityAction extends Action(
//   'CurveFactoryCryptoPool'
// ) {
//   gasEstimate(): bigint {
//     return 685_000n
//   }
//   public get returnsOutput(): boolean {
//     return true
//   }

//   async plan(
//     planner: Planner,
//     [input]: Value[],
//     destination: Address,
//     [amountIn]: TokenQuantity[]
//   ): Promise<Value[]> {
//     const poolInst = this.gen.Contract.createContract(
//       new Contract(
//         this.pool.address.address,
//         [
//           'function add_liquidity(uint256[2], uint256 min_mint_amount, bool use_eth, address receiver) external returns (uint256)',
//         ],
//         this.universe.provider
//       )
//     )

//     const quote = await this.quoteCache.get(amountIn)

//     const tradeInputSplit = this.genUtils.fraction(
//       this.universe,
//       planner,
//       input,
//       quote.tradeFraction,
//       ` of ${amountIn} into ${quote.subTrade.action.toString()}`,
//       `input_trade`
//     )

//     const [tradeOutput] = await quote.subTrade.action.planWithOutput(
//       this.universe,
//       planner,
//       [tradeInputSplit],
//       this.universe.execAddress,
//       quote.subTrade.inputs
//     )

//     const actionInput = this.genUtils.fraction(
//       this.universe,
//       planner,
//       input,
//       ONE - quote.tradeFraction,
//       ` of ${amountIn} into ${this}`,
//       `input_lpdeposit`
//     )

//     const inputs =
//       this.tokenIndex === 0
//         ? [actionInput, tradeOutput]
//         : [tradeOutput, actionInput]

//     return [
//       planner.add(
//         poolInst.add_liquidity(
//           inputs,
//           quote.output.amount,
//           false,
//           destination.address
//         ),
//         `CurveFactoryCryptoPool.addLiquidity(${quote.amounts.join(', ')}) -> ${
//           quote.output
//         }`
//       )!,
//     ]
//   }

//   get tokenToTradeFor() {
//     return this.pool.allPoolTokens[this.tokenIndex === 0 ? 1 : 0]
//   }

//   get userInputToken() {
//     return this.pool.allPoolTokens[this.tokenIndex]
//   }

//   private async quoteInner(amountIn: TokenQuantity) {
//     const { token0, tok0PrLpToken, token1, tok1PrLpToken } =
//       await this.pool.calcTokenAmountsPrLp()

//     let total = tok0PrLpToken.add(tok1PrLpToken.into(token0))
//     const fractionToken0 = tok0PrLpToken.div(total)
//     const fractionToken1 = tok1PrLpToken.div(total.into(token1))

//     let subTrade: SingleSwap | null = null
//     let amounts: [TokenQuantity, TokenQuantity]
//     let tradeFraction: bigint
//     const abort = AbortSignal.timeout(
//       this.universe.config.routerDeadline
//     )
//     if (this.tokenIndex === 0) {
//       const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken0)

//       const tradeQty = amountIn.sub(amountQty)

//       tradeFraction = fractionToken1.amount

//       const paths = await this.universe.searcher.findSingleInputTokenSwap(
//         true,
//         tradeQty,
//         token1,
//         this.universe.execAddress,
//         this.universe.config.defaultInternalTradeSlippage,
//         abort,
//         1
//       )
//       subTrade = paths.path.steps[0]

//       amounts = [amountQty, subTrade.outputs[0]]
//     } else {
//       const amountQty = amountIn.sub(amountIn.token.wei).mul(fractionToken1)
//       const tradeQty = amountIn.sub(amountQty)

//       tradeFraction = fractionToken0.amount

//       const paths = await this.universe.searcher.findSingleInputTokenSwap(
//         true,
//         tradeQty,
//         token0,
//         this.universe.execAddress,
//         this.universe.config.defaultInternalTradeSlippage,
//         abort,
//         1
//       )
//       subTrade = paths.path.steps[0]

//       amounts = [subTrade.outputs[0], amountQty]
//     }

//     const out = await this.pool.poolInstance.calc_token_amount([
//       amounts[0].amount,
//       amounts[1].amount,
//     ])

//     const lpOut = this.outputToken[0].from(out)

//     return {
//       subTrade,
//       output: lpOut,
//       tradeFraction,
//       amounts,
//     }
//   }

//   async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     const quote = await this.quoteCache.get(amountsIn)

//     return [quote.output]
//   }

//   private readonly quoteCache: BlockCache<
//     TokenQuantity,
//     {
//       subTrade: SingleSwap
//       output: TokenQuantity
//       tradeFraction: bigint
//       amounts: TokenQuantity[]
//     },
//     bigint
//   >

//   constructor(
//     public readonly universe: Universe,
//     public readonly pool: CurveFactoryCryptoPool,
//     public readonly tokenIndex: number
//   ) {
//     super(
//       pool.pool,
//       [pool.underlying[tokenIndex]],
//       [pool.lpToken],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Recipient,
//       pool.underlying.map(
//         (token) =>
//           new Approval(
//             token === universe.nativeToken
//               ? universe.wrappedNativeToken
//               : token,
//             pool.address
//           )
//       )
//     )
//     this.quoteCache = this.universe.createCache(
//       async (qty) => await this.quoteInner(qty),
//       1,
//       (qty) => qty.amount
//     )
//   }

//   get outputSlippage() {
//     return 0n
//   }
//   toString(): string {
//     return `CurveFactoryCryptoPool.addLiquidity(${this.inputToken.join(
//       ', '
//     )} -> ${this.outputToken.join(', ')})`
//   }
// }

class AerodromeLP {
  private constructor(
    public readonly context: AerodromeLPPools,
    public readonly lpToken: Token,
    private reserve0: TokenQuantity,
    private reserve1: TokenQuantity,
    public readonly poolFee: bigint
  ) {}

  public get token0() {
    return this.reserve0.token
  }
  public get token1() {
    return this.reserve1.token
  }

  public get address() {
    return this.lpToken.address
  }

  public get universe() {
    return this.context.universe
  }

  public static async create(
    context: AerodromeLPPools,
    pool: SwapLpStructOutput
  ) {
    const universe = context.universe
    const [lpToken, token0, token1, { reserveA, reserveB }] = await Promise.all(
      [
        universe.getToken(Address.from(pool.lp)),
        universe.getToken(Address.from(pool.token0)),
        universe.getToken(Address.from(pool.token1)),
        context.router.getReserves(
          pool.token0,
          pool.token1,
          pool.poolType === 0,
          pool.factory
        ),
      ]
    )


    const inst = new AerodromeLP(
      context,
      lpToken,
      token0.from(reserveA),
      token1.from(reserveB),
      pool.poolFee.toBigInt()
    )

    return inst
  }
}

class AerodromeLPPools {
  private readonly byLp = new Map<Address, Promise<AerodromeLP>>()
  private readonly pools = new DefaultMap<
    Address,
    Map<Address, Promise<AerodromeLP>>
  >(() => new Map())
  constructor(
    public readonly universe: Universe,
    public readonly router: IAerodromeRouter
  ) {}

  public async definePool(pool: SwapLpStructOutput) {
    if (this.byLp.has(Address.from(pool.lp))) {
      return await this.byLp.get(Address.from(pool.lp))!
    }
    const inst = AerodromeLP.create(this, pool)
    this.byLp.set(Address.from(pool.lp), inst)
    this.pools
      .get(Address.from(pool.token0))
      .set(Address.from(pool.token1), inst)
    this.pools
      .get(Address.from(pool.token1))
      .set(Address.from(pool.token0), inst)
    return await inst
  }

  public async getPoolByLp(lp: Address) {
    return await this.byLp.get(lp)
  }

  public async getPoolUsingpair(tokenA: Token, tokenB: Token) {
    return await this.pools.get(tokenA.address).get(tokenB.address)
  }
}

export const setupAerodromeLPPools = async (
  universe: Universe,
  router: IAerodromeRouter
) => {}
