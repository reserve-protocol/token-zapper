import {
  defaultAbiCoder,
  ParamType,
  parseEther,
  parseUnits,
  solidityPack,
} from 'ethers/lib/utils'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { DefaultMap } from '../base/DefaultMap'
import { GAS_TOKEN_ADDRESS, ZERO } from '../base/constants'

import {
  IAerodromeRouter,
  IERC20__factory,
  IMixedRouteQuoterV1,
  SlipstreamRouterCall,
  UniV3RouterCall,
} from '../contracts'
import { SwapLpStructOutput } from '../contracts/contracts/Aerodrome.sol/IAerodromeSugar'
import { Token, TokenQuantity } from '../entities/Token'
import { MultiChoicePath } from '../searcher/MultiChoicePath'
import {
  CommandFlags,
  Contract,
  encodeArg,
  Planner,
  Value,
} from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'
import { utils } from 'ethers'
import { SwapPath } from '../searcher/Swap'

export enum AerodromePoolType {
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
  CL = 'CL',
}

export const getPoolType = (poolType: number) => {
  if (poolType === 0) {
    return AerodromePoolType.STABLE
  } else if (poolType === -1) {
    return AerodromePoolType.VOLATILE
  } else {
    return AerodromePoolType.CL
  }
}
abstract class BaseV2AerodromeAction extends Action('BaseAerodromeStablePool') {
  public get outputSlippage(): bigint {
    return 5n
  }

  abstract get actionName(): string

  public get supportsDynamicInput(): boolean {
    return true
  }
  public get returnsOutput(): boolean {
    return false
  }
  public constructor(
    public readonly pool: AerodromeStablePool,
    inputs: Token[],
    outputs: Token[],
    approvals: Approval[] = inputs.map(
      (i) => new Approval(i, Address.from(pool.context.router.address))
    )
  ) {
    super(
      pool.address,
      inputs,
      outputs,
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      approvals
    )
  }

  public toString(): string {
    return `${this.protocol}.${this.actionName}(${
      this.pool.address
    }, ${this.inputToken.join(', ')} => ${this.outputToken.join(', ')})`
  }
}

class AeropoolAddLiquidity extends BaseV2AerodromeAction {
  get actionName(): string {
    return 'addLiquidity'
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this.pool.quoteAddLiquidity(amountIn)).liquidity]
  }
  gasEstimate(): bigint {
    return 500000n
  }

  // function addLiquidityV2(
  //   uint256 amountA,
  //   uint256 amountB,
  //   uint256 expectedA,
  //   uint256 expectedB,
  //   bytes memory encoding
  // ) external returns (uint256 amountOut) {
  //   State memory state = State(amountA, amountB, expectedA, expectedB, address(0), address(0), false, address(0));
  // (address tokenA, address tokenB, bool stable, address dest, address router) = abi.decode(
  //   encoding,
  //   (address, address, bool, address, address)
  // );
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    minAmounts: TokenQuantity[]
  ): Promise<null | Value[]> {
    planner.add(
      this.pool.context.weirollAerodromeRouterCaller.addLiquidityV2(
        inputs[0],
        inputs[1],
        minAmounts[0].amount - minAmounts[0].amount / 5n,
        minAmounts[1].amount - minAmounts[1].amount / 5n,
        defaultAbiCoder.encode(
          ['address', 'address', 'bool', 'address', 'address'],
          [
            this.pool.token0.address.address,
            this.pool.token1.address.address,
            this.pool.isStable,
            destination.address,
            this.pool.context.router.address,
          ]
        )
      ),
      `${this.protocol}:${this.actionName}(${minAmounts.join(
        ', '
      )}) => ${minAmounts.join(', ')}`,
      `${this.protocol}_mint_${this.outputToken.join(
        ', '
      )}_using_${this.inputToken.join('_')}`
    )
    return null
  }

  public constructor(public readonly pool: AerodromeStablePool) {
    super(pool, [pool.token0, pool.token1], [pool.lpToken])
  }
}

