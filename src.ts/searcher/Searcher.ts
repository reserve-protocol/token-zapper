import {
  PostTradeAction,
  BasketTokenSourcingRuleApplication,
} from './BasketTokenSourcingRules'
import { Universe } from '../Universe'
import { CurveSwap } from '../action/Curve'
import { type MintRTokenAction } from '../action/RTokens'
import { Address } from '../base/Address'
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token'
import { bfs } from '../exchange-graph/BFS'
import { SearcherResult } from './SearcherResult'
import { SwapPath, SwapPaths, SwapPlan } from './Swap'
import { retryLoop } from '../base'

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
  universe: Universe,
  userInputQuantity: TokenQuantity,
  rToken: Token,
  unitBasket: TokenQuantity[]
) => {
  const specialRules = universe.precursorTokenSourcingSpecialCases.get(rToken)
  const basketTokenApplications: BasketTokenSourcingRuleApplication[] = []

  const recourseOn = async (
    qty: TokenQuantity
  ): Promise<BasketTokenSourcingRuleApplication> => {
    const tokenSourcingRule = specialRules.get(qty.token)
    if (tokenSourcingRule != null) {
      return await tokenSourcingRule(userInputQuantity.token, qty)
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

export class Searcher {
  constructor(private readonly universe: Universe) {}

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
  private async findSingleInputToBasketGivenBasketUnit(
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
      basketUnit
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

    const inputQuantityToTokenSet: SwapPath[] = []
    const tradingBalances = new TokenAmounts()
    tradingBalances.add(inputQuantity)

    // Trade inputs for precursor set.
    for (const { input, output } of inputPrTrade) {
      if (
        // Skip trade if user input is part of precursor set
        input.token === output
      ) {
        continue
      }

      // Swaps are sorted by output amount in descending order
      const swaps = await this.findSingleInputTokenSwap(
        input,
        output,
        this.universe.config.addresses.executorAddress,
        slippage
      )

      const trade = swaps[0]
      if (trade == null) {
        throw new Error('Could not find way to swap into precursor token')
      }
      if (!tradingBalances.hasBalance(trade.inputs)) {
        throw new Error('Failed to find token zap')
      }
      await trade.exchange(tradingBalances)
      inputQuantityToTokenSet.push(trade)
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
        inputQuantityToTokenSet.push(mintExec)
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

    return new SwapPaths(
      this.universe,
      [inputQuantity],
      inputQuantityToTokenSet,
      tradingBalances.toTokenQuantities(),
      inputQuantityToTokenSet.reduce(
        (l, r) => l.add(r.outputValue),
        this.universe.usd.zero
      ),
      this.universe.config.addresses.executorAddress
    )
  }

  async recursivelyUnwrapQty(qty: TokenQuantity): Promise<SwapPaths> {
    const potentiallyUnwrappable = [qty]
    const tokenAmounts = new TokenAmounts()
    const swapPlans: SwapPath[] = []

    while (potentiallyUnwrappable.length !== 0) {
      const qty = potentiallyUnwrappable.pop()!
      const mintBurnActions = this.universe.wrappedTokens.get(qty.token)
      if (mintBurnActions == null) {
        tokenAmounts.add(qty)
        continue
      }
      const output = await mintBurnActions.burn.quote([qty])
      const plan = new SwapPlan(this.universe, [mintBurnActions.burn])
      swapPlans.push(
        await plan.quote([qty], this.universe.config.addresses.executorAddress)
      )
      for (const underylingQty of output) {
        potentiallyUnwrappable.push(underylingQty)
      }
    }
    const output = tokenAmounts.toTokenQuantities()
    const outputQuotes = await Promise.all(
      output.map(
        async (qty) =>
          (await this.universe.fairPrice(qty)) ?? this.universe.usd.zero
      )
    )

    return new SwapPaths(
      this.universe,
      [qty],
      swapPlans,
      output,
      outputQuotes.reduce((l, r) => l.add(r), this.universe.usd.zero),
      this.universe.config.addresses.executorAddress
    )
  }

  async findRTokenIntoSingleTokenZap(
    rTokenQuantity: TokenQuantity,
    output: Token,
    signerAddress: Address,
    slippage = 0.0
  ) {
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

    const redeemRTokenForUnderlying = await this.recursivelyUnwrapQty(
      rTokenQuantity
    )

    // Trade each underlying for output
    const tokenAmounts = new TokenAmounts()
    tokenAmounts.addQtys(redeemRTokenForUnderlying.outputs)

    const underlyingToOutputTrade = await Promise.all(
      redeemRTokenForUnderlying.outputs
        .filter((qty) => qty.token !== outputToken)
        .map(async (qty) => {
          const potentialSwaps = await this.findSingleInputTokenSwap(
            qty,
            outputToken,
            signerAddress,
            slippage
          )
          const trade = potentialSwaps[0]
          await trade.exchange(tokenAmounts)
          return trade
        })
    )

    const totalOutput = tokenAmounts.get(outputToken)
    const outputValue =
      (await this.universe.fairPrice(totalOutput)) ?? this.universe.usd.zero

    const outputSwap = new SwapPaths(
      this.universe,
      [rTokenQuantity],
      [
        new SwapPath(
          this.universe,
          redeemRTokenForUnderlying.inputs,
          redeemRTokenForUnderlying.swapPaths.map((i) => i.steps).flat(),
          redeemRTokenForUnderlying.outputs,
          redeemRTokenForUnderlying.outputValue,
          redeemRTokenForUnderlying.destination
        ),
        ...underlyingToOutputTrade,
      ],
      tokenAmounts.toTokenQuantities(),
      outputValue,
      signerAddress
    )

    return outputSwap
  }

  public findSingleInputToRTokenZap(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0
  ): Promise<SearcherResult> {
    // return this.findSingleInputToRTokenZap_(
    //   userInput,
    //   rToken,
    //   signerAddress,
    //   slippage
    // )
    return retryLoop(
      () =>
        this.findSingleInputToRTokenZap_(
          userInput,
          rToken,
          signerAddress,
          slippage
        ),
      {
        maxRetries: 3,
        retryDelay: 500,
      }
    )
  }

  private async findSingleInputToRTokenZap_(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address,
    slippage = 0.0
  ) {
    const inputIsNative = userInput.token === this.universe.nativeToken
    let inputTokenQuantity = userInput
    if (inputIsNative) {
      if (this.universe.commonTokens.ERC20GAS == null) {
        throw new Error(
          'No wrapped native token. (Like WETH) has been defined. Cannot execute search'
        )
      }
      inputTokenQuantity = userInput.into(this.universe.commonTokens.ERC20GAS)
    }
    const rTokenActions = this.universe.wrappedTokens.get(rToken)
    if (rTokenActions == null) {
      throw new Error('RToken has no mint/burn actions')
    }

    const mintAction = rTokenActions.mint as MintRTokenAction

    const tradingBalances = new TokenAmounts()
    tradingBalances.add(inputTokenQuantity)
    const inputQuantityToBasketTokens =
      await this.findSingleInputToBasketGivenBasketUnit(
        inputTokenQuantity,
        rToken,
        mintAction.basket.unitBasket,
        slippage
      )
    await inputQuantityToBasketTokens.exchange(tradingBalances)

    const rTokenMint = await new SwapPlan(this.universe, [
      rTokenActions.mint,
    ]).quote(
      mintAction.input.map((token) => tradingBalances.get(token)),
      signerAddress
    )
    await rTokenMint.exchange(tradingBalances)

    const output = tradingBalances.toTokenQuantities()

    const searcherResult = new SearcherResult(
      this.universe,
      userInput,
      new SwapPaths(
        this.universe,
        [inputTokenQuantity],
        [...inputQuantityToBasketTokens.swapPaths, rTokenMint],
        output,
        rTokenMint.outputValue,
        signerAddress
      ),
      signerAddress,
      rToken
    )
    return searcherResult
  }

  async externalQuoters(
    input: TokenQuantity,
    output: Token,
    destination: Address,
    slippage: number
  ): Promise<SwapPath[]> {
    if (
      this.universe.wrappedTokens.has(output) ||
      this.universe.lpTokens.has(output)
    ) {
      return []
    }
    const executorAddress =
      this.universe.chainConfig.config.addresses.executorAddress
    const out = await Promise.all(
      this.universe.dexAggregators.map(
        async (router) =>
          await router.swap(
            executorAddress,
            destination,
            input,
            output,
            slippage
          )
      )
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
    const start = Date.now()
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
        if (plan.inputs.length !== 1) {
          return false
        }
        if (plan.steps.filter((step) => step instanceof CurveSwap).length > 1) {
          return false
        }
        if (
          plan.steps.some((i) => i.input.length !== 1 || i.output.length !== 1)
        ) {
          return false
        }

        return true
      })

    const allPlans = await Promise.all(
      swapPlans.map(async (plan) => {
        return await plan.quote([input], destination)
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
    maxHops: number = 2
  ): Promise<SwapPath[]> {
    const tradeSpecialCase = this.universe.tokenTradeSpecialCases.get(output)
    if (tradeSpecialCase != null) {
      const out = await tradeSpecialCase(input, destination)
      if (out != null) {
        return [out]
      }
    }

    const quotes = (
      await Promise.all([
        this.internalQuoter(input, output, destination, slippage, maxHops),
        this.externalQuoters(input, output, destination, slippage),
      ])
    ).flat()
    quotes.sort((l, r) => -l.compare(r))
    return quotes
  }
}
