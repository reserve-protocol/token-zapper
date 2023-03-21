import { type Action } from '../action/Action'
import { BurnRTokenAction, type MintRTokenAction } from '../action/RTokens'
import { type Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { bfs } from '../exchange-graph/BFS'
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { SearcherResult } from './SearcherResult'
import {
  MultiStepTokenExchange,
  MultiTokenExchange,
  SwapPlan,
  TokenExchange,
} from './Swap'
import { ApprovalsStore } from './ApprovalsStore'

interface ZapToRTokenParams {
  input: TokenQuantity
  rToken: Token
  signerAddress: Address
}

/**
 * Given some token set, try to see if it can be converted into
 *
 * In the above case, we collapse the inputs into (0.5 USDT, 0.5 USDC), but we keep track of how much went into the mint action of the whole.
 * 25% of 0.5 USDT goes into the saUSDT mint action
 * 25% of 0.5 USDT goes into the cUSDT mint action
 * 50% of 0.5 USDT goes directly into the mint eUSD action
 *
 * Essentially this function splits a trade going from A -> RToken(BA,BB,BC) into three trades + potential mints: ((A -> BA' -> BA), (A -> BB' -> BB), (A -> BC' -> BC))
 */
const findPrecursorTokenSet = async (
  universe: Universe,
  quantitiesPrOutput: TokenQuantity[]
) => {
  const baseTokenAmountsNeededToken = new TokenAmounts()
  const postTradeTokenSplits = new DefaultMap<
    Token,
    Array<{
      basketTokenQuantity: TokenQuantity
      precursorQuantityNeeded: TokenQuantity
      action: Action
    }>
  >(() => [])
  for (const qty of quantitiesPrOutput) {
    // First check if token can be minted from something else
    const acts = universe.wrappedTokens.get(qty.token)
    if (acts != null) {
      const baseQtyNeeded = (await acts.burn.quote([qty]))[0]
      baseTokenAmountsNeededToken.add(baseQtyNeeded)
      postTradeTokenSplits.get(baseQtyNeeded.token).push({
        basketTokenQuantity: qty.token.zero,
        precursorQuantityNeeded: baseQtyNeeded,
        action: acts.mint,
      })
    } else {
      baseTokenAmountsNeededToken.add(qty)
    }
  }

  // Base token set to trade for
  const precursorTokens = [...baseTokenAmountsNeededToken.tokenBalances.keys()]

  for (const [token, splits] of postTradeTokenSplits.entries()) {
    const total = baseTokenAmountsNeededToken.get(token)
    if (total.amount === 0n) {
      continue
    }

    for (const split of splits) {
      split.basketTokenQuantity = split.precursorQuantityNeeded.div(total)
    }
  }

  return precursorTokens.map((output) => {
    return {
      precursorQtyPrOutputToken: baseTokenAmountsNeededToken.get(output),
      postTradeMintsAndRatios: postTradeTokenSplits.get(output),
    }
  })
}

export class Searcher {
  private readonly approvals: ApprovalsStore
  constructor(private readonly universe: Universe) {
    this.approvals = new ApprovalsStore(universe.provider)
  }

  /**
   * @note This helper fill attempt to find a way to trade input token quantity
   *       We will use the example: (10 X) -> (Q, W, E, R, T, Y) for comments:
   *          -> Reads as, we want to trade 10 X into amount of (Q, W, E, R, T, Y)
   *       The 'quantitiesPrToken' represents the quantities pr unit of output we're looking for.
   *       In the example one unit of the output is given as: (0.10 Q, 0.25 W, 100 E, 0.10 R, 0.25 T, 100 Y)
   *       In the example Q and E can be minted from W, and R and Y can be minted from T
   * @param basketUnit
   **/
  private async findSingleInputToBasketGivenBasketUnit(
    inputQuantity: TokenQuantity,
    // The tokens to trade for, the quantities represent each unit of output.
    basketUnit: TokenQuantity[]
  ) {
    // First step is to try and see if we can find a smaller set of tokens to trade for.
    // This is based on the assumption that minting is preferable to trading.
    //
    // Before this call, the example problem was (10 X) -> (Q, W, E, R, T, Y) and 1 output unit = (0.10 Q, 0.25 W, 100 E, 0.10 R, 0.25 T, 100 Y)
    const precursorTokens = await findPrecursorTokenSet(
      this.universe,
      basketUnit
    )
    // Post call, we reduced the problem
    // (10 X) -> (0.5 W, 0.5T) + following post trade mints (0.25W->0.10Q, 0.25W->100E, 0.25T->0.10R, 0.25T->100Y)

    // This means we have two trades: X -> W and X -> Y
    // But we don't now much of the 10 X to put into each trade,
    // We know that 1 unit of output is (0.5 W, 0.5T)
    // So if we just price 0.5W and 0.5T, and sum them, we can work out a rough split for the trades
    // S = P(W) * 0.5 + P(T) * 0.5
    // X going into X -> W trade: (P(W) * 0.5) / S
    // X going into X -> T trade: (P(W) * 0.5) / S
    // If pricing fails, we will use the quantities and assume S = 0.5
    // If it fails, the trade executes evenly split instead

    let precursorTokenPrices = await Promise.all(
      precursorTokens.map(async (precursorToken) => {
        const quote = await this.universe.fairPrice(
          precursorToken.precursorQtyPrOutputToken
        )
        return {
          precursorToken,
          quote: quote ?? this.universe.usd.zero,
        }
      })
    )
    if (!precursorTokenPrices.every((i) => i.quote.amount !== 0n)) {
      precursorTokenPrices = precursorTokenPrices.map((i) => ({
        ...i,
        quote: i.precursorToken.precursorQtyPrOutputToken.convertTo(
          this.universe.usd
        ),
      }))
    }
    const quoteSum = precursorTokenPrices.reduce(
      (l, r) => r.quote.add(l),
      this.universe.usd.zero
    )

    const inputAmountPrPrecursor = precursorTokenPrices.map((priceOfToken) => {
      return {
        ...priceOfToken,
        inputQuantity: priceOfToken.quote
          .div(quoteSum)
          .convertTo(inputQuantity.token)
          .mul(inputQuantity),
      }
    })

    const inputQuantityToTokenSet: MultiStepTokenExchange[] = []

    const tradingBalances = new TokenAmounts()
    tradingBalances.add(inputQuantity)
    for (const { precursorToken, inputQuantity } of inputAmountPrPrecursor) {
      const stepsToGetOutput: MultiStepTokenExchange[] = []

      if (
        // Skip trade if precursor is part of rToken input
        precursorToken.precursorQtyPrOutputToken.token !== inputQuantity.token
      ) {
        const swaps = await this.findSingleInputTokenSwap(
          inputQuantity,
          precursorToken.precursorQtyPrOutputToken.token,
          this.universe.config.addresses.executorAddress
        )

        // TODO: evaluate different trades
        const initialTrade = swaps[0]
        if (initialTrade == null) {
          throw new Error('Could not find way to swap into precursor token')
        }
        if (!tradingBalances.hasBalance(initialTrade.inputs)) {
          throw new Error('Failed to find token zap')
        }
        tradingBalances.exchange(initialTrade.inputs, initialTrade.output)
        stepsToGetOutput.push(initialTrade)
      }

      // Balance of our precursor token post trade
      // At this point we have some balance of (W * x', T * y'),
      // Where x' and y' is the result of our trades
      const balance = tradingBalances.get(
        precursorToken.precursorQtyPrOutputToken.token
      )

      // Execute mints
      // W has two mints: x' * 0.25 W -> Q, x' * 0.25 W -> E,
      // T has two mints: y' * 0.25 T -> R, y' * 0.25 T -> Y,
      for (const tokenMint of precursorToken.postTradeMintsAndRatios) {
        const mintInput = balance.mul(tokenMint.basketTokenQuantity)

        const inputTokenMint = await new SwapPlan(this.universe, [
          tokenMint.action,
        ]).quote([mintInput], this.universe.config.addresses.executorAddress)

        tradingBalances.exchange(inputTokenMint.inputs, inputTokenMint.output)
        stepsToGetOutput.push(inputTokenMint)
      }

      inputQuantityToTokenSet.push(...stepsToGetOutput)
    }

    // Jus to finalize the example. Say, X, W and T all exchanged 1 to 1,
    // The example here would have resulted in approximately 10 units of the output basket
    // 10X => (1.0 Q, 2.5 W, 1000 E, 1.0 R, 2.5 T, 1000 Y)

    return new MultiTokenExchange(
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

  async findSingleInputToRTokenZap(
    userInput: TokenQuantity,
    rToken: Token,
    signerAddress: Address
  ) {
    const inputIsNative = userInput.token === this.universe.nativeToken
    let inputTokenQuantity = userInput
    if (inputIsNative) {
      if (this.universe.commonTokens.ERC20GAS == null) {
        throw new Error(
          'No wrapped native token. (Like WETH) has been defined. Cannot execute search'
        )
      }
      inputTokenQuantity = userInput.convertTo(
        this.universe.commonTokens.ERC20GAS
      )
    }

    const rTokenActions = this.universe.wrappedTokens.get(rToken)
    if (rTokenActions == null) {
      throw new Error('Param rToken is not a known RToken')
    }

    const mintAction = rTokenActions.mint as MintRTokenAction

    const tradingBalances = new TokenAmounts()
    tradingBalances.add(inputTokenQuantity)
    const inputQuantityToBasketTokens =
      await this.findSingleInputToBasketGivenBasketUnit(
        inputTokenQuantity,
        mintAction.basketHandler.mintQuantities
      )

    tradingBalances.exchange(
      inputQuantityToBasketTokens.inputs,
      inputQuantityToBasketTokens.output
    )

    const rTokenMint = await new SwapPlan(this.universe, [
      rTokenActions.mint,
    ]).quote(
      mintAction.input.map((token) => tradingBalances.get(token)),
      signerAddress
    )

    tradingBalances.exchange(rTokenMint.inputs, rTokenMint.output)

    const output = tradingBalances.toTokenQuantities()

    const searcherResult = new SearcherResult(
      this.universe,
      this.approvals,
      [userInput],
      new MultiTokenExchange(
        this.universe,
        [inputTokenQuantity],
        [
          new MultiStepTokenExchange(
            this.universe,
            inputQuantityToBasketTokens.inputs,
            inputQuantityToBasketTokens.tokenExchanges.map(i => i.steps).flat(),
            inputQuantityToBasketTokens.output,
            inputQuantityToBasketTokens.outputValue,
            inputQuantityToBasketTokens.destination
          ),
          rTokenMint
        ],
        output,
        rTokenMint.outputValue,
        signerAddress
      ),
      rTokenMint.output,
      signerAddress
    )
    return searcherResult
  }

  async externalQuoters(
    input: TokenQuantity,
    output: Token,
    destination: Address
  ): Promise<MultiStepTokenExchange[]> {
    const executorAddress =
      this.universe.chainConfig.config.addresses.executorAddress
    return await Promise.all(
      this.universe.dexAggregators.map(
        async (router) =>
          await router.swap(executorAddress, destination, input, output, 0)
      )
    )
  }

  async internalQuoter(
    input: TokenQuantity,
    output: Token,
    destination: Address
  ): Promise<MultiStepTokenExchange[]> {
    const bfsResult = bfs(
      this.universe,
      this.universe.graph,
      input.token,
      output,
      2
    )
    const swapPlans = bfsResult.steps
      .map((i) => i.convertToSingularPaths())
      .flat()
      .filter((plan) => plan.inputs.length === 1)

    const entitiesToUpdate = new Set<Address>()
    for (const plan of swapPlans) {
      for (const action of plan.steps) {
        entitiesToUpdate.add(action.address)
      }
    }
    this.universe.refresh(entitiesToUpdate)
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
    destination: Address
  ): Promise<MultiStepTokenExchange[]> {
    const quotes = (
      await Promise.all([
        this.internalQuoter(input, output, destination).then((results) =>
          results.filter((result) => result.inputs.length === 1)
        ),
        this.externalQuoters(input, output, destination),
      ])
    ).flat()
    quotes.sort((l, r) => -l.compare(r))
    return quotes
  }
}