class AeropoolRemoveLiquidity extends BaseV2AerodromeAction {
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await this.pool.quoteRemoveLiquidity(amountIn)
  }
  gasEstimate(): bigint {
    return 400000n
  }

  /// @notice Remove liquidity of two tokens from a Pool
  /// @param tokenA       .
  /// @param tokenB       .
  /// @param stable       True if pool is stable, false if volatile
  /// @param liquidity    Amount of liquidity to remove
  /// @param amountAMin   Minimum amount of tokenA to receive
  /// @param amountBMin   Minimum amount of tokenB to receive
  /// @param to           Recipient of tokens received
  /// @param deadline     Deadline to remove liquidity
  /// @return amountA     Amount of tokenA received
  /// @return amountB     Amount of tokenB received
  //   function removeLiquidity(
  //     address tokenA,
  //     address tokenB,
  //     bool stable,
  //     uint256 liquidity,
  //     uint256 amountAMin,
  //     uint256 amountBMin,
  //     address to,
  //     uint256 deadline
  // ) external returns (uint256 amountA, uint256 amountB);
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    planner.add(
      this.pool.context.weirollV2Router.removeLiquidity(
        this.pool.token0.address.address,
        this.pool.token1.address.address,
        this.pool.isStable,
        input,
        predictedInputs[0].amount,
        predictedInputs[1].amount,
        destination.address,
        2n ** 64n - 1n
      ),
      `${this.protocol}:${this.actionName}(${predictedInputs.join(
        ', '
      )}) => ${predictedInputs.join(', ')}`,
      `${this.protocol}_redeem_${predictedInputs.join(
        '_'
      )}_for_${this.outputToken.join('_')}`
    )

    return null
  }
  get actionName(): string {
    return 'removeLiquidity'
  }

  public constructor(public readonly pool: AerodromeStablePool) {
    super(pool, [pool.lpToken], [pool.token0, pool.token1])
  }
}

class AeropoolSwapCL extends Action('BaseAerodromeCLPool') {
  get actionName(): string {
    return 'swapCL'
  }

  public get oneUsePrZap() {
    return true
  }
  public get returnsOutput() {
    return true
  }
  public get supportsDynamicInput() {
    return true
  }
  get outputSlippage() {
    return 0n
  }

  public constructor(
    public readonly pool: AerodromeStablePool,
    public readonly input: Token,
    public readonly output: Token
  ) {
    super(
      pool.address,
      [input],
      [output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(input, pool.context.aerodromeSwapRouterAddr)]
    )
  }

  public toString(): string {
    return `${this.protocol}.${this.actionName}(${this.pool.address}, ${this.inputToken[0]} => ${this.outputToken[0]})`
  }

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const result =
      await this.pool.context.mixedRouter.callStatic.quoteExactInputSingleV3(
        {
          tokenIn: this.input.address.address,
          tokenOut: this.output.address.address,
          amountIn: amountIn.amount,
          tickSpacing: this.pool.tickSpacing,
          sqrtPriceLimitX96: 0,
        },
        {
          from: '0xF2d98377d80DADf725bFb97E91357F1d81384De2',
          gasLimit: 5_000_000,
        }
      )

    return [this.output.from(result.amountOut.toBigInt())]
  }

  gasEstimate(): bigint {
    return 250000n
  }

  /// @notice Swap one token for another
  /// @param amountIn     Amount of token in
  /// @param amountOutMin Minimum amount of desired token received
  /// @param routes       Array of trade routes used in the swap
  /// @param to           Recipient of the tokens received
  /// @param deadline     Deadline to receive tokens
  /// @return amounts     Array of amounts returned per route
  //   function swapExactTokensForTokens(
  //     uint256 amountIn,
  //     uint256 amountOutMin,
  //     Route[] calldata routes,
  //     address to,
  //     uint256 deadline
  // ) external returns (uint256[] memory amounts);
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const [minAmount] = await this.quote(predictedInputs)
    const minOut = minAmount.amount - minAmount.amount / 10n

    const encoded = utils.defaultAbiCoder.encode(
      [
        'address',
        'address',
        'int24',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint160',
      ],
      [
        predictedInputs[0].token.address.address,
        this.outputToken[0].address.address,
        this.pool.tickSpacing,
        destination.address,
        2n ** 64n - 1n,
        0,
        0,
        0,
      ]
    )
    return [
      planner.add(
        this.pool.context.weirollAerodromeRouterCaller.exactInputSingle(
          input,
          minOut,
          this.pool.context.aerodromeSwapRouterAddr.address,
          encoded
        ),
        `${this.protocol}:${this.actionName}(${predictedInputs.join(
          ', '
        )}) => ${minAmount}`,
        `${this.protocol}_swap_${predictedInputs.join(
          '_'
        )}_for_${this.outputToken.join('_')}`
      )!,
    ]
  }
}

