import { Universe } from '../Universe'

import { DestinationOptions, InteractionConvention } from '../action/Action'
import { type MintRTokenAction } from '../action/RTokens'
import { type Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { simulationUrls } from '../base/constants'
import { wait } from '../base/controlflow'
import { Config } from '../configuration/ChainConfiguration'
import { UniswapRouterAction } from '../configuration/setupUniswapRouter'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { bfs } from '../exchange-graph/BFS'
import {
  BasketTokenSourcingRuleApplication,
  type PostTradeAction,
} from './BasketTokenSourcingRules'
import {
  BaseSearcherResult,
  BurnRTokenSearcherResult,
  MintRTokenSearcherResult,
  TradeSearcherResult,
} from './SearcherResult'
import { SingleSwap, SwapPath, SwapPaths, SwapPlan } from './Swap'
import { ToTransactionArgs } from './ToTransactionArgs'
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined'
import { ZapTransaction } from './ZapTransaction'

const generateAllPermutations = async function (
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
  // console.log(
  //   notFailed.map((i, idx) => `   ${idx}. ${i.tx.stats}`).join('\n')
  // )
  return {
    failed,
    bestZapTx: txes[0],
    alternatives: txes.slice(1, txes.length),
    timeTaken: Date.now() - startTime,
  }
}

const createConcurrentStreamingSeacher = (
  searcher: Searcher<UniverseWithERC20GasTokenDefined>,
  toTxArgs: ToTransactionArgs
) => {
  const abortController = new AbortController()
  const results: {
    tx: ZapTransaction
    searchResult: BaseSearcherResult
  }[] = []

  setTimeout(() => {
    if (results.length < searcher.minResults) {
      // console.log(`Only found ${results.length} results, timeout extended`)
      return
    }
    // console.log('Aborting search, timeout reached')
    abortController.abort()
  }, searcher.config.routerDeadline)

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
      const dustVal = parseFloat(tx.dustValueUSD.format())
      const outVal = parseFloat(tx.outputValueUSD.format())

      // If there is more than 5% dust, reject
      if (outVal / 20 < dustVal) {
        console.log('Large amount of dust')
        return
      }
      const inToOutRatio = outVal / inVal
      if (inToOutRatio < 0.9) {
        console.log('Low in to out ratio')

        // If there is more than 10% loss of value, reject
        return
      }
      results.push({
        tx,
        searchResult: result,
      })
      const resCount = results.length
      if (resCount >= searcher.config.searcherMinRoutesToProduce) {
        // console.log('Too many results, aborting')
        abortController.abort()
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

const chunkifyIterable = function* <T>(
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

class MultiChoicePath implements SwapPath {
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

/**
 * Takes some base basket set representing a unit of output, and converts it into some
 * precursor set, in which the while basket can be derived via mints.
 *
 * It does this recursively to handle cases where tokens are minted from other tokens
 * or in the case that RTokens are part of the basket.
 *
 * Function produces two outputs, a token quantity set representing the sum of the basket as
 * fraction of the whole
 *
 * So (0.22 saUSDT, 1100 cUSDT, 0.5 USDT) becomes 1.0 USDT
 *
 * The second output is a tree which can be traversed to DF to produce a set of minting operations
 * producing the basket from the precursor set.
 */
export const findPrecursorTokenSet = async (
  universe: UniverseWithERC20GasTokenDefined,
  userInputQuantity: TokenQuantity,
  rToken: Token,
  unitBasket: TokenQuantity[],
  searcher: Searcher<UniverseWithERC20GasTokenDefined>
) => {
  const start = Date.now()
  // console.log(`Findiing precursor set for ${rToken}: ${unitBasket.join(', ')}`)
  const specialRules = universe.precursorTokenSourcingSpecialCases
  const basketTokenApplications: BasketTokenSourcingRuleApplication[] = []

  const recourseOn = async (
    qty: TokenQuantity
  ): Promise<BasketTokenSourcingRuleApplication> => {
    // console.log(qty)
    const tokenSourcingRule = specialRules.get(qty.token)
    if (tokenSourcingRule != null) {
      return await tokenSourcingRule(userInputQuantity.token, qty, searcher)
    }

    const acts = universe.wrappedTokens.get(qty.token)

    if (acts != null) {
      const baseTokens = await acts.burn.quote([qty])
      const branches = await Promise.all(
        baseTokens.map(async (qty) => await recourseOn(qty))
      )

      return BasketTokenSourcingRuleApplication.fromActionWithDependencies(
        acts.mint,
        branches
      )
    }
    return BasketTokenSourcingRuleApplication.noAction([qty])
  }

  for (const qty of unitBasket) {
    const application = await recourseOn(qty)
    basketTokenApplications.push(application)
  }

  const out = BasketTokenSourcingRuleApplication.fromBranches(
    basketTokenApplications
  )
  return out
}

export class Searcher<
  const SearcherUniverse extends UniverseWithERC20GasTokenDefined
> {
  private readonly defaultSearcherOpts

  // private readonly rTokenUnitBasketCache: BlockCache<Token, BasketTokenSourcingRuleApplication>
  constructor(private readonly universe: SearcherUniverse) {
    this.defaultSearcherOpts = {
      internalTradeSlippage: this.defaultInternalTradeSlippage,
      outputSlippage: 100n,
      maxIssueance: true,
      returnDust: true,
    }

    // rTokenUnitBasketCache = universe.createCache(
    //   (token) =>
    // )
  }

  /**
   * @note This helper will find some set of operations converting a 'inputQuantity' into
   * a token basket represented via 'basketUnit' param.
   *
   * It does this by first finding the smallest set of tokens that can be used to derive the whole basket.
   *
   * Then it trades the inputQuantity for the tokens in the 'precursor' set.
   *
   * Lastly it mints the basket set.
   *
   * @param inputQuantity the token quantity to convert into the token basket
   * @param basketUnit a token quantity set representing one unit of output
   **/
  public async findSingleInputToBasketGivenBasketUnit(
    inputQuantity: TokenQuantity,
    rToken: Token,
    basketUnit: TokenQuantity[],
    internalTradeSlippage: bigint,
    onResult: (result: {
      trading: SwapPaths
      minting: SwapPaths
    }) => Promise<void>,
    abortSignal: AbortSignal
  ) {
    const start = Date.now()
    // console.log('Finding precursors for', rToken.symbol)
    /**
     * PHASE 1: Compute precursor set
     */
    const precursorTokens = await findPrecursorTokenSet(
      this.universe,
      inputQuantity,
      rToken,
      basketUnit,
      this
    )
    // console.log(precursorTokens.precursorToTradeFor.join(', '))

    const generateInputToPrecursorTradeMeasurement = this.perf.begin(
      'generateInputToPrecursorTrade',
      rToken.symbol
    )
    const generateInputToPrecursorTradeMeasurementSetup = this.perf.begin(
      'generateInputToPrecursorTradeSetup',
      rToken.symbol
    )
    // console.log(precursorTokens.describe().join('\n'))

    /**
     * PHASE 2: Trade inputQuantity into precursor set
     */
    const precursorTokenBasket = precursorTokens.precursorToTradeFor
    // console.log(precursorTokenBasket.join(', '))
    // Split input by how large each token in precursor set is worth.
    // Example: We're trading 0.1 ETH, and precursorTokenSet(rToken) = (0.5 usdc, 0.5 usdt)
    // say usdc is trading at 0.99 usd and usdt 1.01, then the trade will be split as follows
    // sum = 0.99 * 0.5 + 1.01 * 0.5 = 1
    // 0.1 * (0.99 * 0.5) / sum = 0.0495 ETH will be going into the USDC trade
    // 0.1 * (1.01 * 0.5) / sum = 0.0505 ETH will be going into the USDT trade

    // If we can't quote every precursor token, we assume the token set adds up to 1.0
    // and we split the input by the fraction of the trade basket.
    const precursorTokensPrices = await Promise.all(
      precursorTokenBasket.map(
        async (qty) =>
          (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero
      )
    )

    const everyTokenPriced = precursorTokensPrices.every((i) => i.amount > 0n)

    const quoteSum = everyTokenPriced
      ? precursorTokensPrices.reduce((l, r) => l.add(r), this.universe.usd.zero)
      : precursorTokenBasket
          .map((p) => p.into(inputQuantity.token))
          .reduce((l, r) => l.add(r))

    // console.log(`sum: ${quoteSum}, ${precursorTokensPrices.join(', ')}`)
    const inputPrTrade = everyTokenPriced
      ? precursorTokenBasket.map(({ token }, i) => ({
          input: inputQuantity.mul(
            precursorTokensPrices[i].div(quoteSum).into(inputQuantity.token)
          ),
          output: token,
        }))
      : precursorTokenBasket.map((qty) => ({
          output: qty.token,
          input: inputQuantity.mul(qty.into(inputQuantity.token).div(quoteSum)),
        }))
    const total = inputPrTrade.reduce(
      (l, r) => l.add(r.input),
      inputQuantity.token.zero
    )
    const leftOver = inputQuantity.sub(total)
    if (leftOver.amount > 0n) {
      inputPrTrade[0].input = inputPrTrade[0].input.add(leftOver)
    }

    const balancesBeforeTrading = new TokenAmounts()
    balancesBeforeTrading.add(inputQuantity)

    let multiTrades: MultiChoicePath[] = []

    generateInputToPrecursorTradeMeasurementSetup()

    multiTrades = []
    await Promise.all(
      inputPrTrade.map(async ({ input, output }) => {
        if (
          // Skip trade if user input is part of precursor set
          input.token === output
        ) {
          return
        }

        for (let i = 1; i < 3; i++) {
          try {
            if (abortSignal.aborted) {
              return
            }
            const potentialSwaps = await this.findSingleInputTokenSwap(
              input,
              output,
              this.universe.config.addresses.executorAddress,
              internalTradeSlippage,
              abortSignal,
              Math.max(i, 2),
              false
            )

            if (
              potentialSwaps == null ||
              potentialSwaps.paths.length === 0 ||
              !balancesBeforeTrading.hasBalance(potentialSwaps.inputs)
            ) {
              throw Error('')
            }
            multiTrades.push(potentialSwaps)
            return
          } catch (e) {}
        }
      })
    )

    generateInputToPrecursorTradeMeasurement()

    const resolveTradeConflicts = this.perf.wrapAsyncFunction(
      'resolveTradeConflicts',
      async (inTrades: SwapPath[]) => {
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
              this.defaultInternalTradeSlippage
            )

            newTrades.push(newFirstSwap)
            const combinedFirstTradeOutput = (
              newFirstSwap.steps[0].action as UniswapRouterAction
            ).outputQty.amount
            let total =
              combinedFirstTradeOutput - combinedFirstTradeOutput / 10000n
            const prTrade = total / BigInt(actions.length)

            await Promise.all(
              actions.map(async (nextTrade) => {
                const newInput = outputToken.from(
                  total < prTrade ? total : prTrade
                )
                total -= prTrade

                // console.log(
                //   `Finding new trade ${newInput} -> ${nextTrade.outputToken[0]}`
                // )
                const newNextTrade = await uniDex.swap(
                  abortSignal,
                  newInput,
                  nextTrade.outputToken[0],
                  this.defaultInternalTradeSlippage
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
      },
      rToken.symbol
    )
    const generateIssueancePlan = this.perf.wrapAsyncFunction(
      'generateIssueancePlan',
      async (tradeInputToTokenSet: SwapPath[]) => {
        try {
          const precursorIntoUnitBasket: SwapPath[] = []
          const tradingBalances = balancesBeforeTrading.clone()

          for (const trade of tradeInputToTokenSet) {
            await trade.exchange(tradingBalances)
          }

          const postTradeBalances = tradingBalances.clone()
          /**
           * PHASE 3: Mint basket token set from precursor set
           */
          const recourseOn = async (
            balances: TokenAmounts,
            parent: TokenAmounts,
            tradeAction: PostTradeAction
          ) => {
            let subBranchBalances = parent.multiplyFractions(
              tradeAction.inputAsFractionOfCurrentBalance,
              false
            )
            const exchanges: SwapPath[] = []

            if (tradeAction.action) {
              const actionInput = subBranchBalances.toTokenQuantities()

              const mintExec = await new SwapPlan(this.universe, [
                tradeAction.action,
              ]).quote(
                actionInput,
                this.universe.config.addresses.executorAddress
              )
              exchanges.push(mintExec)
              precursorIntoUnitBasket.push(mintExec)
              subBranchBalances.exchange(actionInput, mintExec.outputs)

              balances.exchange(actionInput, mintExec.outputs)
            }
            let subActionExchanges: SwapPath[] = []
            for (const subAction of tradeAction.postTradeActions ?? []) {
              subActionExchanges.push(
                ...(await recourseOn(balances, subBranchBalances, subAction))
              )
              if (subAction.updateBalances) {
                exchanges.push(...subActionExchanges)
                for (const exchange of subActionExchanges) {
                  subBranchBalances.exchange(exchange.inputs, exchange.outputs)
                }
                subActionExchanges = []
              }
            }
            return [...exchanges, ...subActionExchanges]
          }

          let balancesAtStartOfMintingPhase = postTradeBalances.clone()
          for (const action of precursorTokens.postTradeActions) {
            const tokensForBranch = balancesAtStartOfMintingPhase.clone()
            await recourseOn(
              balancesAtStartOfMintingPhase.clone(),
              tokensForBranch,
              action
            )
            if (action.updateBalances) {
              balancesAtStartOfMintingPhase = tokensForBranch
            }
          }

          const tradeValueOut = tradeInputToTokenSet.reduce(
            (l, r) => l.add(r.outputValue),
            this.universe.usd.zero
          )

          const mintStepValueOut = precursorIntoUnitBasket.reduce(
            (l, r) => l.add(r.outputValue),
            this.universe.usd.zero
          )
          const tradingOutputs = postTradeBalances.toTokenQuantities()
          return {
            trading: new SwapPaths(
              this.universe,
              [inputQuantity],
              tradeInputToTokenSet,
              tradingOutputs,
              tradeValueOut,
              this.universe.config.addresses.executorAddress
            ),
            minting: new SwapPaths(
              this.universe,
              tradingOutputs,
              precursorIntoUnitBasket,
              tradingBalances.toTokenQuantities(),
              mintStepValueOut,
              this.universe.config.addresses.executorAddress
            ),
          }
        } catch (e: any) {
          // console.log('Failed to generate issueance plan')
          // console.log(e.stack)
          throw e
        }
      },
      rToken.symbol
    )

    const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices)
    if (tradesWithOptions.length === 0) {
      const normalTrades = multiTrades.map((i) => i.path)
      return await onResult(
        await generateIssueancePlan(await resolveTradeConflicts(normalTrades))
      )
    }
    const precursorSet = new Set(
      precursorTokens.precursorToTradeFor.map((i) => i.token)
    )

    const allOptions = await this.perf.measurePromise(
      'generateAllPermutations',
      generateAllPermutations(this.universe, multiTrades, precursorSet),
      rToken.symbol
    )

    const aborter = new AbortController()
    // console.log('Will test', allOptions.length, ' trade options for zap')

    const prRound =
      this.config.routerDeadline / (allOptions.length / this.maxConcurrency)
    console.log(prRound, allOptions.length)
    const endTime = Date.now() + prRound
    for (const candidates of chunkifyIterable(
      allOptions,
      this.maxConcurrency,
      abortSignal
    )) {
      let resultsProduced = 0
      if (abortSignal.aborted) {
        break
      }
      const maxWaitTime = AbortSignal.timeout(prRound + 500)

      const p = new Promise((resolve) => {
        abortSignal.addEventListener('abort', () => {
          resolve(null)
        })
        aborter.signal.addEventListener('abort', () => {
          resolve(null)
        })
        maxWaitTime.addEventListener('abort', () => {
          if (resultsProduced != 0) {
            resolve(null)
          }
        })
      })

      await Promise.race([
        await Promise.all(
          candidates.map(async (paths) => {
            let out
            try {
              const pathWithResolvedTradeConflicts =
                await resolveTradeConflicts(paths)
              out = await generateIssueancePlan(pathWithResolvedTradeConflicts)

              try {
                await onResult(out)
                resultsProduced += 1
              } catch (e: any) {}
            } catch (e: any) {}
            
            if (resultsProduced > this.minResults) {
              if (Date.now() > endTime) {
                aborter.abort()
              }
            }
          })
        ).catch((e) => {}),
        p,
      ])
    }
  }

  async unwrapOnce(qty: TokenQuantity): Promise<SingleSwap> {
    const mintBurnActions = this.universe.wrappedTokens.get(qty.token)
    if (mintBurnActions == null) {
      throw new Error('Token has no mint/burn actions')
    }
    const plan = new SwapPlan(this.universe, [mintBurnActions.burn])
    const swap = (
      await plan.quote([qty], this.universe.config.addresses.executorAddress)
    ).steps[0]
    return swap
  }
  async recursivelyUnwrapQty(qty: TokenQuantity): Promise<SwapPath | null> {
    const potentiallyUnwrappable = [qty]
    const tokenAmounts = new TokenAmounts()
    const swapPlans: SingleSwap[] = []

    while (potentiallyUnwrappable.length !== 0) {
      const qty = potentiallyUnwrappable.pop()!
      const mintBurnActions = this.universe.wrappedTokens.get(qty.token)
      if (mintBurnActions == null) {
        tokenAmounts.add(qty)
        continue
      }
      this.unwrapOnce(qty)
      const plan = new SwapPlan(this.universe, [mintBurnActions.burn])
      const [output, firstStep] = await Promise.all([
        mintBurnActions.burn.quoteWithSlippage([qty]),
        plan.quote([qty], this.universe.config.addresses.executorAddress),
      ])
      swapPlans.push(firstStep.steps[0])
      for (const underlyingQty of output) {
        potentiallyUnwrappable.push(underlyingQty)
      }
    }
    const output = tokenAmounts.toTokenQuantities()
    const outputQuotes = await Promise.all(
      output.map(
        async (qty) =>
          (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero
      )
    )
    if (swapPlans.length === 0) {
      return null
    }

    return new SwapPath(
      [qty],
      swapPlans,
      output,
      outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero),
      this.universe.config.addresses.executorAddress
    )
  }
  get hasExtendedSimulationSupport() {
    return simulationUrls[this.universe.config.chainId] != null
  }
  private checkIfSimulationSupported() {
    if (!this.hasExtendedSimulationSupport) {
      throw new Error(
        `Zapper does not support simulation on chain ${this.universe.config.chainId}, please use 'findSingleInputToRTokenZap' for partial support`
      )
    }
  }

  get maxConcurrency() {
    return this.config.searchConcurrency
  }
  get minResults() {
    return this.config.searcherMinRoutesToProduce
  }
  async findRTokenIntoSingleTokenZapTx(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    opts?: ToTransactionArgs
  ) {
    const start = Date.now()
    const toTxArgs = Object.assign(
      { ...this.defaultSearcherOpts },
      opts
    ) as ToTransactionArgs & typeof this.defaultSearcherOpts
    await this.universe.initialized
    this.checkIfSimulationSupported()

    const controller = createConcurrentStreamingSeacher(this, toTxArgs)

    const mainPromise = Promise.all([
      this.findRTokenIntoSingleTokenZapViaRedeem__(
        rTokenQuantity,
        output,
        signerAddress,
        toTxArgs.internalTradeSlippage,
        controller.onResult,
        controller.abortController.signal
      ).catch(() => {}),
      this.findTokenZapViaTrade(
        rTokenQuantity,
        output,
        signerAddress,
        toTxArgs.internalTradeSlippage,
        controller.abortController.signal
      )
        .catch((e) => [])
        .then((results) =>
          Promise.all(results.map(controller.onResult)).catch(() => {})
        ),
    ])
    const resultsPromise = new Promise((resolve) => {
      controller.abortController.signal.addEventListener('abort', () => {
        resolve(null)
      })
    })

    await Promise.race([resultsPromise, mainPromise])
    return controller.getResults(start)
  }

  async findRTokenIntoSingleTokenZap(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    internalTradeSlippage: bigint
  ) {
    await this.universe.initialized

    if (output === this.universe.nativeToken) {
      output = this.universe.wrappedNativeToken
    }
    const timeout = AbortSignal.timeout(this.config.routerDeadline)
    const [mintResults, tradeResults] = (await Promise.all([
      this.findRTokenIntoSingleTokenZapViaRedeem(
        rTokenQuantity,
        output,
        signerAddress,
        internalTradeSlippage,
        timeout
      ),
      this.findTokenZapViaTrade(
        rTokenQuantity,
        output,
        signerAddress,
        internalTradeSlippage,
        timeout
      ),
    ])) as [BaseSearcherResult[], BaseSearcherResult[]]

    const results = await Promise.all(
      mintResults.concat(tradeResults).map(async (i) => {
        const [cost, netValue] = await Promise.all([
          i.swaps.cost(this.universe),
          i.swaps.netValue(this.universe),
        ])
        return {
          quote: i as BaseSearcherResult,
          cost: cost,
          netValue: netValue as TokenQuantity,
        } as const
      })
    )
    results.sort((l, r) => -l.netValue.compare(r.netValue))

    return results[0].quote
  }

  async findRTokenIntoSingleTokenZapViaRedeem(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage: bigint,
    abortSignal: AbortSignal
  ) {
    const out: BurnRTokenSearcherResult[] = []
    await this.findRTokenIntoSingleTokenZapViaRedeem__(
      rTokenQuantity,
      output,
      signerAddress,
      slippage,
      async (burnZap) => {
        out.push(burnZap)
      },
      abortSignal
    )
    return out as BurnRTokenSearcherResult[]
  }
  async findRTokenIntoSingleTokenZapViaRedeem__(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage: bigint,
    onResult: (result: BurnRTokenSearcherResult) => Promise<void>,
    abortSignal: AbortSignal
  ) {
    await this.universe.initialized
    const outputIsNative = output === this.universe.nativeToken
    let outputToken = output
    if (outputIsNative) {
      if (this.universe.commonTokens.ERC20GAS == null) {
        throw new Error(
          'No wrapped native token. (Like WETH) has been defined. Cannot execute search'
        )
      }
      outputToken = this.universe.commonTokens.ERC20GAS
    }
    const rToken = rTokenQuantity.token
    const rTokenActions = this.universe.wrappedTokens.get(rToken)
    if (rTokenActions == null) {
      throw new Error('RToken has no mint/burn actions')
    }
    const redeemStep = await this.unwrapOnce(rTokenQuantity)
    const redeem = new SwapPath(
      [rTokenQuantity],
      [redeemStep],
      redeemStep.outputs,
      this.universe.usd.zero,
      this.universe.config.addresses.executorAddress
    )
    const tokenAmounts = new TokenAmounts()
    const redeemSwapPaths: SwapPath[] = []

    for (const basketTokenQty of redeem.outputs) {
      const basketTokenToOutput = await this.recursivelyUnwrapQty(
        basketTokenQty
      )
      if (basketTokenToOutput == null) {
        tokenAmounts.addQtys([basketTokenQty])
      } else {
        tokenAmounts.addQtys(basketTokenToOutput.outputs)
        redeemSwapPaths.push(basketTokenToOutput)
      }
    }

    // Trade each underlying for output
    const unwrapTokenQtys = tokenAmounts.toTokenQuantities()
    const multiTrades: MultiChoicePath[] = []
    await Promise.all(
      unwrapTokenQtys
        .filter((qty) => qty.token !== outputToken)
        .map(async (qty) => {
          for (let i = 1; i < 6; i++) {
            if (abortSignal.aborted) {
              return
            }
            const potentialSwaps = await this.findSingleInputTokenSwap(
              qty,
              outputToken,
              signerAddress,
              slippage,
              abortSignal,
              Math.max(i, 2),
              true
            ).catch(() => null)
            if (potentialSwaps == null || potentialSwaps.paths.length === 0) {
              continue
            }
            multiTrades.push(potentialSwaps)
            return
          }
          throw Error(
            'Failed to find trade for: ' +
              qty +
              '(' +
              qty.token +
              ')' +
              ' -> ' +
              outputToken +
              '(' +
              output +
              ')'
          )
        })
    ).catch(() => {})
    // if (abortSignal.aborted) {
    //   return
    // }

    const generateRedeemPlan = async (trades: SwapPath[] = []) => {
      const pretradeBalances = tokenAmounts.clone()

      await Promise.all(
        trades.map(async (trade) => {
          await trade.exchange(pretradeBalances)
        })
      )

      const totalOutput = pretradeBalances.get(outputToken)
      const outputValue =
        (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero

      const outputSwap = new SwapPaths(
        this.universe,
        [rTokenQuantity],
        [redeem, ...redeemSwapPaths, ...trades],
        tokenAmounts.toTokenQuantities(),
        outputValue,
        signerAddress
      )

      return new BurnRTokenSearcherResult(
        this.universe,
        rTokenQuantity,
        {
          full: outputSwap,
          rtokenRedemption: redeem,
          tokenBasketUnwrap: redeemSwapPaths,
          tradesToOutput: trades,
        },
        signerAddress,
        outputToken
      )
    }

    if (multiTrades.filter((i) => i.hasMultipleChoices).length === 0) {
      return await onResult(
        await generateRedeemPlan(multiTrades.map((i) => i.path))
      )
    }
    const outputTokenSet = new Set([output])

    const allOptions = await this.perf.measurePromise(
      'generateAllPermutations',
      generateAllPermutations(this.universe, multiTrades, outputTokenSet),
      rToken.symbol
    )
    // console.log('Possible redeem zaps', allOptions.length)
    for (const candidates of chunkifyIterable(
      allOptions,
      this.maxConcurrency,
      abortSignal
    )) {
      if (abortSignal.aborted) {
        return
      }
      await Promise.all(
        candidates.map(async (paths) => {
          try {
            if (abortSignal.aborted) {
              return
            }
            await onResult(await generateRedeemPlan(paths))
          } catch (e) {}
        })
      ).catch(() => {})
      if (abortSignal.aborted) {
        break
      }
    }
  }

  async findTokenZapViaIssueance(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint,
    abortSignal: AbortSignal
  ): Promise<BaseSearcherResult[]> {
    await this.universe.initialized
    const outputs: MintRTokenSearcherResult[] = []
    try {
      await this.findSingleInputToRTokenZap_(
        userInput,
        rToken,
        signerAddress,
        slippage,
        async (result) => {
          outputs.push(result)
        },
        abortSignal
      )
    } catch (e) {
      // console.log(e)
    }
    return outputs
  }

  async findTokenZapViaTrade(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint,
    abortSignal: AbortSignal
  ): Promise<TradeSearcherResult[]> {
    await this.universe.initialized

    const inputIsNative = userInput.token === this.universe.nativeToken
    let inputTokenQuantity = userInput
    if (inputIsNative) {
      if (this.universe.commonTokens.ERC20GAS == null) {
        console.log('No wrapped native token. (Like WETH) has been defined.')
        throw new Error(
          'No wrapped native token. (Like WETH) has been defined. Cannot execute search'
        )
      }
      inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS)
    }

    const [paths, inputValue] = await Promise.all([
      this.externalQuoters(
        inputTokenQuantity,
        rToken,
        false,
        slippage,
        abortSignal
      ),
      this.universe.fairPrice(inputTokenQuantity).catch(() => null),
    ])
    if (inputValue == null) {
      return []
    }
    return paths
      .filter(
        (path) => parseFloat(path.outputValue.div(inputValue).format()) > 0.98
      )
      .slice(0, 2)
      .map(
        (path) =>
          new TradeSearcherResult(
            this.universe,
            userInput,
            new SwapPaths(
              this.universe,
              [inputTokenQuantity],
              [path],
              path.outputs,
              path.outputValue,
              signerAddress
            ),
            signerAddress,
            rToken
          )
      )
  }

  public async findSingleInputToRTokenZap(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint
  ) {
    await this.universe.initialized

    const abortSignal = AbortSignal.timeout(this.config.routerDeadline)
    const [mintResults, tradeResults] = (await Promise.all([
      this.findTokenZapViaIssueance(
        userInput,
        rToken,
        signerAddress,
        slippage,
        abortSignal
      ),
      this.findTokenZapViaTrade(
        userInput,
        rToken,
        signerAddress,
        slippage,
        abortSignal
      ),
    ])) as [MintRTokenSearcherResult[], TradeSearcherResult[]]
    const results = await Promise.all(
      [...mintResults, ...tradeResults].map(async (i) => {
        return {
          quote: i,
          cost: await i.swaps.cost(this.universe),
          netValue: await i.swaps.netValue(this.universe),
        }
      })
    )
    results.sort((l, r) => -l.netValue.compare(r.netValue))
    return results[0]
  }

  get perf() {
    return this.universe.perf
  }

  get config() {
    return this.universe.config
  }
  get defaultInternalTradeSlippage() {
    return this.config.defaultInternalTradeSlippage
  }

  public async findSingleInputToRTokenZapTx(
    userInput: TokenQuantity,
    rToken: Token,
    userAddress: Address,
    opts?: ToTransactionArgs
  ) {
    const start = Date.now()
    const toTxArgs = Object.assign({ ...this.defaultSearcherOpts }, opts)
    const slippage = toTxArgs.internalTradeSlippage
    await this.universe.initialized
    this.checkIfSimulationSupported()

    const controller = createConcurrentStreamingSeacher(this, toTxArgs)

    await Promise.all([
      this.findSingleInputToRTokenZap_(
        userInput,
        rToken,
        userAddress,
        slippage,
        controller.onResult,
        controller.abortController.signal
      ).catch((e) => {
        // console.log(e)
      }),
      this.findTokenZapViaTrade(
        userInput,
        rToken,
        userAddress,
        slippage,
        controller.abortController.signal
      ).then(async (i) => {
        try {
          await Promise.all(
            i.map(async (i) => {
              if (controller.abortController.signal.aborted) {
                return
              }
              await controller.onResult(i)
            })
          )
        } catch (e) {}
      }),
    ]).catch((e) => {
      // console.log(e)
    })

    return controller.getResults(start)
  }

  private async findSingleInputToRTokenZap_(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint,
    onResult: (result: MintRTokenSearcherResult) => Promise<void>,
    abort: AbortSignal
  ) {
    const inputIsNative = userInput.token === this.universe.nativeToken
    let inputTokenQuantity = userInput
    if (inputIsNative) {
      if (this.universe.commonTokens.ERC20GAS == null) {
        console.log('No wrapped native token. (Like WETH) has been defined.')
        throw new Error(
          'No wrapped native token. (Like WETH) has been defined. Cannot execute search'
        )
      }
      inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS)
    }

    const rTokenActions = this.universe.wrappedTokens.get(rToken)
    if (rTokenActions == null) {
      console.log('RToken has no mint/burn actions')
      throw new Error('RToken has no mint/burn actions')
    }

    const mintAction = rTokenActions.mint as MintRTokenAction

    const unitBasket = await mintAction.rTokenDeployment
      .unitBasket()
      .catch((e) => {
        // console.log(e)
        throw e
      })
    try {
      await this.findSingleInputToBasketGivenBasketUnit(
        inputTokenQuantity,
        rToken,
        unitBasket,
        slippage,
        async (inputQuantityToBasketTokens) => {
          try {
            const tradingBalances = new TokenAmounts()
            tradingBalances.add(inputTokenQuantity)
            await inputQuantityToBasketTokens.trading.exchange(tradingBalances)
            await inputQuantityToBasketTokens.minting.exchange(tradingBalances)

            const rTokenMint = await new SwapPlan(this.universe, [
              rTokenActions.mint,
            ]).quote(
              mintAction.inputToken.map((token) => tradingBalances.get(token)),
              signerAddress
            )
            await rTokenMint.exchange(tradingBalances)

            const outputReordered = [
              tradingBalances.get(rToken),
              ...tradingBalances
                .toTokenQuantities()
                .filter((i) => i.token !== rToken),
            ]

            const full = new SwapPaths(
              this.universe,
              [inputTokenQuantity],
              [
                ...inputQuantityToBasketTokens.trading.swapPaths,
                ...inputQuantityToBasketTokens.minting.swapPaths,
                rTokenMint,
              ],
              outputReordered,
              rTokenMint.outputValue,
              signerAddress
            )

            const parts = {
              trading: inputQuantityToBasketTokens.trading,
              minting: inputQuantityToBasketTokens.minting,
              rTokenMint,
              full,
            }

            await onResult(
              new MintRTokenSearcherResult(
                this.universe,
                userInput,
                parts,
                signerAddress,
                rToken
              )
            )
          } catch (e: any) {
            // console.log(e)
            // console.log(e.stack)
            // throw e
          }
        },
        abort
      )
    } catch (e) {
      // console.log(e)
      throw e
    }
  }

  async externalQuoters(
    input: TokenQuantity,
    output: Token,
    dynamicInput: boolean,
    slippage: bigint,
    abort: AbortSignal
  ) {
    const out: SwapPath[] = []
    await this.universe.swaps(
      input,
      output,
      async (path) => {
        out.push(path)
      },
      {
        dynamicInput,
        slippage,
        abort,
      }
    )

    return out
  }
  async externalQuoters_(
    input: TokenQuantity,
    output: Token,
    onResult: (path: SwapPath) => Promise<void>,
    opts: {
      abort: AbortSignal
      dynamicInput: boolean
      slippage: bigint
    }
  ) {
    await this.universe.swaps(input, output, onResult, opts)
  }

  async internalQuoter(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    onResult: (result: SwapPath) => Promise<void>,
    maxHops: number = 2
  ): Promise<void> {
    const context = `${maxHops}:${input.token}->${output}`
    const internalQuoterPerf = this.perf.begin('internalQuoter', context)
    const bfsResult = this.perf.measure(
      'bfs',
      () =>
        bfs(this.universe, this.universe.graph, input.token, output, maxHops),
      context
    )

    const swapPlans = bfsResult.steps
      .map((i) => i.convertToSingularPaths())
      .flat()
      .filter((plan) => {
        if (plan.steps.length > maxHops) {
          return false
        }
        if (plan.inputs.length !== 1) {
          return false
        }
        if (
          plan.steps.some(
            (i) => i.inputToken.length !== 1 || i.outputToken.length !== 1
          )
        ) {
          return false
        }
        if (
          new Set(plan.steps.map((i) => i.address)).size !== plan.steps.length
        ) {
          return false
        }

        return true
      })

    await Promise.all(
      swapPlans.map(async (plan) => {
        try {
          await onResult(await plan.quote([input], destination))
        } catch (e) {
          // console.log(e)
          // console.log(plan.toString())
          // console.log(e)
        }
      })
    )
    internalQuoterPerf()
  }

  async findSingleInputTokenSwap(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: bigint,
    abort: AbortSignal,
    maxHops: number = 2,
    dynamicInput: boolean = false
  ): Promise<MultiChoicePath> {
    const out: SwapPath[] = []
    await this.findSingleInputTokenSwap_(
      input,
      output,
      destination,
      slippage,
      abort,
      maxHops,
      dynamicInput,
      async (path) => {
        out.push(path)
      }
    )
    if (out.length === 0) {
      throw new Error(
        `findSingleInputTokenSwap: No swaps found for ${input.token} -> ${output}`
      )
    }
    return new MultiChoicePath(this.universe, out)
  }

  async findSingleInputTokenSwap_(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: bigint,
    abort: AbortSignal,
    maxHops: number = 2,
    dynamicInput: boolean = false,
    onResult: (result: SwapPath) => Promise<void>
  ): Promise<void> {
    const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output)
    if (tradeSpecialCase != null) {
      const out = await tradeSpecialCase(input, destination)
      if (out != null) {
        await onResult(out)
      }
    }
    const inValue =
      parseFloat((await this.universe.fairPrice(input))?.format() ?? '0') ?? 0

    let dropped = 0
    let total = 0
    const emitResult = async (path: SwapPath) => {
      total++
      const outValue = parseFloat(path.outputValue.format())
      if (inValue != 0 && outValue != 0) {
        const ratio = outValue / inValue
        if (ratio < 0.95) {
          dropped += 1
          return
        }
        if (abort.aborted) {
          return
        }
      }
      await onResult(path)
    }
    await Promise.all([
      this.internalQuoter(
        input,
        output,
        destination,
        emitResult,
        maxHops
      ).catch((e) => {
        return []
      }),
      this.externalQuoters_(input, output, emitResult, {
        dynamicInput,
        abort,
        slippage,
      }).catch((e) => {}),
    ])
  }
}
