import { defaultAbiCoder } from 'ethers/lib/utils'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { DefaultMap } from '../base/DefaultMap'
import { GAS_TOKEN_ADDRESS, ZERO } from '../base/constants'

import { utils } from 'ethers'
import {
  IAerodromeRouter,
  IERC20__factory,
  IMixedRouteQuoterV1,
  SlipstreamRouterCall,
} from '../contracts'
import { SwapLpStructOutput as SwapLpStructOutputDef } from '../contracts/contracts/Aerodrome.sol/IAerodromeSugar'
import { Token, TokenQuantity } from '../entities/Token'
import { CommandFlags, Contract, Planner, Value } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
  ONE,
} from './Action'
import { TokenType } from '../entities/TokenClass'

export enum AerodromePoolType {
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
  CL = 'CL',
}

type SwapLpStructOutput = Pick<
  SwapLpStructOutputDef,
  'poolType' | 'token0' | 'token1' | 'factory' | 'lp' | 'poolFee'
>

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
    return 1n
  }

  public async liquidity(): Promise<number> {
    const out = await this.pool.reserves()
    const prices = await Promise.all(
      out.map((t) => t.price().then((i) => i.asNumber()))
    )

    const sum = prices.reduce((a, b) => a + b, 0)
    return sum
  }

  abstract get actionName(): string

  public get supportsDynamicInput(): boolean {
    return true
  }
  public get returnsOutput(): boolean {
    return false
  }

  public get oneUsePrZap(): boolean {
    return true
  }
  public get addressesInUse(): Set<Address> {
    return new Set([this.pool.address])
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

  get dustTokens(): Token[] {
    return [this.pool.token0, this.pool.token1]
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    const q = await this.pool.quoteAdd2Liquidity(amountsIn)
    return [q.liquidity]
  }

  async quoteWithDust(amountsIn: TokenQuantity[]) {
    const q = await this.pool.quoteAdd2Liquidity(amountsIn).catch((e) => {
      console.log(`${amountsIn.join(', ')} -> ${this}: failed`)
      console.log(e)
      throw e
    })
    return {
      output: [q.liquidity],
      dust: q.remaining,
    }
  }
  gasEstimate(): bigint {
    return 500000n
  }

  async inputAmounts(): Promise<TokenQuantity[]> {
    const q = await this.pool.quoteAddLiquidity(this.pool.token0.one)
    return [q.amount0, q.amount1]
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
  public get addressesInUse(): Set<Address> {
    return new Set([this.pool.address])
  }

  public async liquidity(): Promise<number> {
    const out = await this.pool.reserves()
    const prices = await Promise.all(
      out.map((t) => t.price().then((i) => i.asNumber()))
    )

    const sum = prices.reduce((a, b) => a + b, 0)
    return sum
  }

  get isTrade() {
    return true
  }

  get dependsOnRpc() {
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
      await this.pool.context.mixedRouter.callStatic.quoteExactInputSingleV3({
        tokenIn: this.input.address.address,
        tokenOut: this.output.address.address,
        amountIn: amountIn.amount,
        tickSpacing: this.pool.tickSpacing,
        sqrtPriceLimitX96: 0,
      })

    return [this.output.from(result.amountOut)]
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

  get isTrade() {
    return true
  }

  get dependsOnRpc() {
    return false
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

const FEE_DIVISOR = 10000n
const MAX_NUM = 2n ** 256n - 1n
class AerodromeStablePool {
  public reserves: () => Promise<TokenQuantity[]>
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
        const balance0 = await this.universe.balanceOf(
          this.token0,
          this.poolAddress
        )
        const balance1 = await this.universe.balanceOf(
          this.token1,
          this.poolAddress
        )
        return [balance0, balance1]
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
  public async quoteAdd2Liquidity([amount0, amount1]: TokenQuantity[]) {
    const MAX_RES = {
      amount0: this.token0.from(MAX_NUM),
      amount1: this.token1.from(MAX_NUM),
      liquidity: this.lpToken.from(0),
    }
    const q0 = amount0.isZero ? MAX_RES : await this.quoteAddLiquidity(amount0)
    const q1 = amount1.isZero ? MAX_RES : await this.quoteAddLiquidity(amount1)
    const q = q0.liquidity.amount < q1.liquidity.amount ? q0 : q1
    const rem0 = amount0.sub(q.amount0)
    const rem1 = amount1.sub(q.amount1)
    return {
      liquidity: q.liquidity,
      amounts: [q.amount0, q.amount1],
      remaining: [rem0, rem1],
    }
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

    const interestingPools = new Set([
      Address.from('0x2C4909355b0C036840819484c3A882A95659aBf3'),
      Address.from('0x89D0F320ac73dd7d9513FFC5bc58D1161452a657'),
      Address.from('0x2578365B3dfA7FfE60108e181EFb79FeDdec2319'),
      Address.from('0x4A311ac4563abc30E71D0631C88A6232C1309ac5'),
      Address.from('0x7f670f78B17dEC44d5Ef68a48740b6f8849cc2e6'),
    ])

    const interestingTokens = new Set([
      ...Object.values(universe.commonTokens),
      ...Object.values(universe.rTokens),
    ])

    if (!interestingPools.has(inst.address)) {
      if (!(interestingTokens.has(token0) && interestingTokens.has(token1))) {
        return inst
      }
    }

    if (inst.poolType === AerodromePoolType.CL) {
      universe.addAction(inst.actions.t0for1)
      universe.addAction(inst.actions.t1for0)
    } else {
      universe.tokenType.set(inst.lpToken, Promise.resolve(TokenType.LPToken))
      universe.addSingleTokenPriceSource({
        token: inst.lpToken,
        priceFn: async () => {
          try {
            const [[balance0, balance1], totalSupply] = await Promise.all([
              inst.reserves(),
              inst.totalSupply(),
            ])
            const [price0, price1] = await Promise.all([
              await balance0.price(),
              await balance1.price(),
            ])

            const out =
              (price0.asNumber() + price1.asNumber()) / totalSupply.asNumber()
            const v = universe.usd.from(out)
            console.log(`${lpToken}: ${v.asNumber()}`)
            return v
          } catch (e) {
            console.log(
              `LpTokenPrice provider: Failed to get price for ${inst.lpToken}`,
              e
            )
            throw e
          }
        },
      })

      // try {
      //   const [cls0, cls1] = await Promise.all([
      //     universe.tokenClass.get(token0),
      //     universe.tokenClass.get(token1),
      //   ])
      //   if (cls0 == cls1) {
      //     universe.tokenClass.set(lpToken, Promise.resolve(cls0))
      //   } else {
      //     universe.tokenClass.set(lpToken, Promise.resolve(lpToken))
      //   }
      // } catch (e) {
      //   universe.tokenClass.set(lpToken, Promise.resolve(lpToken))
      // }

      if (interestingPools.has(inst.address)) {
        universe.addAction(inst.actions.t0for1)
        universe.addAction(inst.actions.t1for0)
        universe.addAction(inst.actions.addLiquidity!)
        universe.addAction(inst.actions.removeLiquidity!)
        universe.mintableTokens.set(inst.lpToken, inst.actions.addLiquidity!)
        await universe.defineLPToken(
          inst.lpToken,
          async (amt) => await inst.quoteRemoveLiquidity(amt),
          async (amts) => {
            const q0 = await inst.quoteAddLiquidity(amts[0])
            const q1 = await inst.quoteAddLiquidity(amts[1])
            if (q0.liquidity.amount < q1.liquidity.amount) {
              return q0.liquidity
            }
            return q1.liquidity
          }
        )

        return inst
      }

      const supply = await inst.totalSupply()

      if (
        supply.amount >= inst.lpToken.scale ||
        interestingPools.has(inst.address)
      ) {
        universe.addAction(inst.actions.t0for1)
        universe.addAction(inst.actions.t1for0)

        try {
          await inst.actions.removeLiquidity!.quote([inst.lpToken.one])

          universe.addAction(inst.actions.addLiquidity!)
          universe.addAction(inst.actions.removeLiquidity!)

          universe.mintableTokens.set(inst.lpToken, inst.actions.addLiquidity!)
          await universe.defineLPToken(
            inst.lpToken,
            async (amt) => await inst.quoteRemoveLiquidity(amt),
            async (amts) => {
              const q0 = await inst.quoteAddLiquidity(amts[0])
              const q1 = await inst.quoteAddLiquidity(amts[1])
              if (q0.liquidity.amount < q1.liquidity.amount) {
                return q0.liquidity
              }
              return q1.liquidity
            }
          )
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
