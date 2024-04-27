import { Universe } from '..'

import { DestinationOptions, InteractionConvention } from '../action/Action'
import { type MintRTokenAction } from '../action/RTokens'
import { type Address } from '../base/Address'
import { wait } from '../base/controlflow'
import { Config } from '../configuration/ChainConfiguration'
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
const nextPermutation = function* (arr: MultiChoicePath[], idx: number) {
  const entry = arr[idx]
  for (let i = 0; i < entry.paths.length; i++) {
    if (idx < arr.length - 1) {
      for (const _ of nextPermutation(arr, idx + 1)) {
        yield
      }
    }
    yield
    entry.increment()
  }
}

const shuffleArray = <T>(array: T[]): T[] => {
  array = array.slice()
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}
const MAX_CONCCURRENCY = 4
const ZAP_RESULTS = 4
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

  public increment() {
    this.index += 1
    if (this.index >= this.paths.length) {
      this.index = 0
    }
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
  intoSwapPaths(universe: Universe<Config>): SwapPaths {
    return new SwapPaths(
      universe,
      this.inputs,
      [this],
      this.outputs,
      this.outputValue,
      this.destination
    )
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
  const specialRules = universe.precursorTokenSourcingSpecialCases
  const basketTokenApplications: BasketTokenSourcingRuleApplication[] = []

  const recourseOn = async (
    qty: TokenQuantity
  ): Promise<BasketTokenSourcingRuleApplication> => {
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
  return BasketTokenSourcingRuleApplication.fromBranches(
    basketTokenApplications
  )
}

export class Searcher<
  const SearcherUniverse extends UniverseWithERC20GasTokenDefined
> {
  constructor(private readonly universe: SearcherUniverse) {}

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
  public async *findSingleInputToBasketGivenBasketUnit(
    inputQuantity: TokenQuantity,
    rToken: Token,
    basketUnit: TokenQuantity[],
    slippage: number
  ) {
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
    console.log(precursorTokens.describe().join('\n'))
    console.log(
      'precursor tokens: ' + precursorTokens.precursorToTradeFor.join(', ')
    )

    /**
     * PHASE 2: Trade inputQuantity into precursor set
     */
    const precursorTokenBasket = precursorTokens.precursorToTradeFor

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
      ? precursorTokensPrices.reduce((l, r) => l.add(r))
      : precursorTokenBasket
          .map((p) => p.into(inputQuantity.token))
          .reduce((l, r) => l.add(r))

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

    const multiTrades: MultiChoicePath[] = []

    await Promise.all(
      inputPrTrade.map(async ({ input, output }) => {
        if (
          // Skip trade if user input is part of precursor set
          input.token === output
        ) {
          return
        }

        // Swaps are sorted by output amount in descending order
        const trade = await this.findSingleInputTokenSwap(
          input,
          output,
          this.universe.config.addresses.executorAddress,
          slippage,
          2,
          false
        )
        if (trade == null) {
          throw new Error(
            `Could not find way to swap into precursor token ${input} -> ${output}`
          )
        }
        if (!balancesBeforeTrading.hasBalance(trade.inputs)) {
          throw new Error('Insufficient balance for trade')
        }
        multiTrades.push(trade)
      })
    )

    const generatePermutation = async () => {
      const tokenSetToBasket: SwapPath[] = []
      const tradingBalances = balancesBeforeTrading.clone()

      const tradeInputToTokenSet = multiTrades.map((i) => i.path)

      for (const trade of tradeInputToTokenSet) {
        await trade.exchange(tradingBalances)
      }
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
          ]).quote(actionInput, this.universe.config.addresses.executorAddress)
          exchanges.push(mintExec)
          tokenSetToBasket.push(mintExec)
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

      let tradingBalancesUsedForMinting = tradingBalances.clone()
      for (const action of precursorTokens.postTradeActions) {
        const tokensForBranch = tradingBalancesUsedForMinting.clone()
        await recourseOn(tradingBalances, tokensForBranch, action)
        if (action.updateBalances) {
          tradingBalancesUsedForMinting = tradingBalances.clone()
        }
      }

      const fullPath = [...tradeInputToTokenSet, ...tokenSetToBasket]

      return {
        fullSwap: new SwapPaths(
          this.universe,
          [inputQuantity],
          fullPath,
          tradingBalances.toTokenQuantities(),
          fullPath.reduce(
            (l, r) => l.add(r.outputValue),
            this.universe.usd.zero
          ),
          this.universe.config.addresses.executorAddress
        ),
        trading: new SwapPaths(
          this.universe,
          [inputQuantity],
          tradeInputToTokenSet,
          tradingBalances.toTokenQuantities(),
          tradeInputToTokenSet.reduce(
            (l, r) => l.add(r.outputValue),
            this.universe.usd.zero
          ),
          this.universe.config.addresses.executorAddress
        ),
        minting: new SwapPaths(
          this.universe,
          tradingBalancesUsedForMinting.toTokenQuantities(),
          tokenSetToBasket,
          tradingBalances.toTokenQuantities(),
          tokenSetToBasket.reduce(
            (l, r) => l.add(r.outputValue),
            this.universe.usd.zero
          ),
          this.universe.config.addresses.executorAddress
        ),
      }
    }

    const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices)
    const permCount = tradesWithOptions.reduce((a, b) => a * b.paths.length, 1)
    if (tradesWithOptions.length === 0) {
      yield await generatePermutation()
    } else {
      let queue: (ReturnType<typeof generatePermutation> | Promise<null>)[] = []
      const processed = new Set<string>()
      for (const _ of nextPermutation(shuffleArray(tradesWithOptions), 0)) {
        queue.push(generatePermutation())
        if (queue.length >= MAX_CONCCURRENCY) {
          const toProcess = queue
          queue = []
          for (const res of await Promise.all(
            toProcess.map((i) => i.catch(() => null))
          )) {
            if (res != null) {
              const id = res.fullSwap.describe().join('\n')
              if (processed.has(id)) {
                continue
              }
              processed.add(id)
              yield res
            }
          }
        }
      }
      for (const res of await Promise.all(
        queue.map((i) => i.catch(() => null))
      )) {
        if (res != null) {
          const id = res.fullSwap.describe().join('\n')
          if (processed.has(id)) {
            continue
          }
          processed.add(id)
          yield res
        }
      }
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
  async findRTokenIntoSingleTokenZapTx(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage = 0.0,
    toTxArgs: ToTransactionArgs = {}
  ) {
    await this.universe.initialized
    const [mintResults, tradeResults] = await Promise.all([
      this.findRTokenIntoSingleTokenZapViaRedeem(
        rTokenQuantity,
        output,
        signerAddress,
        slippage
      ),
      this.findTokenZapViaTrade(
        rTokenQuantity,
        output,
        signerAddress,
        slippage
      ),
    ])

    return await this.findBestTx([...mintResults, ...tradeResults], toTxArgs)
  }
  private async findBestTx(
    allQuotes: BaseSearcherResult[],
    toTxArgs: ToTransactionArgs
  ) {
    console.log(`Searcher found ${allQuotes.length} potential zap paths`)
    const txes: {
      searchResult: BaseSearcherResult
      tx: ZapTransaction | null
      error: any
    }[] = (
      await Promise.all(
        allQuotes.map(async (searchResult) => {
          try {
            return {
              searchResult: searchResult,
              tx: await searchResult.toTransaction(toTxArgs),
              error: null,
            }
          } catch (error: any) {
            console.log(error)
            return {
              searchResult: searchResult,
              tx: null,
              error: error,
            }
          }
        })
      )
    ).filter((i) => i != null)

    if (txes.length === 0) {
      console.log('No results')
      throw new Error('No results')
    }

    const notFailed = txes
      .filter((i) => {
        const ok = i.error == null && i.tx != null
        if (!ok) {
          return false
        }
        if (
          i.tx &&
          i.tx!.outputValueUSD.amount / 50n < i.tx!.dustValueUSD.amount
        ) {
          // console.log(i.tx.toString())
          // console.log(i.tx.describe().join("\n"))
          return false
        }
        return true
      })
      .map((i) => {
        return {
          SearcherResult: i.searchResult,
          tx: i.tx!,
        }
      })

    if (notFailed.length === 0) {
      throw new Error(txes[0]?.error ?? 'Failed to find a valid tx')
    }

    notFailed.sort((l, r) => -l.tx.compare(r.tx))

    console.log(`${notFailed.length} / ${txes.length} passed simulation:`)
    console.log(
      notFailed.map((i, idx) => `   ${idx}. ${i.tx.stats}`).join('\n')
    )

    return {
      bestZapTx: notFailed[0],
      alternatives: notFailed.slice(1, notFailed.length),
    }
  }

  async findRTokenIntoSingleTokenZap(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage = 0.0
  ) {
    await this.universe.initialized

    if (output === this.universe.nativeToken) {
      output = this.universe.wrappedNativeToken
    }
    const [mintResults, tradeResults] = await Promise.all([
      this.findRTokenIntoSingleTokenZapViaRedeem(
        rTokenQuantity,
        output,
        signerAddress,
        slippage
      ),
      this.findTokenZapViaTrade(
        rTokenQuantity,
        output,
        signerAddress,
        slippage
      ),
    ])

    const results = await Promise.all(
      [...mintResults, ...tradeResults].map(async (i) => {
        const [cost, netValue] = await Promise.all([
          i.swaps.cost(this.universe),
          i.swaps.netValue(this.universe),
        ])
        return {
          quote: i,
          cost: cost,
          netValue: netValue,
        }
      })
    )
    results.sort((l, r) => -l.netValue.compare(r.netValue))

    return results[0].quote
  }

  async findRTokenIntoSingleTokenZapViaRedeem(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage = 0.0
  ) {
    const out: BurnRTokenSearcherResult[] = []
    for await (const burnZap of this.findRTokenIntoSingleTokenZapViaRedeem__(
      rTokenQuantity,
      output,
      signerAddress,
      slippage
    )) {
      out.push(burnZap)
      if (out.length >= ZAP_RESULTS) {
        break
      }
    }
    return out
  }
  async *findRTokenIntoSingleTokenZapViaRedeem__(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage = 0.0
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
    const trades = await Promise.all(
      unwrapTokenQtys
        .filter((qty) => qty.token !== outputToken)
        .map(async (qty) => {
          const potentialSwaps = await this.findSingleInputTokenSwap(
            qty,
            outputToken,
            signerAddress,
            slippage,
            2,
            true
          )
          if (potentialSwaps == null) {
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
          }
          return potentialSwaps
        })
    )

    const permutableTrades = trades.filter((i) => i.paths.length !== 0)

    const generatePermutation = async () => {
      const pretradeBalances = tokenAmounts.clone()

      await Promise.all(
        trades.map(async (trade) => {
          await trade.exchange(pretradeBalances)
        })
      )

      const underlyingToOutputTrades = trades.map((i) => i.path)

      const totalOutput = pretradeBalances.get(outputToken)
      const outputValue =
        (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero

      const outputSwap = new SwapPaths(
        this.universe,
        [rTokenQuantity],
        [redeem, ...redeemSwapPaths, ...underlyingToOutputTrades],
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
          tradesToOutput: underlyingToOutputTrades,
        },
        signerAddress,
        outputToken
      )
    }

    if (permutableTrades.length === 0) {
      yield await generatePermutation()
    } else {
      const processed = new Set<string>()
      const queue: ReturnType<typeof generatePermutation>[] = []
      for (const _ of nextPermutation(shuffleArray(permutableTrades), 0)) {
        queue.push(generatePermutation())
        if (queue.length >= MAX_CONCCURRENCY) {
          for (const res of await Promise.all(
            queue.map((i) => i.catch(() => null))
          )) {
            if (res != null) {
              const id = res.toId()
              if (processed.has(id)) {
                continue
              }
              processed.add(id)
              yield res
            }
          }
        }
      }
      for (const res of await Promise.all(queue)) {
        if (res != null) {
          const id = res.toId()
          if (processed.has(id)) {
            continue
          }
          processed.add(id)
          yield res
        }
      }
    }
  }

  async findTokenZapViaIssueance(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0
  ): Promise<BaseSearcherResult[]> {
    await this.universe.initialized
    const outputs: MintRTokenSearcherResult[] = []
    for await (const zap of this.findSingleInputToRTokenZap_(
      userInput,
      rToken,
      signerAddress,
      slippage
    )) {
      outputs.push(zap)
      if (outputs.length >= ZAP_RESULTS) {
        break
      }
    }
    return outputs
  }

  async findTokenZapViaTrade(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0
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
        signerAddress,
        0,
        false
      ).catch(() => []),
      this.universe.fairPrice(inputTokenQuantity).catch(() => null),
    ])

    if (inputValue == null) {
      return []
    }

    return paths
      .filter(
        (path) => parseFloat(path.outputValue.div(inputValue).format()) > 0.98
      )
      .slice(0, 4)
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
    slippage = 0.0
  ) {
    await this.universe.initialized
    const [mintResults, tradeResults] = await Promise.all([
      this.findTokenZapViaIssueance(
        userInput,
        rToken,
        signerAddress,
        slippage
      ).catch(() => [] as BaseSearcherResult[]),
      this.findTokenZapViaTrade(
        userInput,
        rToken,
        signerAddress,
        slippage
      ).catch(() => [] as BaseSearcherResult[]),
    ] as const).then(([mintResults, tradeResults]) => {
      if (mintResults.length === 0 && tradeResults.length === 0) {
        throw new Error('No results')
      }
      return [mintResults, tradeResults] as const
    })
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

  public async findSingleInputToRTokenZapTx(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0,
    toTxArgs: ToTransactionArgs = {}
  ) {
    await this.universe.initialized
    const [mintResults, tradeResults] = await Promise.all([
      this.findTokenZapViaIssueance(
        userInput,
        rToken,
        signerAddress,
        slippage
      ).catch(() => [] as BaseSearcherResult[]),
      this.findTokenZapViaTrade(
        userInput,
        rToken,
        signerAddress,
        slippage
      ).catch(() => [] as BaseSearcherResult[]),
    ] as const).then(([mintResults, tradeResults]) => {
      if (mintResults.length === 0 && tradeResults.length === 0) {
        throw new Error('No results')
      }
      return [mintResults, tradeResults] as const
    })

    return await this.findBestTx([...mintResults, ...tradeResults], toTxArgs)
  }

  private async *findSingleInputToRTokenZap_(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0
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

    for await (const inputQuantityToBasketTokens of this.findSingleInputToBasketGivenBasketUnit(
      inputTokenQuantity,
      rToken,
      mintAction.basket.unitBasket,
      slippage
    )) {
      try {
        const tradingBalances = new TokenAmounts()
        tradingBalances.add(inputTokenQuantity)
        await inputQuantityToBasketTokens.fullSwap.exchange(tradingBalances)

        const rTokenMint = await new SwapPlan(this.universe, [
          rTokenActions.mint,
        ]).quote(
          mintAction.inputToken.map((token) => tradingBalances.get(token)),
          signerAddress
        )
        await rTokenMint.exchange(tradingBalances)

        const output = tradingBalances.toTokenQuantities()
        const parts = {
          trading: inputQuantityToBasketTokens.trading,
          minting: inputQuantityToBasketTokens.minting,
          rTokenMint,
          full: new SwapPaths(
            this.universe,
            [inputTokenQuantity],
            [...inputQuantityToBasketTokens.fullSwap.swapPaths, rTokenMint],
            output,
            rTokenMint.outputValue,
            signerAddress
          ),
        }

        yield new MintRTokenSearcherResult(
          this.universe,
          userInput,
          parts,
          signerAddress,
          rToken
        )
      } catch (e) {}
    }
  }

  async externalQuoters(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: number,
    dynamicInput: boolean
  ): Promise<SwapPath[]> {
    const allowAggregatorSearch =
      this.universe.wrappedTokens.get(output)?.allowAggregatorSearcher ?? true
    if (!allowAggregatorSearch || this.universe.lpTokens.has(output)) {
      console.log('Skipping external quoters - ' + output.toString())
      return []
    }
    const executorAddress = this.universe.config.addresses.executorAddress
    const out: SwapPath[] = []
    let aggregators = this.universe.dexAggregators
    if (dynamicInput) {
      aggregators = aggregators.filter((i) => i.dynamicInput)
    }
    if (aggregators.length === 0) {
      console.log('No aggregators')
      return []
    }
    await Promise.all(
      aggregators.map(async (router) => {
        try {
          const swap = await router.swap(
            executorAddress,
            destination,
            input,
            output,
            slippage
          )
          out.push(swap)
        } catch (e) {}
      })
    )
    return out
  }

  async internalQuoter(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: number = 0.0,
    maxHops: number = 2
  ): Promise<SwapPath[]> {
    const bfsResult = bfs(
      this.universe,
      this.universe.graph,
      input.token,
      output,
      maxHops
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

    const allPlans: SwapPath[] = []
    await Promise.all(
      swapPlans.map(async (plan) => {
        try {
          allPlans.push(await plan.quote([input], destination))
        } catch (e) {
          // console.log(e)
          // console.log(plan.toString())
          // console.log(e)
        }
      })
    )

    allPlans.sort((l, r) => l.compare(r))
    return allPlans
  }

  async findSingleInputTokenSwap(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: number = 0.0,
    maxHops: number = 2,
    dynamicInput: boolean = false
  ): Promise<MultiChoicePath | null> {
    const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output)
    if (tradeSpecialCase != null) {
      const out = await tradeSpecialCase(input, destination)
      if (out != null) {
        return new MultiChoicePath(this.universe, [out])
      }
    }
    const [quotesInternal, quotesExternal] = await Promise.all([
      this.internalQuoter(input, output, destination, slippage, maxHops).catch(
        () => []
      ),
      this.externalQuoters(input, output, destination, slippage, dynamicInput),
    ])
    const quotes = (
      await Promise.all(
        [...quotesInternal, ...quotesExternal].map(async (q) => {
          try {
            const [cost, netValue] = await Promise.all([
              q.cost(this.universe),
              q.netValue(this.universe),
            ])
            return {
              quote: q,
              cost: cost,
              netValue: netValue,
            }
          } catch (e) {
            console.log(e)
            return null!
          }
        })
      )
    ).filter((i) => i != null)
    if (quotes.length === 0) {
      throw new Error('No quotes found')
    }
    quotes.sort((l, r) => -l.netValue.compare(r.netValue))
    return new MultiChoicePath(
      this.universe,
      quotes.map((i) => i.quote)
    )
  }
}
