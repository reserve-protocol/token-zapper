import { Universe } from '../Universe'
import { type Action } from '../action/Action'
import { CurveSwap } from '../action/Curve'
import { type MintRTokenAction } from '../action/RTokens'
import { Address } from '../base/Address'
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token'
import { bfs } from '../exchange-graph/BFS'
import { SearcherResult } from './SearcherResult'
import { SwapPath, SwapPaths, SwapPlan } from './Swap'

interface PostTradeMint {
  basketTokenQuantity: TokenAmounts
  action: Action
  mints: PostTradeMint[]
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
  universe: Universe,
  userInputQuantity: TokenQuantity,
  rToken: Token,
  unitBasket: TokenQuantity[]
) => {
  const totalPrecursorQuantities = new TokenAmounts()
  const postTradeTokenSplits: PostTradeMint[] = []

  const totalOfEach = new TokenAmounts()
  const recourseOn = async (qty: TokenQuantity) => {
    totalOfEach.add(qty)
    const acts = universe.wrappedTokens.get(qty.token)
    const lpToken = universe.lpTokens.get(qty.token)
    if (acts != null) {
      if (lpToken != null) {
        const preferred = await (lpToken.preferredSourcingMethod != null
          ? lpToken?.preferredSourcingMethod(userInputQuantity, qty, rToken)
          : null)

        if (preferred != null) {
          const { precursorQty, action } = preferred
          const precursorTokensNeeded = new TokenAmounts()
          precursorTokensNeeded.add(precursorQty)
          return {
            precursorTokensNeeded: precursorTokensNeeded,
            mint: null,
          }
        } else {
          return {
            precursorTokensNeeded: TokenAmounts.fromQuantities([qty]),
            mint: null,
          }
        }
      }
      const baseTokens = await acts.burn.quote([qty])
      const resolvedDeps = await Promise.all(
        baseTokens.map(async (qty) => ({
          quantity: qty,
          dependencies: await recourseOn(qty),
        }))
      )
      const precursorTokensNeeded = new TokenAmounts()
      const mints: PostTradeMint[] = []
      for (const dependency of resolvedDeps) {
        for (const mintPrecursorAmount of dependency.dependencies.precursorTokensNeeded.toTokenQuantities()) {
          precursorTokensNeeded.add(mintPrecursorAmount)
        }
        if (dependency.dependencies.mint != null) {
          mints.push(dependency.dependencies.mint)
        }
      }

      const mint = {
        basketTokenQuantity: TokenAmounts.fromQuantities(baseTokens),
        action: acts.mint,
        mints,
      }
      return { precursorTokensNeeded: precursorTokensNeeded, mint }
    }
    return {
      precursorTokensNeeded: TokenAmounts.fromQuantities([qty]),
      mint: null,
    }
  }

  for (const qty of unitBasket) {
    const tree = await recourseOn(qty)
    totalPrecursorQuantities.addAll(tree.precursorTokensNeeded)
    if (tree.mint) {
      postTradeTokenSplits.push(tree.mint)
    }
  }
  const recourseOnMint = async (qty: PostTradeMint) => {
    qty.mints.forEach(recourseOnMint)
    qty.basketTokenQuantity = TokenAmounts.fromQuantities(
      qty.basketTokenQuantity
        .toTokenQuantities()
        .map((i) => i.div(totalOfEach.get(i.token)))
    )
  }
  for (const mint of postTradeTokenSplits) {
    recourseOnMint(mint)
  }
  return {
    totalPrecursorQuantities,
    postTradeTokenSplits,
  }
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
    const precursorTokenBasket =
      precursorTokens.totalPrecursorQuantities.toTokenQuantities()
    // Split input by how large each token in precursor set is worth.
    // Example: We're trading 0.1 ETH, and precursorTokenSet(rToken) = (0.5 usdc, 0.5 usdt)
    // say usdc is trading at 0.99 usd and usdt 1.01, then the trade will be split as follows
    // sum = 0.99 * 0.5 + 1.01 * 0.5 = 1
    // 0.1 * (0.99 * 0.5) / sum = 0.0495 ETH will be going into the USDC trade
    // 0.1 * (1.01 * 0.5) / sum = 0.0505 ETH will be going into the USDT trade
    // If we can't quote every precursor token, split input evenly between trades.
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
    const mintsToSubtract: SwapPath[] = []
    const mints: SwapPath[] = []
    const recourseOn = async (mint: PostTradeMint) => {
      await Promise.all((mint.mints ?? []).map((mint) => recourseOn(mint)))

      const mintInput = mint.basketTokenQuantity
        .toTokenQuantities()
        .map((qty) => tradingBalances.get(qty.token).mul(qty))
      const mintOutput = await new SwapPlan(this.universe, [mint.action]).quote(
        mintInput,
        this.universe.config.addresses.executorAddress
      )
      mintsToSubtract.push(mintOutput)
      mintOutput.outputs.forEach((qty) => tradingBalances.add(qty))
      inputQuantityToTokenSet.push(mintOutput)
      mints.push(mintOutput)
    }
    for (const mint of precursorTokens.postTradeTokenSplits) {
      await recourseOn(mint)
    }

    for (const action of mintsToSubtract) {
      for (const input of action.inputs) {
        tradingBalances.sub(input)
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

  async findSingleInputToRTokenZap(
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
      new SwapPaths(
        this.universe,
        [userInput],
        [
          new SwapPath(
            this.universe,
            inputQuantityToBasketTokens.inputs,
            inputQuantityToBasketTokens.swapPaths.map((i) => i.steps).flat(),
            inputQuantityToBasketTokens.outputs,
            inputQuantityToBasketTokens.outputValue,
            inputQuantityToBasketTokens.destination
          ),
          rTokenMint,
        ],
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
    const executorAddress =
      this.universe.chainConfig.config.addresses.executorAddress
    return await Promise.all(
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

    const entitiesToUpdate = new Set<Address>()
    for (const plan of swapPlans) {
      for (const action of plan.steps) {
        entitiesToUpdate.add(action.address)
      }
    }
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
    const quotes = (
      await Promise.all([
        this.internalQuoter(input, output, destination, slippage, maxHops).then(
          (results) => results.filter((result) => result.inputs.length === 1)
        ),
        this.externalQuoters(input, output, destination, slippage),
      ])
    ).flat()
    quotes.sort((l, r) => -l.compare(r))
    return quotes
  }
}
