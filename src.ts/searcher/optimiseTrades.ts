import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { TokenQuantity } from '../entities/Token'

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
      .sort((l, r) => l.result.price - r.result.price)
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
  const inputToken = input.token
  const outputToken = tradeActions[0].outputToken[0]

  const maxInputs = tradeActions.map((i) => Infinity)
  const [gasTokenPrice, inputTokenPrice, outputTokenPrice] = await Promise.all([
    universe.nativeToken.price,
    inputToken.price,
    outputToken.price,
  ]).then((prices) => prices.map((i) => i.asNumber()))
  if (isFinite(floorPrice)) {
    await Promise.all(
      tradeActions.map(async (action, index) => {
        const maxSize = await universe.getMaxTradeSize(action, floorPrice)
        const liq = (await action.liquidity()) / 2 / inputTokenPrice
        maxInputs[index] = Math.min(maxSize.asNumber(), liq)
      })
    )
  } else if (tradeActions.length > 1) {
    await Promise.all(
      tradeActions.map(async (action, index) => {
        const liq = (await action.liquidity()) / 2 / inputTokenPrice
        maxInputs[index] = liq
      })
    )
  }
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

  const gasPrice = universe.gasPrice
  const gasToken = universe.nativeToken

  const evaluteAction = async (
    state: {
      input: number
      output: number
      index: number
      maxInput: number
      action: BaseAction
    },
    inputQty: number,
    totalInputValue: number,
    totalOutput: number,
    totalGasBefore: bigint
  ) => {
    const input = inputToken.from(inputQty)

    const output = await state.action.quote([input]).catch((e) => {
      return state.action.outputToken.map((i) => i.zero)
    })

    const gas =
      totalGasBefore + (state.input === 0 ? state.action.gasEstimate() : 0n)
    const txFee = gasPrice * gas
    const gasFeeUSD = gasToken.from(txFee).asNumber() * gasTokenPrice
    const outputQty = output[0].asNumber()
    const additionalOutput = outputQty - state.output
    const outputValue = (additionalOutput + totalOutput) * outputTokenPrice
    const price = outputValue / (totalInputValue + gasFeeUSD)
    return {
      price,
      inputQty,
      outputQty,
      gas,
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
    for (const s of state) {
      if (s.input * inputTokenPrice < 0.001) {
        s.input = 0
      }
    }
    const eligible = state.filter((i) => i.input < i.maxInput)

    if (eligible.length === 0) {
      return
    }

    const currentTotalInput = state.reduce((l, r) => l + r.input, 0)
    const currentTotalOutput = state.reduce((l, r) => l + r.output, 0)

    const currentTotalGas = state.reduce(
      (l, r) => l + (r.input !== 0 ? r.action.gasEstimate() : 0n),
      0n
    )
    const results = await Promise.all(
      state
        .filter((i) => i.input < i.maxInput)
        .map(async (state) => {
          const additionalInput =
            Math.min(state.maxInput, state.input + onePart) - state.input

          const actionInput = state.input + additionalInput
          const res = await evaluteAction(
            state,
            actionInput,
            (currentTotalInput + additionalInput) * inputTokenPrice,
            currentTotalOutput,
            currentTotalGas
          )
          return {
            result: res,
            newInput: actionInput,
            state,
          }
        })
    )
    // Pick the best one in terms of output pr inputput - gas
    results.sort((l, r) => r.result.price - l.result.price)
    const best = results[0]
    best.state.input = Math.min(best.newInput, best.state.maxInput)
    best.state.output = best.result.outputQty
  }
  for (let i = 0; i < parts; i++) {
    await step()
  }
  for (const s of state) {
    if (s.input * inputTokenPrice < 0.01) {
      s.input = 0
    }
  }
  const totalGas = state
    .filter((i) => i.input !== 0)
    .reduce((l, r) => l + r.action.gasEstimate(), 0n)
  const totalGasFee = gasToken.from(totalGas).asNumber() * gasTokenPrice
  const totalInputSpent = state.reduce((l, r) => l + r.input, 0)
  const totalOutput = state.reduce((l, r) => l + r.output, 0)

  let unspentQty = inputQty - totalInputSpent
  if (unspentQty * outputTokenPrice < 0.01) {
    unspentQty = 0
  }

  // If less than 5% is unspent, add it to the first action
  if (totalInputSpent > unspentQty * 95) {
    state[0].input += unspentQty
    unspentQty = 0
  }

  return {
    inputs: state.map((i) => i.input),
    unspent: unspentQty,
    output: totalOutput,
    outputs: state.map((i) => i.output),
    input: totalInputSpent,
    price:
      (totalInputSpent * inputTokenPrice + totalGasFee) /
      (totalOutput * outputTokenPrice),
  }
}
export type OptimisedTrade = Awaited<ReturnType<typeof optimiseTrades>>
