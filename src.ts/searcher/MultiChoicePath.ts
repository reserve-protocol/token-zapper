import { Universe } from '../Universe'
import { DestinationOptions, InteractionConvention } from '../action/Action'
import { type Address } from '../base/Address'
import { Config } from '../configuration/ChainConfiguration'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { BaseSearcherResult } from './SearcherResult'
import { SingleSwap, SwapPath, SwapPaths } from './Swap'
import { ToTransactionArgs } from './ToTransactionArgs'
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined'
import { ZapTransaction } from './ZapTransaction'
import { Searcher } from './Searcher'
import { DefaultMap } from '../base/DefaultMap'
import { UniswapRouterAction } from '../configuration/setupUniswapRouter'

export const resolveTradeConflicts = async (
  searcher: Searcher<any>,
  abortSignal: AbortSignal,
  inTrades: SwapPath[]
) => {
  try {
    const uniActions = inTrades.filter(
      (i) => i.steps[0].action instanceof UniswapRouterAction
    )
    if (uniActions.length <= 1) {
      return inTrades
    }

    const sameFirstPool = new DefaultMap<Address, SwapPath[]>(() => [])
    for (const trade of uniActions) {
      const uniAction = trade.steps[0].action as UniswapRouterAction
      const parsed = uniAction.currentQuote
      sameFirstPool.get(parsed.swaps[0].pool.address).push(trade)
    }

    const newTrades: SwapPath[] = []
    for (const [_, trades] of sameFirstPool.entries()) {
      if (trades.length === 1) {
        continue
      }

      inTrades = inTrades.filter((i) => !trades.includes(i))

      // console.log(
      //   `Found two uni trades ${trades.length} ${swapDesc.join(
      //     ', '
      //   )} trading on the same pool as the firs step: ${pool}`
      // )

      const actions = trades.map(
        (i) => i.steps[0].action as UniswapRouterAction
      )

      const {
        inputToken: [inputToken],
        currentQuote: {
          swaps: [{ tokenOut: outputToken }],
        },
      } = actions[0]

      const inputs = actions
        .map((i) => i.inputQty)
        .reduce((l, r) => l.add(r), inputToken.zero)

      const uniDex = actions[0].dex

      const newFirstSwap = await uniDex.swap(
        abortSignal,
        inputs,
        outputToken,
        searcher.defaultInternalTradeSlippage
      )

      newTrades.push(newFirstSwap)
      const combinedFirstTradeOutput = (
        newFirstSwap.steps[0].action as UniswapRouterAction
      ).outputQty.amount
      let total = combinedFirstTradeOutput - combinedFirstTradeOutput / 10000n
      const prTrade = total / BigInt(actions.length)

      await Promise.all(
        actions.map(async (nextTrade) => {
          const newInput = outputToken.from(total < prTrade ? total : prTrade)
          total -= prTrade

          // console.log(
          //   `Finding new trade ${newInput} -> ${nextTrade.outputToken[0]}`
          // )
          const newNextTrade = await uniDex.swap(
            abortSignal,
            newInput,
            nextTrade.outputToken[0],
            searcher.defaultInternalTradeSlippage
          )
          // console.log(newNextTrade.steps[0].action.toString())
          newTrades.push(newNextTrade)
        })
      )
      const outputAtTheEnd = [...inTrades, ...newTrades]
      return outputAtTheEnd
    }
    return inTrades
  } catch (e: any) {
    // console.log(e)
    // console.log(e.stack)
    throw e
  }
}
export const generateAllPermutations = async function (
  universe: UniverseWithERC20GasTokenDefined,
  arr: MultiChoicePath[],
  precursorTokens: Set<Token>
): Promise<SwapPath[][]> {
  function combos(
    list: MultiChoicePath[],
    n: number = 0,
    result: SwapPath[][] = [],
    current: SwapPath[] = []
  ) {
    if (n === list.length) result.push(current)
    else
      list[n].paths.forEach((item) => {
        combos(list, n + 1, result, [...current, item])
      })
    return result
  }

  const allCombos = combos(arr)

  const withoutComflicts = allCombos.filter(
    (paths) => willPathsHaveAddressConflicts(paths).length === 0
  )
  const valuedTrades = await Promise.all(
    withoutComflicts.map(async (trades) => {
      const netOut = universe.usd.zero
      for (const trade of trades) {
        if (precursorTokens.has(trade.outputs[0].token)) {
          netOut.add(await trade.netValue(universe))
        }
      }

      return {
        trades,
        netOut,
      }
    })
  )
  valuedTrades.sort((l, r) => -l.netOut.compare(r.netOut))

  return valuedTrades.map((i) => i.trades)
}
const sortZaps = (
  txes: {
    searchResult: BaseSearcherResult
    tx: ZapTransaction
  }[],
  allQuotes: BaseSearcherResult[],
  startTime: number
) => {
  let failed = txes
  if (txes.length === 0) {
    console.log(`All ${txes.length}/${allQuotes.length} potential zaps failed`)
    throw new Error('No zaps found')
  }

  txes.sort((l, r) => -l.tx.compare(r.tx))

  console.log(`${txes.length} / ${allQuotes.length} passed simulation:`)
  for(const tx of txes) {
    console.log(tx.tx.stats.toString())
  }
  return {
    failed,
    bestZapTx: txes[0],
    alternatives: txes.slice(1, txes.length),
    timeTaken: Date.now() - startTime,
  }
}
export const createConcurrentStreamingSeacher = (
  searcher: Searcher<UniverseWithERC20GasTokenDefined>,
  toTxArgs: ToTransactionArgs
) => {
  const abortController = new AbortController()
  const results: {
    tx: ZapTransaction
    searchResult: BaseSearcherResult
  }[] = []

  setTimeout(() => {
    abortController.abort()
  }, searcher.config.maxSearchTimeMs ?? 10000)

  const allCandidates: BaseSearcherResult[] = []
  const seen: Set<string> = new Set()
  const onResult = async (result: BaseSearcherResult): Promise<void> => {
    const id = result.describe().join(';')
    if (seen.has(id)) {
      return
    }
    seen.add(id)
    allCandidates.push(result)
    try {
      const tx = await searcher.perf.measurePromise(
        'toTransaction',
        result.toTransaction(toTxArgs)
      )
      const inVal = parseFloat(tx.inputValueUSD.format())
      const dustVal = parseFloat(tx.stats.dust.valueUSD.format())
      const outVal = parseFloat(tx.stats.valueUSD.format()) // Total out value

      // If there is more than 2% dust, reject
      if (outVal / 50 < dustVal) {
        console.log('Large amount of dust')
        return
      }
      const inToOutRatio = outVal / inVal
      if (inToOutRatio < 0.95) {
        console.log('Low in to out ratio')
        // If there is more than 5% loss of value, reject
        return
      }
      results.push({
        tx,
        searchResult: result,
      })
      const resCount = results.length
      if (resCount >= searcher.config.searcherMinRoutesToProduce) {
        setTimeout(() => abortController.abort(), 250);
      }
    } catch (e: any) {
      // console.log(e)
      // console.log('Failed to convert to transaction')
      // console.log(e.stack)
    }
  }

  return {
    abortController,
    onResult,
    resultReadyPromise: new Promise((resolve) => {
      abortController.signal.addEventListener('abort', () => {
        resolve(null)
      })
    }),
    getResults: (startTime: number) => {
      return sortZaps(
        results.map((i) => ({
          searchResult: i.searchResult,
          tx: i.tx,
        })),
        allCandidates,
        startTime
      )
    },
  }
}
const willPathsHaveAddressConflicts = (paths: SwapPath[]) => {
  const addressesInUse = new Set<Address>()

  for (const path of paths) {
    for (const step of path.steps) {
      if (!step.action.oneUsePrZap) {
        continue
      }
      for (const addr of step.action.addressesInUse) {
        if (addressesInUse.has(addr)) {
          addressesInUse.add(addr)
          return [...addressesInUse]
        }
      }
    }
  }

  return []
}
export const chunkifyIterable = function* <T>(
  iterable: Iterable<T>,
  chunkSize: number,
  abort: AbortSignal
) {
  let chunk: T[] = []
  for (const item of iterable) {
    chunk.push(item)
    if (chunk.length >= chunkSize) {
      yield chunk
      chunk = []
    }
  }
  if (chunk.length !== 0) {
    yield chunk
  }
}
export class MultiChoicePath implements SwapPath {
  private index: number = 0
  constructor(
    public readonly universe: UniverseWithERC20GasTokenDefined,
    public readonly paths: SwapPath[]
  ) {
    if (this.paths.length === 0) {
      throw new Error('No paths provided')
    }
  }
  get hasMultipleChoices() {
    return this.paths.length > 1
  }

