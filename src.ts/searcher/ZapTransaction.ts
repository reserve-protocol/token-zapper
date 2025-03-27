import { type TransactionRequest } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { hexlify, hexZeroPad, resolveProperties } from 'ethers/lib/utils'
import {
  PricedTokenQuantity,
  Token,
  type TokenQuantity,
} from '../entities/Token'
import { Planner, printPlan } from '../tx-gen/Planner'
import { Universe } from '../Universe'
import { ZapERC20ParamsStruct } from '../contracts/contracts/Zapper'
import { MultiZapParamsStruct } from '../contracts/contracts/NTo1Zapper'
import { ZapParamsStruct } from '../contracts/contracts/Zapper2'

interface BaseSearcherResult {
  universe: Universe
  zapId: string
  startTime: number
  blockNumber: number

  tokenPrices: Map<Token, PricedTokenQuantity>
}
class DustStats {
  private constructor(
    public readonly dust: PricedTokenQuantity[],
    public readonly valueUSD: TokenQuantity
  ) {}

  public static fromDust(
    result: BaseSearcherResult,
    dust: PricedTokenQuantity[]
  ) {
    const valueUSD = dust.reduce(
      (a, b) => a.add(b.price),
      result.universe.usd.zero
    )

    dust = [...dust].sort((a, b) => b.price.asNumber() - a.price.asNumber())
    return new DustStats(dust, valueUSD)
  }

  toString() {
    if (this.dust.length === 0) return ''
    return `[${this.dust.join(', ')}] (${this.valueUSD})`
  }
}
class FeeStats {
  private constructor(
    private readonly result: BaseSearcherResult,
    public readonly units: bigint
  ) {}

  get txFee() {
    const ethFee = this.result.universe.nativeToken.from(
      this.units * this.result.universe.gasPrice
    )
    return new PricedTokenQuantity(
      ethFee,
      this.result.universe.gasTokenPrice
        .into(ethFee.token)
        .mul(ethFee)
        .into(this.result.universe.usd)
    )
  }

  public static fromGas(universe: BaseSearcherResult, gasUnits: bigint) {
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
  get universe() {
    return this.result.universe
  }
  private constructor(
    public readonly result: BaseSearcherResult,
    private readonly gasUnits: bigint,

    // value of (input token qty)
    public readonly inputs: PricedTokenQuantity[],

    // value of (output token qty)
    public readonly output: PricedTokenQuantity,

    public readonly dust: DustStats,

    // all outputtoken + dust
    public readonly outputs: PricedTokenQuantity[],

    // value of (output token + dust)
    public readonly valueUSD: TokenQuantity,
    public readonly tokenPrices: PricedTokenQuantity[]
  ) {}

  get txFee() {
    return FeeStats.fromGas(this.result, this.gasUnits)
  }

  get netValueUSD() {
    return this.valueUSD.sub(this.txFee.txFee.price)
  }

  public static async create(
    result: BaseSearcherResult,
    input: {
      gasUnits: bigint
      inputs: TokenQuantity[]
      output: TokenQuantity
      dust: TokenQuantity[]
    }
  ) {
    const inputValues = await Promise.all(
      input.inputs.map(async (i) => {
        const price = (await i.price()).into(result.universe.usd)
        if (price == null) {
          return new PricedTokenQuantity(i, result.universe.usd.zero)
        }
        return new PricedTokenQuantity(i, price)
      })
    )

    const [outputValue, ...dustValue] = (
      await Promise.all(
        [input.output, ...input.dust].map(async (i) => {
          const price = (
            await i.price().catch(() => result.universe.usd.zero)
          ).into(result.universe.usd)
          if (price == null) {
            return new PricedTokenQuantity(i, result.universe.usd.zero)
          }
          return new PricedTokenQuantity(i, price)
        })
      )
    ).filter((i) => i != null)

    const totalValueUSD = dustValue.reduce(
      (a, b) => a.add(b.price),
      outputValue.price
    )

    const pricedTokens = await Promise.all(
      [...input.inputs, input.output, ...input.dust].map(async (i) => {
        const price = (
          await i.token.one.price().catch(() => result.universe.usd.zero)
        ).into(result.universe.usd)
        if (price == null) {
          return new PricedTokenQuantity(i, result.universe.usd.zero)
        }
        return new PricedTokenQuantity(i, price)
      })
    )

    return new ZapTxStats(
      result,
      input.gasUnits,
      inputValues,
      outputValue,
      DustStats.fromDust(result, dustValue),
      [outputValue, ...dustValue],
      totalValueUSD,
      pricedTokens
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
      return `${this.inputs.join(', ')} -> ${this.output} (+ $${
        this.dust.valueUSD
      } D. [${this.dust.dust.map((i) => i.quantity).join(', ')}])`
    return `${this.inputs.join(', ')} -> ${this.output} @ fee: ${
      this.txFee.txFee.price
    } | prices: ${this.tokenPrices
      .map((i) => `${i.quantity.token}: ${i.price}`)
      .join(', ')}`
  }
}

export class ZapTransaction {
  private constructor(
    public readonly planner: Planner,
    public readonly searchResult: BaseSearcherResult,
    public readonly transaction: {
      params: ZapERC20ParamsStruct | MultiZapParamsStruct | ZapParamsStruct
      tx: TransactionRequest
    },
    public readonly stats: ZapTxStats,
    public readonly price: number,
    public readonly priceTotalOut: number
  ) {}

  get universe() {
    return this.searchResult.universe
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
      params: ZapERC20ParamsStruct | MultiZapParamsStruct | ZapParamsStruct
      tx: TransactionRequest
    },
    stats: ZapTxStats
  ) {
    const totalInputValue =
      stats.inputs.reduce((l, r) => l + r.price.asNumber(), 0) +
      stats.txFee.txFee.price.asNumber()
    const price = stats.output.price.asNumber() / totalInputValue

    const priceTotalOut =
      stats.outputs.reduce((acc, r) => acc + r.price.asNumber(), 0) /
      totalInputValue
    return new ZapTransaction(
      planner,
      searchResult,
      tx,
      stats,
      price,
      priceTotalOut
    )
  }

  compare(other: ZapTransaction) {
    return this.stats.compare(other.stats)
  }

  async serialize() {
    return {
      id: hexZeroPad(hexlify(this.searchResult.zapId), 32),
      chainId: this.universe.chainId,
      zapType: this.searchResult.constructor.name,
      requestStart: new Date(this.searchResult.startTime).toISOString(),
      requestBlock: this.searchResult.blockNumber,
      createdAt: new Date().toISOString(),
      createdAtBlock: this.universe.currentBlock,
      searchTime: Date.now() - this.searchResult.startTime,
      tx: {
        to: this.transaction.tx.to ?? null,
        data:
          this.transaction.tx.data == null
            ? null
            : hexlify(this.transaction.tx.data),
        value: BigNumber.from(this.transaction.tx.value ?? '0x0').toString(),
        from: this.transaction.tx.from ?? null,
      },
      gasUnits: this.stats.txFee.units.toString(),
      inputs: this.stats.inputs.map((i) => i.serialize()),
      output: this.stats.output.serialize(),
      dust: this.dust.dust.map((i) => i.serialize()),
      description: this.describe().join('\n'),

      state: {
        prices: {
          searcherPrices: Array.from(
            this.searchResult.tokenPrices.entries()
          ).map(([k, v]) => ({
            token: k.serialize(),
            price: v.serialize(),
          })),
        },
      },
    }
  }
}