class AeropoolSwap extends BaseV2AerodromeAction {
  get actionName(): string {
    return 'swap'
  }

  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.outputToken[0].from(await this.pool.getAmountOut(amountIn))]
  }

  gasEstimate(): bigint {
    return 250000n
  }

  //   function exactInputSingleV2(
  //     uint256 amountIn,
  //     uint256 expected,
  //     IAerodromeRouter router,
  //     address recipient,
  //     bytes memory encoding
  // ) external returns (uint256 amountOut) {
  //     (address tokenIn, address tokenOut, bool stable, address factory) = abi.decode(
  //         encoding,
  //         (address, address, bool, address)
  //     );
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const [minAmount] = await this.quoteWithSlippage(predictedInputs)

    planner.add(
      this.pool.context.weirollAerodromeRouterCaller.exactInputSingleV2(
        input,
        minAmount.amount - minAmount.amount / 20n,
        this.pool.context.router.address,
        destination.address,
        defaultAbiCoder.encode(
          ['address', 'address', 'bool', 'address'],
          [
            this.inputToken[0].address.address,
            this.outputToken[0].address.address,
            this.pool.isStable,
            this.pool.factory.address,
          ]
        )
      ),
      `${this.protocol}:${this.actionName}(${predictedInputs.join(
        ', '
      )}) => ${minAmount}`,
      `${this.protocol}_swap_${predictedInputs.join(
        '_'
      )}_for_${this.outputToken.join('_')}`
    )

    return null
  }
}

