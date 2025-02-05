import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'

import { ParamType } from '@ethersproject/abi'
import { BigNumber, BigNumberish, Contract } from 'ethers'
import { IERC20, IERC20__factory } from '../contracts'
import ABI from '../curve-js/src/constants/abis/factory-crypto/factory-crypto-pool-2.json'
import { TokenQuantity, type Token } from '../entities/Token'
import { Planner, Value, encodeArg } from '../tx-gen/Planner'
import {
  Action,
  BaseAction,
  DestinationOptions,
  InteractionConvention,
} from './Action'
import { CryptoswapPool } from '../entities/CurvePool'

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
  public get dependsOnRpc(): boolean {
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
    const [price0, price1] = await Promise.all([
      tok0PrLpToken.price(),
      tok1PrLpToken.price(),
    ])
    const sum = price0!.add(price1!)
    const out = [price0!.div(sum).into(token0), price1!.div(sum).into(token1)]
    return out
  }

  async plan(
    planner: Planner,
    inputs: Value[],
    _: Address,
    predictedInputs: TokenQuantity[]
  ): Promise<null | Value[]> {
    const lib = this.gen.Contract.createLibrary(
      new Contract(
        this.pool.universe.config.addresses.curveCryptoFactoryHelper.address,
        [
          'function addliquidity(uint256 amount0,uint256 amount1,address pool,uint256 minOut,bool useEth) external returns (uint256)',
        ],
        this.pool.universe.provider
      )
    )
    const [minOut] = await this.quote(predictedInputs)
    return [
      planner.add(
        lib.addliquidity(
          inputs[0],
          inputs[1],
          this.pool.address.address,
          minOut.amount - minOut.amount / 20n,
          false
        ),
        `CurveFactoryCryptoPool.addliquidity(${predictedInputs.join(
          ', '
        )}) -> ${predictedInputs.join(', ')}`,
        `${this.protocol}_mint_${this.outputToken.join(
          '_'
        )}_using_${this.inputToken.join('_')}`
      )!,
    ]
  }

  public async quote([amt0, amt1]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const outLP = (await this.pool.poolInstance.callStatic.calc_token_amount([
      amt0.amount,
      amt1.amount,
    ])) as BigNumber
    const outLp = this.pool.lpToken.from(outLP)
    return [outLp]
  }
  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.address,
      pool.underlying,
      [pool.lpToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      pool.underlying.map((token) => new Approval(token, pool.address))
    )
  }
}

class CryptoFactoryPoolRemoveLiquidity extends CurveFactoryCryptoPoolBase {
  public get returnsOutput(): boolean {
    return false
  }

  private quoteOutputProp_: () => Promise<TokenQuantity[]>
  public async outputProportions(): Promise<TokenQuantity[]> {
    return await this.quoteOutputProp_()
  }
  async quote([amount]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const {
      totalSupply,
      balance0: bal0,
      balance1: bal1,
    } = await this.pool.poolInfo()
    return [
      bal0.token.from((bal0.amount * amount.amount) / totalSupply.amount),
      bal1.token.from((bal1.amount * amount.amount) / totalSupply.amount),
    ]
  }

  async plan(
    planner: Planner,
    [input]: Value[],
    dest: Address,
    [lpAmt]: TokenQuantity[]
  ) {
    const [amt0, amt1] = await this.quote([lpAmt])
    console.log(lpAmt.toString(), amt0.toString(), amt1.toString())
    const lib = this.gen.Contract.createContract(this.pool.poolInstance)
    planner.add(
      lib.remove_liquidity(
        input,
        encodeArg(
          [amt0.amount - amt0.amount / 50n, amt1.amount - amt1.amount / 50n],
          ParamType.fromString('uint256[2]')
        ),
        false,
        dest.address
      ),
      `${this.protocol}.${
        this.actionName
      }(${lpAmt.toString()}) -> ${amt0.toString()}, ${amt1.toString()}`
    )
    return null
  }
  get actionName() {
    return 'remove_liquidity'
  }

  constructor(public readonly pool: CurveFactoryCryptoPool) {
    super(
      pool.address,
      [pool.lpToken],
      pool.underlying,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
    this.quoteOutputProp_ = this.pool.universe.createCachedProducer(
      async () => {
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
      },
      12000 * 2
    )
  }
}

export class CurveFactoryCryptoPool {
  public readonly actions: {
    add: BaseAction
    remove: BaseAction
  }

  public poolInfo: () => Promise<{
    totalSupply: TokenQuantity
    balance0: TokenQuantity
    balance1: TokenQuantity
  }>

  get outputSlippage() {
    return 5n
  }
  get address() {
    return this.pool.address
  }

  public readonly poolInstance: Contract & {
    remove_liquidity: (
      amount: BigNumberish,
      amounts: [BigNumberish, BigNumberish],
      use_eth: boolean,
      recipient: string
    ) => Promise<[BigNumber, BigNumber]>
    add_liquidity: (
      amounts: [BigNumberish, BigNumberish],
      min_amount: BigNumberish,
      use_eth: boolean
    ) => Promise<BigNumber[]>
    calc_token_amount: (
      amounts: [BigNumberish, BigNumberish]
    ) => Promise<BigNumber>
  }

  public readonly lpTokenInstance: IERC20

  public get allPoolTokens() {
    return this.underlying
  }

  public readonly addressesInUse: Set<Address>

  public get lpToken() {
    return this.pool.lpToken
  }
  public get underlying() {
    return this.pool.coins
  }
  public update: () => Promise<void>

  public constructor(
    public readonly universe: Universe,
    public readonly pool: CryptoswapPool
  ) {
    this.addressesInUse = new Set([pool.address])
    this.update = universe.createCachedProducer(async () => {
      await this.pool.update()
    }, 12000)

    this.poolInfo = universe.createCachedProducer(async () => {
      const [bal0, bal1, totalSupply] = (await Promise.all([
        this.poolInstance.callStatic.balances(0),
        this.poolInstance.callStatic.balances(1),
        this.universe.approvalsStore.totalSupply(this.lpToken),
      ])) as [BigNumber, BigNumber, TokenQuantity]
      const [token0, token1] = this.allPoolTokens
      return {
        totalSupply: totalSupply,
        balance0: token0.from(bal0),
        balance1: token1.from(bal1),
      }
    }, 12000)
    this.actions = {
      add: new CryptoFactoryPoolAddLiquidity(this),
      remove: new CryptoFactoryPoolRemoveLiquidity(this),
    }

    this.lpTokenInstance = IERC20__factory.connect(
      this.lpToken.address.address,
      this.universe.provider
    )

    this.poolInstance = new Contract(
      this.pool.address.address,
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
    this.calcTokenAmountsPrLp = this.universe.createCachedProducer(async () => {
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
    }, 12000)

    universe.defineMintable(this.actions.add, this.actions.remove, true)

    // for (let i = 0; i < this.underlying.length; i++) {
    //   universe.addAction(new WrappedLPAdd(this.universe, this, i))
    //   universe.addAction(new WrappedLPRemove(this.universe, this, i))
    // }
  }
  public calcTokenAmountsPrLp: () => Promise<{
    token0: Token
    token1: Token
    tok0PrLpToken: TokenQuantity
    tok1PrLpToken: TokenQuantity
  }>

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

  const poolData = await CryptoswapPool.load(
    universe,
    pool,
    lpToken,
    underlying
  )

  const out = new CurveFactoryCryptoPool(universe, poolData)

  await universe.defineLPToken(
    out.lpToken,
    (qty) => out.actions.remove.quote([qty]),
    (qty) => out.actions.add.quote(qty).then((i) => i[0])
  )

  return out
}