  get supportsDynamicInput() {
    return this.path.supportsDynamicInput
  }

  intoSwapPaths(universe: Universe<Config>): SwapPaths {
    return new SwapPaths(
      universe,
      this.path.inputs,
      this.paths,
      this.outputs,
      this.outputValue,
      this.destination
    )
  }

  public increment() {
    this.index = (this.index + 1) % this.paths.length
  }

  public readonly type = 'MultipleSwaps'
  get proceedsOptions(): DestinationOptions {
    return this.path.proceedsOptions
  }
  get interactionConvention(): InteractionConvention {
    return this.path.interactionConvention
  }
  get address(): Address {
    return this.path.address
  }
  get addressInUse(): Set<Address> {
    return this.path.steps[0].action.addressesInUse
  }
  public get oneUsePrZap() {
    return this.path.steps[0].action.oneUsePrZap
  }
  exchange(tokenAmounts: TokenAmounts): Promise<void> {
    return this.path.exchange(tokenAmounts)
  }
  compare(other: SwapPath): number {
    return this.path.compare(other)
  }
  cost(
    universe: Universe<Config>
  ): Promise<{ units: bigint; txFee: TokenQuantity; txFeeUsd: TokenQuantity }> {
    return this.path.cost(universe)
  }
  netValue(universe: Universe<Config>): Promise<TokenQuantity> {
    return this.path.netValue(universe)
  }
  get gasUnits(): bigint {
    return this.path.gasUnits
  }
  get path() {
    if (this.paths.length === 1) {
      return this.paths[0]
    }
    return this.paths[this.index]
  }

  get inputs(): TokenQuantity[] {
    return this.path.inputs
  }
  get steps(): SingleSwap[] {
    return this.path.steps
  }
  get outputs(): TokenQuantity[] {
    return this.path.outputs
  }
  get outputValue(): TokenQuantity {
    return this.path.outputValue
  }
  get destination(): Address {
    return this.path.destination
  }

  toString() {
    return this.path.toString()
  }

  describe(): string[] {
    let out = ['MultiChoicePath{']
    for (const path of this.paths) {
      out.push(
        path
          .describe()
          .map((i) => '  ' + i)
          .join('\n'),
        ','
      )
    }
    out.push('  current: ' + this.index + '\n')
    out.push('}')
    return out
  }
}
