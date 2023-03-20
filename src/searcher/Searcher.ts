import { type Action } from '../action/Action'
import { type MintRTokenAction } from '../action/RTokens'
import { type Address } from '../base/Address'
import { DefaultMap } from '../base/DefaultMap'
import { bfs } from '../exchange-graph/BFS'
import { TokenAmounts, type Token, type TokenQuantity } from '../entities/Token'
import { type Universe } from '../Universe'
import { SearcherResult } from './SearcherResult'
import { SwapPlan, type Swaps } from './Swap'
import { ApprovalsStore } from './ApprovalsStore'

interface ZapToRTokenParams {
  input: TokenQuantity
  rToken: Token
  signerAddress: Address
}

export class Searcher {
  private readonly approvals: ApprovalsStore
  constructor(private readonly universe: Universe) {
    this.approvals = new ApprovalsStore(universe.provider)
  }

  async findSingleInputToRTokenZap(params: ZapToRTokenParams) {
    const userInput = params.input
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
    const tradingBalances = new TokenAmounts()
    tradingBalances.add(inputTokenQuantity)
    const signerAddress = params.signerAddress
    const rToken = params.rToken

    const actions = this.universe.actions.get(rToken.address)
    if (actions == null || actions.length !== 2) {
      throw new Error('')
    }
    const rTokenMintAction = (
      actions[0].output[0] === rToken ? actions[0] : actions[1]
    ) as MintRTokenAction
    const baseTokenAmountsNeededPrRToken = new TokenAmounts()
    const baseTokenSplits = new DefaultMap<
      Token,
      Array<{ rate: TokenQuantity; action: Action }>
    >(() => [])
    const inputQuantitiesPrRToken =
      rTokenMintAction.basketHandler.mintQuantities
    for (const qty of inputQuantitiesPrRToken) {
      const acts = this.universe.wrappedTokens.get(qty.token)
      if (acts != null) {
        const baseQtyNeeded = (await acts.burn.quote([qty]))[0]
        baseTokenAmountsNeededPrRToken.add(baseQtyNeeded)
        baseTokenSplits
          .get(baseQtyNeeded.token)
          .push({ rate: baseQtyNeeded, action: acts.mint })
      } else {
        baseTokenAmountsNeededPrRToken.add(qty)
        baseTokenSplits
          .get(qty.token)
          .push({ rate: qty, action: rTokenMintAction })
      }
    }

    const tokensToBuy = [
      ...baseTokenAmountsNeededPrRToken.tokenBalances.values(),
    ]
      .filter((i) => tradingBalances.get(i.token).amount === 0n)
      .map((i) => i.token)
    const swaps: Swaps[] = []
    const executorAddress = this.universe.config.addresses.executorAddress

    if (tokensToBuy.length !== 0) {
      const tradeInputAmount = inputTokenQuantity.scalarDiv(
        BigInt(tokensToBuy.length)
      )

      const innerTrades = await Promise.all(
        tokensToBuy.map(async (tokenWeNeedToBuy) => {
          const swaps = await this.findSingleInputTokenSwap(
            tradeInputAmount,
            tokenWeNeedToBuy,
            executorAddress
          )

          const swap = swaps[0]
          tradingBalances.exchange(swap.inputs, swap.output)
          return swap
        })
      )
      swaps.push(...innerTrades)
    }

    for (const baseTokenQuantity of baseTokenAmountsNeededPrRToken.tokenBalances.values()) {
      const balance = tradingBalances.get(baseTokenQuantity.token)

      for (const split of baseTokenSplits.get(baseTokenQuantity.token)) {
        if (split.action === rTokenMintAction) {
          continue
        }
        const ratio = split.rate.div(baseTokenQuantity)
        const mintInput = balance.mul(ratio)
        const mintAction = await new SwapPlan(this.universe, [
          split.action,
        ]).quote([mintInput], executorAddress)
        tradingBalances.exchange(mintAction.inputs, mintAction.output)
        swaps.push(mintAction)
      }
    }

    const rTokenInput = inputQuantitiesPrRToken.map(({ token }) =>
      tradingBalances.get(token)
    )
    const rTokenMint = await new SwapPlan(this.universe, [
      rTokenMintAction,
    ]).quote(rTokenInput, signerAddress)
    swaps.push(rTokenMint)
    tradingBalances.exchange(rTokenMint.inputs, rTokenMint.output)
    const output = [...tradingBalances.tokenBalances.values()].filter(
      (i) => i.amount !== 0n
    )
    output.sort((l, r) => -l.compare(r))

    const searcherResult = new SearcherResult(
      this.universe,
      this.approvals,
      [userInput],
      swaps,
      output,
      signerAddress
    )
    return searcherResult
  }

  async externalQuoters(
    input: TokenQuantity,
    output: Token,
    destination: Address
  ): Promise<Swaps[]> {
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
  ): Promise<Swaps[]> {
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
      for(const action of plan.steps) {
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
  ): Promise<Swaps[]> {
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