class WrappedLpAdd extends BaseV2AerodromeAction {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const q = await this._quoteInner(amountsIn)
    return [q.output.liquidity]
  }
  get actionName(): string {
    return this.pool.actions.addLiquidity!.actionName
  }

  gasEstimate(): bigint {
    return 500000n * 2n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const { quote, amounts } = await this._quoteInner(predictedInputs)

    let tradeInput: Value[] = [
      this.genUtils.fraction(
        this.pool.universe,
        planner,
        input,
        parseUnits('0.520', 18).toBigInt(),
        `trade ${quote.inputs.join(', ')} -> ${quote.outputs.join(', ')}`,
        'trade_input'
      ),
    ]
    const rest = this.genUtils.sub(
      this.pool.universe,
      planner,
      input,
      tradeInput[0],
      `remaining into pool`,
      `remainder`
    )

    for (const step of quote.steps) {
      for (const inputToken of step.action.inputToken) {
        await this.genUtils.approve(
          this.pool.universe,
          planner,
          inputToken.one,
          step.action.approvals[0].spender
        )
      }
      tradeInput = await step.action.planWithOutput(
        this.pool.universe,
        planner,
        tradeInput,
        this.pool.universe.execAddress,
        step.inputs
      )
    }

    const valueInputs =
      this.tokenIn === this.pool.token0
        ? [rest, tradeInput[0]]
        : [tradeInput[0], rest]

    // for (const tok of amounts) {
    //   await this.genUtils.approve(
    //     this.pool.universe,
    //     planner,
    //     tok,
    //     Address.from(this.pool.context.router.address)
    //   )
    // }
    await this.pool.actions.addLiquidity!.plan(
      planner,
      valueInputs,
      destination,
      amounts
    )

    return null
  }

  private _quoteInner: (amountIn: TokenQuantity[]) => Promise<{
    quote: SwapPath
    amounts: [TokenQuantity, TokenQuantity]
    output: {
      amount0: TokenQuantity
      amount1: TokenQuantity
      liquidity: TokenQuantity
    }
  }>

  constructor(
    public readonly pool: AerodromeStablePool,
    public readonly tokenIn: Token,
    public readonly tradeFor: Token
  ) {
    super(
      pool,
      [tokenIn],
      [pool.lpToken],
      [
        new Approval(pool.token0, Address.from(pool.context.router.address)),
        new Approval(pool.token1, Address.from(pool.context.router.address)),
      ]
    )

    if (tokenIn === tradeFor) {
      throw new Error(`Same tokenIn and tradeFor: ${this}`)
    }

    const cache = this.pool.universe.createCache(
      async ([amountIn]: TokenQuantity[]) => {
        const abort = AbortSignal.timeout(
          this.pool.universe.config.routerDeadline
        )
        const multiQuote =
          await this.pool.universe.searcher.findSingleInputTokenSwap(
            true,
            amountIn.scalarDiv(2n),
            this.tradeFor,
            this.pool.universe.execAddress,
            this.pool.universe.config.defaultInternalTradeSlippage,
            abort,
            3
          )

        let quote: SwapPath | undefined = undefined
        for (let i = 0; i < multiQuote.paths.length; i++) {
          const path = multiQuote.paths[i]
          let valid = true
          for (const step of path.steps) {
            if (step.address === this.pool.address) {
              valid = false
              break
            }
          }
          if (!valid) {
            continue
          }

          quote = path
          break
        }

        if (!quote) {
          throw new Error('No quote found')
        }

        const q0 = await this.pool.quoteAddLiquidity(amountIn.scalarDiv(2n))
        const q1 = await this.pool.quoteAddLiquidity(quote.outputs[0])

        const liquidity = q0.liquidity.amount < q1.liquidity.amount ? q1 : q0

        return {
          quote,
          amounts: (tokenIn === pool.token0
            ? [amountIn.scalarDiv(2n), quote.outputs[0]]
            : [quote.outputs[0], amountIn.scalarDiv(2n)]) as [
            TokenQuantity,
            TokenQuantity
          ],
          output: liquidity,
        }
      },
      12000,
      (inp) => `${inp.join(', ')}`
    )
    this._quoteInner = async (amountIn: TokenQuantity[]) =>
      await cache.get(amountIn)
  }
}

class WrappedLpRemove extends BaseV2AerodromeAction {
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [(await this._quoteInner(amountsIn)).output]
  }
  get actionName(): string {
    return this.pool.actions.removeLiquidity!.actionName
  }

  gasEstimate(): bigint {
    throw new Error('Method not implemented.')
  }
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const quote = await this._quoteInner(predictedInputs)

    let tradeInput = await this.pool.actions.removeLiquidity!.planWithOutput(
      this.pool.universe,
      planner,
      inputs,
      this.pool.universe.execAddress,
      predictedInputs
    )

    for (const step of quote.quote.steps) {
      tradeInput = await step.action.planWithOutput(
        this.pool.universe,
        planner,
        tradeInput,
        this.pool.universe.execAddress,
        step.inputs
      )
    }
    this.genUtils.planForwardERC20(
      this.pool.universe,
      planner,
      this.out,
      tradeInput[0],
      destination
    )
    return null
  }

  private _quoteInner: (amountIn: TokenQuantity[]) => Promise<{
    quote: MultiChoicePath
    output: TokenQuantity
  }>

  constructor(
    public readonly pool: AerodromeStablePool,
    public readonly out: Token
  ) {
    super(pool, [pool.lpToken], [out])

    const cache = this.pool.universe.createCache(
      async ([amountIn]: TokenQuantity[]) => {
        const burnQ = await this.pool.quoteRemoveLiquidity(amountIn)

        const abort = AbortSignal.timeout(
          this.pool.universe.config.routerDeadline
        )
        const quote =
          await this.pool.universe.searcher.findSingleInputTokenSwap(
            true,
            out === this.pool.token0 ? burnQ[1] : burnQ[0],
            out === this.pool.token0 ? this.pool.token0 : this.pool.token1,
            this.pool.universe.execAddress,
            this.pool.universe.config.defaultInternalTradeSlippage,
            abort,
            1
          )

        const output =
          out == this.pool.token0
            ? burnQ[0].add(quote.outputs[0])
            : burnQ[1].add(quote.outputs[0])

        return {
          quote,
          output,
        }
      },
      12000,
      (inp) => `${inp.join(', ')}`
    )
    this._quoteInner = async (amountIn: TokenQuantity[]) =>
      await cache.get(amountIn)
  }
}

