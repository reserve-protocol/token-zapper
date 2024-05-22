import { type MintRTokenAction } from '../action/RTokens'
import { type Address } from '../base/Address'
import { simulationUrls } from '../base/constants'
import { ArbitrumUniverse } from '../configuration/arbitrum'
import { BaseUniverse } from '../configuration/base'
import { EthereumUniverse } from '../configuration/ethereum'
import { type Token, type TokenQuantity } from '../entities/Token'
import { TokenAmounts } from '../entities/TokenAmounts'
import { bfs } from '../exchange-graph/BFS'
import {
  BasketTokenSourcingRuleApplication,
  type PostTradeAction,
} from './BasketTokenSourcingRules'
import {
  MultiChoicePath,
  chunkifyIterable,
  createConcurrentStreamingSeacher,
  generateAllPermutations,
  resolveTradeConflicts,
} from './MultiChoicePath'
import { MintZap, RedeemZap, ZapViaATrade } from './SearcherResult'
import { SingleSwap, SwapPath, SwapPaths, SwapPlan } from './Swap'
import { ToTransactionArgs } from './ToTransactionArgs'
import { type UniverseWithERC20GasTokenDefined } from './UniverseWithERC20GasTokenDefined'

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
  universe: EthereumUniverse | ArbitrumUniverse | BaseUniverse,
  userInputQuantity: TokenQuantity,
  rToken: Token,
  unitBasket: TokenQuantity[],
  searcher: Searcher<EthereumUniverse | ArbitrumUniverse | BaseUniverse>
) => {
  // console.log(`Findiing precursor set for ${rToken}: ${unitBasket.join(', ')}`)
  const specialRules = universe.precursorTokenSourcingSpecialCases
  const basketTokenApplications: BasketTokenSourcingRuleApplication[] = []

  const recourseOn = async (
    qty: TokenQuantity
  ): Promise<BasketTokenSourcingRuleApplication> => {
    // console.log(qty)
    const tokenSourcingRule = specialRules.get(qty.token)
    if (tokenSourcingRule != null) {
      return await tokenSourcingRule(
        userInputQuantity.token,
        qty,
        searcher,
        unitBasket
      )
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
  const SearcherUniverse extends ArbitrumUniverse
  | EthereumUniverse
  | BaseUniverse
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
    // const start = Date.now()
    // console.log('Finding precursors for', rToken.symbol)
    /**
     * PHASE 1: Compute precursor set
     */
    const precursorTokens = await findPrecursorTokenSet(
      this.universe as any,
      inputQuantity,
      rToken,
      basketUnit,
      this as any
    )
    // console.log(precursorTokens.precursorToTradeFor.join(', '))
    // console.log(precursorTokens.describe().join('\n'))

    const generateInputToPrecursorTradeMeasurement = this.perf.begin(
      'generateInputToPrecursorTrade',
      rToken.symbol
    )
    const generateInputToPrecursorTradeMeasurementSetup = this.perf.begin(
      'generateInputToPrecursorTradeSetup',
      rToken.symbol
    )

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
              i,
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
          } catch (e) { }
        }
      })
    )

    generateInputToPrecursorTradeMeasurement()

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

          let tradingBalancesUsedForMinting = tradingBalances.clone()
          for (const action of precursorTokens.postTradeActions) {
            const tokensForBranch = tradingBalancesUsedForMinting.clone()
            await recourseOn(tradingBalances, tokensForBranch, action)
            if (action.updateBalances) {
              tradingBalancesUsedForMinting = tradingBalances.clone()
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
          console.log('Failed to generate issueance plan')
          console.log(e.stack)
          throw e
        }
      },
      rToken.symbol
    )

    const tradesWithOptions = multiTrades.filter((i) => i.hasMultipleChoices)
    if (tradesWithOptions.length === 0) {
      const normalTrades = multiTrades.map((i) => i.path)
      return await onResult(
        await generateIssueancePlan(
          await resolveTradeConflicts(this, abortSignal, normalTrades)
        )
      )
    }
    const precursorSet = new Set(
      precursorTokens.precursorToTradeFor.map((i) => i.token)
    )

    const allOptions = await this.perf.measurePromise(
      'generateAllPermutations',
      generateAllPermutations(this.universe as any, multiTrades, precursorSet),
      rToken.symbol
    )

    const aborter = new AbortController()
    const prRound = this.config.routerDeadline / 4
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
                await resolveTradeConflicts(this, abortSignal, paths)
              out = await generateIssueancePlan(pathWithResolvedTradeConflicts)

              try {
                await onResult(out)
                resultsProduced += 1
              } catch (e: any) { }
            } catch (e: any) { }

            if (resultsProduced > this.minResults) {
              if (Date.now() > endTime) {
                aborter.abort()
              }
            }
          })
        ),
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
  private async recursivelyUnwrapQty(
    qty: TokenQuantity
  ): Promise<SwapPath | null> {
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
  async redeem(
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

    const controller = createConcurrentStreamingSeacher(this as any, toTxArgs)

    void Promise.all([
      this.findRTokenIntoSingleTokenZapViaRedeem__(
        rTokenQuantity,
        output,
        signerAddress,
        toTxArgs.internalTradeSlippage,
        controller.onResult,
        controller.abortController.signal,
        start
      ).catch((e) => {
        // console.log(e)
      }),
      this.findTokenZapViaTrade(
        rTokenQuantity,
        output,
        signerAddress,
        toTxArgs.internalTradeSlippage,
        controller.onResult,
        controller.abortController.signal,
        start
      ).catch(() => { }),
    ]).catch(() => { })
    await controller.resultReadyPromise
    return controller.getResults(start)
  }

  private async findRTokenIntoSingleTokenZapViaRedeem__(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage: bigint,
    onResult: (result: RedeemZap) => Promise<void>,
    abortSignal: AbortSignal,
    startTime: number
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

    const unwrapTokenQtys = tokenAmounts.toTokenQuantities()
    const trades = await Promise.all(
      unwrapTokenQtys
        .filter((qty) => qty.token !== outputToken)
        .map(async (qty) => {
          for (let i = 2; i <= 3; i++) {
            const potentialSwaps = await this.findSingleInputTokenSwap(
              qty,
              outputToken,
              this.universe.config.addresses.executorAddress,
              slippage,
              abortSignal,
              i,
              false
            ).catch(() => null)
            if (potentialSwaps == null) {
              continue
            }
            return potentialSwaps
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
    )

    const permutableTrades = trades.filter((i) => i.paths.length !== 0)

    const generatePermutation = async (
      underlyingToOutputTrades: SwapPath[]
    ) => {
      const initialBalance = new TokenAmounts()
      initialBalance.add(rTokenQuantity)

      await redeem.exchange(initialBalance)

      const preRedeem = initialBalance.clone()
      if (redeemSwapPaths.length > 0) {
        const redeemPath = SwapPaths.fromPaths(this.universe, redeemSwapPaths)
        await redeemPath.exchange(preRedeem)
      }

      const pretradeBalances = preRedeem.clone()
      if (underlyingToOutputTrades.length > 0) {
        for (const trade of underlyingToOutputTrades) {
          await trade.exchange(pretradeBalances)
        }
      }

      const postTradeBalances = pretradeBalances.clone()
      const totalOutput = postTradeBalances.get(outputToken)
      const outputValue =
        (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero

      const outputSwap = new SwapPaths(
        this.universe,
        [rTokenQuantity],
        [redeem, ...redeemSwapPaths, ...underlyingToOutputTrades],
        postTradeBalances.toTokenQuantities(),
        outputValue,
        signerAddress
      )

      const zap = new RedeemZap(
        this.universe,
        rTokenQuantity,
        {
          full: outputSwap,
          rtokenRedemption: redeem,
          tokenBasketUnwrap: redeemSwapPaths,
          tradesToOutput: underlyingToOutputTrades,
        },
        signerAddress,
        totalOutput.token,
        startTime,
        abortSignal
      )

      return await onResult(zap).catch((e) => { })
    }

    if (permutableTrades.length === 0) {
      return await generatePermutation(permutableTrades.map((i) => i.path))
    } else {
      const allposibilities = await generateAllPermutations(
        this.universe as any,
        permutableTrades,
        new Set([outputToken])
      )
      for (const path of allposibilities) {
        if (abortSignal.aborted) {
          break
        }
        try {
          const resolveTrades = await resolveTradeConflicts(
            this,
            abortSignal,
            path
          )
          await generatePermutation(resolveTrades)
        } catch (e) {
          // console.log(e)
        }
      }
    }
  }

  private async findTokenZapViaTrade(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint,
    onResult: (result: ZapViaATrade) => Promise<void>,
    abortSignal: AbortSignal,
    startTime: number = Date.now()
  ) {
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
    const ownController = new AbortController()
    abortSignal.addEventListener('abort', () => {
      ownController.abort()
    })
    let results = 0
    this.findSingleInputTokenSwap_(
      inputTokenQuantity,
      rToken,
      signerAddress,
      slippage,
      ownController.signal,
      3,
      false,
      async (path) => {
        if (results >= 2) {
          return
        }
        await onResult(
          new ZapViaATrade(
            this.universe,
            userInput,
            path.intoSwapPaths(this.universe),
            signerAddress,
            rToken,
            startTime,
            abortSignal
          )
        )
        results += 1
        if (results >= 2) {
          ownController.abort()
        }
      },
      0.997
    )
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

  public async zapIntoRToken(
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

    const controller = createConcurrentStreamingSeacher(this as any, toTxArgs)

    const errors: Error[] = []
    const mintZap = this.findSingleInputToRTokenZap_(
      userInput,
      rToken,
      userAddress,
      slippage,
      controller.onResult,
      controller.abortController.signal,
      start
    ).catch((e) => {
      errors.push(e)
    })
    const tradeZap = this.findTokenZapViaTrade(
      userInput,
      rToken,
      userAddress,
      slippage,
      controller.onResult,
      controller.abortController.signal,
      start
    ).catch((e) => {
      errors.push(e)
    })
    void Promise.all([mintZap, tradeZap]).then(() => {
      if (!controller.abortController.signal.aborted) {
        // If both trading and minting failed for unknown reasons without producing any results abort the search
        controller.abortController.abort()
      }
    })
    await controller.resultReadyPromise

    try {
      return controller.getResults(start)
    } catch (e) {
      for (const err of errors) {
        console.log(err)
      }
      throw e
    }
  }

  private async findSingleInputToRTokenZap_(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage: bigint,
    onResult: (result: MintZap) => Promise<void>,
    abort: AbortSignal,
    startTime: number = Date.now()
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
    await this.findSingleInputToBasketGivenBasketUnit(
      inputTokenQuantity,
      rToken,
      unitBasket,
      slippage,
      async (inputQuantityToBasketTokens) => {
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
          new MintZap(
            this.universe,
            userInput,
            parts,
            signerAddress,
            rToken,
            startTime,
            abort
          )
        )
      },
      abort
    )
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
    onResult: (result: SwapPath) => Promise<void>,
    rejectRatio: number = 0.9
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
        if (ratio < rejectRatio) {
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
      }).catch((e) => { }),
    ])
  }
}
