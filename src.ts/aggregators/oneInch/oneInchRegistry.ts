import { OneInchAction } from '../../action/OneInch'
import { type Address } from '../../base/Address'
import { type Token, type TokenQuantity } from '../../entities/Token'
import { SwapPlan } from '../../searcher/Swap'
import { Universe } from '../../Universe'
import { DexAggregator } from '../DexAggregator'
import {
  Api,
  type QuoteResponseDto,
  type SwapResponseDto,
} from './eth/oneInchEthApi'

export type OneInchQuoteResponse = QuoteResponseDto
export type OneInchSwapResponse = SwapResponseDto
export interface IOneInchRouter {
  quote: (
    inputToken: TokenQuantity,
    outputToken: Token
  ) => Promise<OneInchQuoteResponse>
  swap: (
    fromAddress: Address,
    toAddress: Address,
    inputToken: TokenQuantity,
    outputToken: Token,
    slippage: number
  ) => Promise<OneInchSwapResponse>
}

export const createEthereumRouter = (baseUrl: string): IOneInchRouter => {
  const api = new Api({ baseUrl })

  return {
    quote: async (inputQrt, output) => {
      const out = await api.v50.exchangeControllerGetQuote({
        fromTokenAddress: inputQrt.token.address.address,
        toTokenAddress: output.address.address,
        amount: inputQrt.amount.toString(),
      })

      return out.data
    },
    swap: async (fromAddress, toAddress, inputQty, output, slippage) => {
      const params = {
        fromAddress: fromAddress.address,
        fromTokenAddress: inputQty.token.address.address,
        toTokenAddress: output.address.address,
        destReceiver: toAddress.address,
        slippage,
        amount: inputQty.amount.toString(),
        disableEstimate: true,
      }
      const out = await api.v50.exchangeControllerGetSwap(params)

      return out.data
    },
  }
}

export const initOneInch = (universe: Universe, baseUrl: string) => {
  const oneInchRouter = createEthereumRouter(baseUrl)
  return new DexAggregator(
    '1inch',
    async (user, destination, input, output, slippage) => {
      const swap = await oneInchRouter.swap(
        user,
        destination,
        input,
        output,
        slippage
      )

      return await new SwapPlan(universe, [
        OneInchAction.createAction(universe, input.token, output, swap),
      ]).quote([input], destination)
    }
  )
}