const FEE_DIVISOR = 10000n
class AerodromeStablePool {
  private reserves: () => Promise<TokenQuantity[]>
  private totalSupply: () => Promise<TokenQuantity>

  public readonly actions: {
    addLiquidity?: AeropoolAddLiquidity
    removeLiquidity?: AeropoolRemoveLiquidity
    t0for1: BaseAction
    t1for0: BaseAction
  }

  public readonly factory: Address

  private constructor(
    public readonly context: AerodromeContext,
    public readonly poolAddress: Address,
    public readonly lpToken: Token,
    public readonly token0: Token,
    public readonly token1: Token,
    private readonly data: SwapLpStructOutput
  ) {
    this.factory = Address.from(data.factory)
    this.reserves = this.universe.createCachedProducer(async () => {
      if (this.poolType === AerodromePoolType.CL) {
        throw new Error('Not used')
      }
      const { reserveA, reserveB } =
        await context.router.callStatic.getReserves(
          this.token0.address.address,
          this.token1.address.address,
          this.data.poolType === 0,
          this.data.factory
        )

      return [this.token0.from(reserveA), this.token1.from(reserveB)]
    })

    this.actions =
      this.poolType === AerodromePoolType.CL
        ? {
            t0for1: new AeropoolSwapCL(this, this.token0, this.token1),
            t1for0: new AeropoolSwapCL(this, this.token1, this.token0),
          }
        : {
            addLiquidity: new AeropoolAddLiquidity(this),
            removeLiquidity: new AeropoolRemoveLiquidity(this),

            t0for1: new AeropoolSwap(this, [this.token0], [this.token1]),
            t1for0: new AeropoolSwap(this, [this.token1], [this.token0]),
          }

    if (
      this.poolType === AerodromePoolType.CL ||
      this.lpToken.address.address === GAS_TOKEN_ADDRESS ||
      this.lpToken.address.address === ZERO
    ) {
      this.totalSupply = async () => this.lpToken.zero
      return
    }
    const erc20Inst = IERC20__factory.connect(
      this.lpToken.address.address,
      this.universe.provider
    )
    this.totalSupply = this.universe.createCachedProducer(async () => {
      try {
        const totalSupply = await erc20Inst.callStatic.totalSupply()
        return this.lpToken.from(totalSupply)
      } catch (e) {
        return this.lpToken.from(0)
      }
    })
  }

  public get poolFee() {
    return this.data.poolFee.toBigInt()
  }
  public get poolType() {
    return getPoolType(this.data.poolType)
  }
  public get tickSpacing() {
    return this.data.poolType
  }
  public get isStable() {
    return this.poolType === AerodromePoolType.STABLE
  }

  public get address() {
    return this.poolAddress
  }

  public get universe() {
    return this.context.universe
  }

  public async getAmountOut(amountIn: TokenQuantity) {
    amountIn = amountIn.sub(
      amountIn.token.from((amountIn.amount * this.poolFee) / FEE_DIVISOR)
    )

    const reserves = await this.reserves()

    let [_reserve0, _reserve1] = reserves.map((i) => i.amount)

    let amountInBn = amountIn.amount
    const D0FOR1 = amountIn.token == this.token0
    if (this.isStable) {
      const xy = getK(this, _reserve0, _reserve1)

      _reserve0 = (_reserve0 * ONE) / this.token0.scale
      _reserve1 = (_reserve1 * ONE) / this.token1.scale
      const [reserveA, reserveB] = D0FOR1
        ? [_reserve0, _reserve1]
        : [_reserve1, _reserve0]

      amountInBn = D0FOR1
        ? (amountInBn * ONE) / this.token0.scale
        : (amountInBn * ONE) / this.token1.scale
      const y = reserveB - getY(this, amountInBn + reserveA, xy, reserveB)
      return (y * (D0FOR1 ? this.token1.scale : this.token0.scale)) / ONE
    } else {
      const [reserveA, reserveB] = D0FOR1
        ? [_reserve0, _reserve1]
        : [_reserve1, _reserve0]
      return (amountInBn * reserveB) / (reserveA + amountInBn)
    }
  }

