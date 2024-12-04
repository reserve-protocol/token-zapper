import { Universe } from '../Universe'
import { BaseAction } from '../action/Action'
import { TokenQuantity } from '../entities/Token'

export const optimiseTrades = async (
  universe: Universe,
  input: TokenQuantity,
  tradeActions: BaseAction[],
  floorPrice: number = Infinity,
  parts: number = 10
) => {
  const inputToken = input.token
  const outputToken = tradeActions[0].outputToken[0]

  const maxInputs = tradeActions.map((i) => Infinity)
  if (isFinite(floorPrice)) {
    await Promise.all(
      tradeActions.map(async (action, index) => {
        const maxSize = await universe.getMaxTradeSize(action, floorPrice)

        console.log(`${action}: Max input for action ${maxSize.asNumber()} / ${floorPrice}`)
        maxInputs[index] = maxSize.asNumber()
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
  const [gasTokenPrice, inputTokenPrice, outputTokenPrice] = await Promise.all([
    universe.nativeToken.price,
    inputToken.price,
    outputToken.price,
  ]).then((prices) => prices.map((i) => i.asNumber()))
  const evaluteAction = async (
    action: BaseAction,
    inputQty: number,
    inputValue: number
  ) => {
    const input = inputToken.from(inputQty)
    const gas = action.gasEstimate()
    const txFee = gasPrice * gas
    const gasFeeUSD = gasToken.from(txFee).asNumber() * gasTokenPrice

    const output = await action.quote([input])
    const outputQty = output[0].asNumber()
    const outputValue = outputQty * outputTokenPrice
    const price = outputValue / (inputValue + gasFeeUSD)
    return {
      price,
      inputQty,
      inputValue: inputValue + gasFeeUSD,
      outputQty,
      outputValue: outputValue - gasFeeUSD,
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

    const results = await Promise.all(
      state
        .filter((i) => i.input < i.maxInput)
        .map(async (state) => {
          const newInput = Math.min(state.maxInput, state.input + onePart)
          return {
            result: await evaluteAction(
              state.action,
              newInput,
              newInput * inputTokenPrice
            ),
            newInput,
            state,
          }
        })
    )
    // Pick the best one in terms of output pr inputput - gas
    results.sort((l, r) => r.result.price - l.result.price)
    const best = results[0]
    // console.log(`${best.state.action}: Best`)
    // console.log(state.map((i) => i.input).join(', '))
    best.state.input = best.newInput
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
