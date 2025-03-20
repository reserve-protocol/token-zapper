import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { TokenQuantity } from '../entities/Token'
import { nelderMeadOptimize, normalizeVectorByNodes } from './NelderMead'

/** Optimises trades solely in terms of output quantity ignoring tx fees */
export const optimiseTradesInOutQty = async (
  input: TokenQuantity,
  tradeActions: BaseAction[],
  parts: number = 10
) => {
  const inputToken = input.token

  const maxInputs = tradeActions.map((i) => Infinity)
  if (maxInputs.every((i) => i === 0)) {
    return {
      inputs: tradeActions.map(() => 0),
      output: 0,
      input: 0,
      price: 0,
      unspent: input.asNumber(),
      outputs: tradeActions.map(() => 0),
    }
  }

  const evaluteAction = async (action: BaseAction, inputQty: number) => {
    const input = inputToken.from(inputQty)
    const output = await action.quote([input]).catch(() => {
      return [action.outputToken[0].zero]
    })
    const outputQty = output[0].asNumber()
    const price = outputQty / inputQty
    return {
      price,
      inputQty,
      inputValue: inputQty,
      outputQty,
      outputValue: outputQty,
    }
  }
  const inputQty = input.asNumber()
  const onePart = inputQty / parts
  const state = tradeActions.map((action, index) => ({
    input: 0,
    output: 0,
    index,
    maxInput: maxInputs[index],
    action,
  }))
  const step = async () => {
    const eligible = state.filter((i) => i.input < i.maxInput)

    if (eligible.length === 0) {
      return
    }

    const results = await Promise.all(
      state
        .filter((i) => i.input < i.maxInput)
        .map(async (state) => {
          const newInput = Math.min(state.maxInput, state.input + onePart)
          return {
            result: await evaluteAction(state.action, newInput),
            newInput,
            state,
          }
        })
    )
    // Pick the best one in terms of output pr inputput - gas
    results
      .filter((i) => i.result.price == 0)
      .sort((l, r) => r.result.price - l.result.price)

    const best = results[0]
    best.state.input = Math.min(best.newInput, best.state.maxInput)
    best.state.output = best.result.outputQty
  }
  for (let i = 0; i < parts; i++) {
    await step()
  }
  const totalOutput = state.reduce((l, r) => l + r.output, 0)

  return {
    inputs: state.map((i) => i.input),
    output: totalOutput,
    outputs: state.map((i) => i.output),
    price: inputQty / totalOutput,
  }
}

export const optimiseTrades = async (
  universe: Universe,
  input: TokenQuantity,
  tradeActions: BaseAction[],
  floorPrice: number,
  parts: number = 10
) => {
  const actionsOuts = await Promise.all(
    tradeActions.map(async (a) => {
      try {
        return (await a.quote([input.scalarDiv(20n)]))[0].asNumber()
      } catch (e) {
        return 0
      }
    })
  )

  const best = Math.max(...actionsOuts)
  // Pick all that are within 10% of the best

  const tradeActionIndicesToOptimise = tradeActions
    .map((_, i) => i)
    .filter((i) => {
      return actionsOuts[i] >= best * 0.9
    })
  console.log(
    `Optimising ${tradeActionIndicesToOptimise.length} actions out of ${tradeActions.length}`
  )

  const finalOutputs = tradeActions.map(() => 0)
  const finalInputs = tradeActions.map(() => 0)

  tradeActions = tradeActionIndicesToOptimise.map((i) => tradeActions[i])
  const minimium = 1 / parts
  const initial = tradeActions.map(() => 1 / tradeActions.length)
  const dim = [tradeActions.length]
  const inputValue = (await input.price()).asNumber()
  const outputToken = tradeActions[0].outputToken[0]
  const outputTokenPrice = (await outputToken.price).asNumber()
  const gasTokenPrice = universe.gasTokenPrice.asNumber()

  let totalOut = 0
  const inputQty = input.asNumber()
  await nelderMeadOptimize(
    initial,
    async (params, iteration) => {
      const paramsRounded = normalizeVectorByNodes(
        normalizeVectorByNodes(params, dim).map((p) => (p < minimium ? 0 : p)),
        dim
      )

      const outputs = await Promise.all(
        paramsRounded.map(async (p, i) => {
          if (p == 0) {
            return null
          }
          const action = tradeActions[i]
          return await action
            .quote([action.inputToken[0].from(p * inputQty)])
            .catch(() => null)
        })
      )
      totalOut = 0
      let gasUnits = 0n
      for (let i = 0; i < finalInputs.length; i++) {
        finalInputs[i] = 0
      }
      for (let i = 0; i < tradeActions.length; i++) {
        const out = outputs[i]
        if (out == null) {
          continue
        }
        finalInputs[tradeActionIndicesToOptimise[i]] =
          paramsRounded[i] * inputQty
        finalOutputs[tradeActionIndicesToOptimise[i]] = out[0].asNumber()
        totalOut += finalOutputs[tradeActionIndicesToOptimise[i]]
        gasUnits += tradeActions[i].gasEstimate()
      }
      const txFee =
        universe.nativeToken.from(gasUnits * universe.gasPrice).asNumber() *
        gasTokenPrice
      const outputValue = totalOut * outputTokenPrice
      const price = outputValue / (inputValue + txFee)
      return 1 / price
    },
    universe.logger,
    {
      maxIterations: 100,
      perturbation: 0.5,
      tolerance: 1e-6,
    },
    (params) =>
      normalizeVectorByNodes(
        normalizeVectorByNodes(params, dim).map((p) => (p < minimium ? 0 : p)),
        dim
      )
  )

  return {
    inputs: finalInputs,
    output: totalOut,
    outputs: finalOutputs,
  }
}
export type OptimisedTrade = Awaited<ReturnType<typeof optimiseTrades>>