  private async direction(amountIn: TokenQuantity) {
    const D0FOR1 = amountIn.token == this.token0
    const reserves = await this.reserves()
    const [reserveA, reserveB] = D0FOR1
      ? [reserves[0], reserves[1]]
      : [reserves[1], reserves[0]]
    return [D0FOR1, reserveA, reserveB, reserves] as const
  }

  public async quoteRemoveLiquidity(lpTokens: TokenQuantity) {
    const supply = await this.totalSupply()
    const [reserveA, reserveB] = await this.reserves()
    const amountA = (lpTokens.amount * reserveA.amount) / supply.amount
    const amountB = (lpTokens.amount * reserveB.amount) / supply.amount
    return [this.token0.from(amountA), this.token1.from(amountB)]
  }
  public async quoteAddLiquidity(desiredInput: TokenQuantity) {
    const [D0FOR1, reserveA, reserveB, [res0, res1]] = await this.direction(
      desiredInput
    )

    const amountBOptimal = reserveB.token.from(
      quoteLiquidity(desiredInput.amount, reserveA.amount, reserveB.amount)
    )

    let amount0: TokenQuantity
    let amount1: TokenQuantity

    const _totalSupply = (await this.totalSupply()).amount

    ;[amount0, amount1] = D0FOR1
      ? [desiredInput, amountBOptimal]
      : [amountBOptimal, desiredInput]

    const A = (amount0.amount * _totalSupply) / res0.amount
    const B = (amount1.amount * _totalSupply) / res1.amount
    const liquidity = this.lpToken.from(A < B ? A : B)

    return {
      amount0: amount0,
      amount1: amount1,
      liquidity,
    }
  }

  public static async create(
    context: AerodromeContext,
    address: Address,
    pool: SwapLpStructOutput
  ) {
    const universe = context.universe
    const [lpToken, token0, token1] = await Promise.all([
      getPoolType(pool.poolType) === AerodromePoolType.CL
        ? universe.nativeToken
        : universe.getToken(Address.from(pool.lp)),
      universe.getToken(Address.from(pool.token0)),
      universe.getToken(Address.from(pool.token1)),
    ])

    const inst = new AerodromeStablePool(
      context,
      address,
      lpToken,
      token0,
      token1,
      pool
    )

    if (inst.poolType === AerodromePoolType.CL) {
      universe.addAction(inst.actions.t0for1)
      universe.addAction(inst.actions.t1for0)
    } else {
      const supply = await inst.totalSupply()
      if (supply.amount >= inst.lpToken.scale) {
        universe.addAction(inst.actions.t0for1)
        universe.addAction(inst.actions.t1for0)

        try {
          await inst.actions.removeLiquidity!.quote([inst.lpToken.one])

          universe.addAction(new WrappedLpAdd(inst, inst.token0, inst.token1))
          universe.addAction(new WrappedLpAdd(inst, inst.token1, inst.token0))
          universe.addAction(new WrappedLpRemove(inst, inst.token0))
          universe.addAction(new WrappedLpRemove(inst, inst.token1))

          universe.addSingleTokenPriceSource({
            token: inst.lpToken,
            priceFn: async () => {
              const underlying = await inst.actions.removeLiquidity!.quote([
                inst.lpToken.one,
              ])
              const prices = await Promise.all(
                underlying.map((i) => universe.fairPrice(i))
              )
              let out = universe.usd.zero
              for (let i = 0; i < prices.length; i++) {
                const qty = underlying[i]
                const price = prices[i]
                if (price == null) {
                  throw new Error(
                    `Failed to price ${inst.lpToken}: Missing price provider for ${qty.token}`
                  )
                }
                out = out.add(price)
              }
              return out
            },
          })
        } catch (e) {}
      }
    }

    return inst
  }
}
const f = (x0: bigint, y: bigint) => {
  const _a = (x0 * y) / ONE
  const _b = (x0 * x0) / ONE + (y * y) / ONE
  return (_a * _b) / ONE
}

