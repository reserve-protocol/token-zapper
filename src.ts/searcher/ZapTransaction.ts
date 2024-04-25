import { type TransactionRequest } from '@ethersproject/providers'
import { PricedTokenQuantity, type TokenQuantity } from '../entities/Token'
import { type ZapERC20ParamsStruct } from '../contracts/contracts/Zapper.sol/Zapper'
import { printPlan, Planner } from '../tx-gen/Planner'
import { Universe } from '../Universe'
import { type BaseSearcherResult } from './SearcherResult'

class DustStats {
  private constructor(
    public readonly dust: PricedTokenQuantity[],
    public readonly valueUSD: TokenQuantity
  ) {}

  public static async fromDust(
    universe: Universe,
    dust: PricedTokenQuantity[]
  ) {
    const valueUSD = dust.reduce((a, b) => a.add(b.price), universe.usd.zero)
    return new DustStats(dust, valueUSD)
  }

  toString() {
    if (this.dust.length === 0) return ''
    return `[${this.dust.join(', ')}] (${this.valueUSD})`
  }
}
class FeeStats {
  private constructor(
    private readonly universe: Universe,
    public readonly units: bigint
  ) {}

  get txFee() {
    const ethFee = this.universe.nativeToken.from(
      this.units * this.universe.gasPrice
    )
    return new PricedTokenQuantity(
      ethFee,
      this.universe.gasTokenPrice
        .into(ethFee.token)
        .mul(ethFee)
        .into(this.universe.usd)
    )
  }

  public static fromGas(universe: Universe, gasUnits: bigint) {
    return new FeeStats(universe, gasUnits)
  }

  [Symbol.toPrimitive](): string {
    return this.toString()
  }

  readonly [Symbol.toStringTag] = 'FeeStats'

  toString() {
    return `${this.txFee} (${this.units} wei)`
  }
}
export class ZapTxStats {
  private constructor(
    public readonly universe: Universe,
    private readonly gasUnits: bigint,
    public readonly input: PricedTokenQuantity,
    public readonly output: PricedTokenQuantity,
    public readonly dust: DustStats,
    public readonly outputs: PricedTokenQuantity[],
    public readonly valueUSD: TokenQuantity
  ) {}

  get txFee() {
    return FeeStats.fromGas(this.universe, this.gasUnits)
  }

  get netValueUSD() {
    return this.valueUSD.sub(this.txFee.txFee.price)
  }

  public static async create(
    universe: Universe,
    input: {
      gasUnits: bigint
      input: TokenQuantity
      output: TokenQuantity
      dust: TokenQuantity[]
    }
  ) {
    const [inputValue, outputValue, ...dustValue] = await Promise.all(
      [input.input, input.output, ...input.dust].map((i) =>
        universe.priceQty(i)
      )
    )

    const totalValueUSD = dustValue.reduce(
      (a, b) => a.add(b.price),
      outputValue.price
    )

    return new ZapTxStats(
      universe,
      input.gasUnits,
      inputValue,
      outputValue,
      await DustStats.fromDust(universe, dustValue),
      [outputValue, ...dustValue],
      totalValueUSD
    )
  }

  compare(other: ZapTxStats) {
    return this.netValueUSD.compare(other.netValueUSD)
  }

  get isThereDust() {
    return this.dust.dust.length > 0
  }

  [Symbol.toPrimitive](): string {
    return this.toString()
  }

  readonly [Symbol.toStringTag] = 'ZapTxStats'

  toString() {
    if (this.isThereDust)
      return `${this.input} -> ${this.output} (+ $${this.dust.valueUSD} D.) @ fee: ${this.txFee.txFee.price}`
    return `${this.input} -> ${this.output} @ fee: ${this.txFee.txFee.price}`
  }
}

export class ZapTransaction {
  private constructor(
    public readonly planner: Planner,
    public readonly searchResult: BaseSearcherResult,
    public readonly transaction: {
      params: ZapERC20ParamsStruct
      tx: TransactionRequest
    },
    public readonly stats: ZapTxStats
  ) {}

  get universe() {
    return this.searchResult.universe
  }

  get input() {
    return this.stats.input.quantity
  }

  get output() {
    return this.stats.output.quantity
  }
  get outputs() {
    return this.stats.outputs.map((o) => o.quantity)
  }
  get dust() {
    return this.stats.dust
  }
  get inputValueUSD() {
    return this.stats.input.price
  }
  get outputsValueUSD() {
    return this.stats.outputs.map((o) => o.price)
  }
  get dustValueUSD() {
    return this.stats.dust.valueUSD
  }
  get outputValueUSD() {
    return this.stats.valueUSD
  }
  get gas() {
    return this.stats.txFee.units
  }
  get txFee() {
    return this.stats.txFee.txFee
  }
  get txFeeUSD() {
    return this.stats.txFee.txFee.price
  }
  get netUSD() {
    return this.stats.netValueUSD
  }

  describe() {
    return [
      'Transaction {',
      `  zap: ${this.stats},`,
      `  dust: [${this.stats.dust.dust.join(', ')}],`,
      `  fees: ${this.stats.txFee}`,
      '  program: [',
      ...printPlan(this.planner, this.universe).map((c) => '   ' + c),
      '  ],',
      '}',
    ]
  }

  toString() {
    return `ZapTx(${this.stats}, ${this.stats.txFee})`
  }

  public static async create(
    searchResult: BaseSearcherResult,
    planner: Planner,
    tx: {
      params: ZapERC20ParamsStruct
      tx: TransactionRequest
    },
    stats: ZapTxStats
  ) {
    return new ZapTransaction(planner, searchResult, tx, stats)
  }

  compare(other: ZapTransaction) {
    return this.stats.compare(other.stats)
  }
}
