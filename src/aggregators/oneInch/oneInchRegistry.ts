
import { type Address } from '../../base/Address'
import { type Token, type TokenQuantity } from '../../entities/Token'
import { Api, type QuoteResponseDto, type SwapResponseDto } from './eth/oneInchEthApi'

export type OneInchQuoteResponse = QuoteResponseDto
export type OneInchSwapResponse = SwapResponseDto
export interface IOneInchRouter {
  quote: (inputToken: TokenQuantity, outputToken: Token) => Promise<OneInchQuoteResponse>
  swap: (fromAddress: Address, toAddress: Address, inputToken: TokenQuantity, outputToken: Token, slippage: number) => Promise<OneInchSwapResponse>
}

export const createEthereumRouter = (): IOneInchRouter => {
  const api = new Api({ baseUrl: 'https://api.1inch.io' })

  return {
    quote: async (inputQrt, output) => {
      const out = await api.v50.exchangeControllerGetQuote({

        fromTokenAddress: inputQrt.token.address.address,
        toTokenAddress: output.address.address,
        amount: inputQrt.amount.toString()
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
        disableEstimate: true
      }
      const out = await api.v50.exchangeControllerGetSwap(params)

      return out.data
    }
  }
}