const d = (x0: bigint, y: bigint) => {
  return (3n * x0 * ((y * y) / ONE)) / ONE + (((x0 * x0) / ONE) * x0) / ONE
}

const getY = (pool: AerodromeStablePool, x0: bigint, xy: bigint, y: bigint) => {
  for (let i = 0; i < 255; i++) {
    const k = f(x0, y)
    if (k < xy) {
      const _d = d(x0, y)
      if (_d === 0n) {
        throw new Error('No solution')
      }
      let dy = ((xy - k) * ONE) / _d
      if (dy === 0n) {
        if (k === xy) {
          // We found the correct answer. Return y
          return y
        }
        if (getK(pool, x0, y + 1n) > xy) {
          return y + 1n
        }
        dy = 1n
      }
      y = y + dy
    } else {
      const _d = d(x0, y)
      if (_d === 0n) {
        throw new Error('No solution')
      }
      let dy = ((k - xy) * ONE) / _d
      if (dy === 0n) {
        if (k === xy || f(x0, y - 1n) < xy) {
          // Likewise, if k == xy, we found the correct answer.
          // If _f(x0, y - 1) < xy, then we are close to the correct answer.
          // There's no closer answer than "y"
          // It's worth mentioning that we need to find y where f(x0, y) >= xy
          // As a result, we can't return y - 1 even it's closer to the correct answer
          return y
        }
        dy = 1n
      }
      y = y - dy
    }
  }
  throw new Error('!y')
}

const getK = (pool: AerodromeStablePool, x: bigint, y: bigint) => {
  if (pool.isStable) {
    const _x = (x * ONE) / pool.token0.scale
    const _y = (y * ONE) / pool.token1.scale
    const _a = (_x * _y) / ONE
    const _b = (_x * _x) / ONE + (_y * _y) / ONE
    return (_a * _b) / ONE
  } else {
    return x * y
  }
}

const quoteLiquidity = (
  amountA: bigint,
  reserveA: bigint,
  reserveB: bigint
) => {
  if (amountA === 0n) throw new Error('InsufficientAmount')
  if (reserveA === 0n || reserveB === 0n)
    throw new Error('InsufficientLiquidity')
  return (amountA * reserveB) / reserveA
}

export class AerodromeContext {
  public readonly weirollV2Router: Contract
  public readonly weirollAerodromeRouterCaller: Contract

  private readonly byLp = new Map<Address, Promise<AerodromeStablePool>>()
  private readonly pools = new DefaultMap<
    Address,
    Map<Address, Promise<AerodromeStablePool>>
  >(() => new Map())
  constructor(
    public readonly universe: Universe,
    public readonly router: IAerodromeRouter,
    public readonly mixedRouter: IMixedRouteQuoterV1,
    public readonly callslip: SlipstreamRouterCall,
    public readonly aerodromeSwapRouterAddr: Address
  ) {
    this.weirollV2Router = Contract.createContract(router, CommandFlags.CALL)
    this.weirollAerodromeRouterCaller = Contract.createLibrary(callslip)
  }

  public async definePool(address: Address, pool: SwapLpStructOutput) {
    if (getPoolType(pool.poolType) == AerodromePoolType.CL) {
      const inst = AerodromeStablePool.create(this, address, pool)
      this.pools
        .get(Address.from(pool.token0))
        .set(Address.from(pool.token1), inst)
      this.pools
        .get(Address.from(pool.token1))
        .set(Address.from(pool.token0), inst)
      return await inst
    }
    if (this.byLp.has(Address.from(pool.lp))) {
      return await this.byLp.get(Address.from(pool.lp))!
    }
    const inst = AerodromeStablePool.create(this, address, pool)
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
