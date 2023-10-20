import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { GAS_TOKEN_ADDRESS, ZERO } from '../base/constants'
import { parseHexStringIntoBuffer } from '../base/utils'
import { Token, TokenQuantity } from '../entities/Token'
import { SwapPlan } from '../searcher/Swap'
import { DexAggregator } from './DexAggregator'

const CHAIN_SLUG: Record<number, string> = {
  1: 'ethereum',
  8453: 'base',
}

const tokenToDefillameAddress = (token: Token) => {
  if (token.address.address === GAS_TOKEN_ADDRESS) {
    // Remap to address 0
    return ZERO
  }
  return token.address.address
}

const tokenToRequest = (token: Token, chainId: number) => {
  const address = tokenToDefillameAddress(token)
  return {
    address: address,
    chainId: chainId,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    label: token.symbol,
    value: address,
    geckoId: null,
  }
}

interface Quote {
  amountReturned: string
  amountIn: string
  estimatedGas: string
  tokenApprovalAddress: string
  rawQuote: {
    chainId: number
    price: string
    guaranteedPrice: string
    estimatedPriceImpact: string
    to: string
    data: string
    value: string
    gas: string
    estimatedGas: string
    from: string
    gasPrice: string
    protocolFee: string
    minimumProtocolFee: string
    buyTokenAddress: string
    sellTokenAddress: string
    buyAmount: string
    sellAmount: string
    allowanceTarget: string
    decodedUniqueId: string
    sellTokenToEthRate: string
    buyTokenToEthRate: string
    grossPrice: string
    grossBuyAmount: string
    grossSellAmount: string
    gasLimit: string
  }
}

export const fetchQuote = async ({
  userAddress,
  destination,
  quantity: qty,
  output,
  chainId,
  slippage,
}: {
  userAddress: Address
  destination: Address
  quantity: TokenQuantity
  output: Token
  chainId: number
  slippage: number
}) => {
  if (CHAIN_SLUG[chainId] == null) {
    throw new Error(`Chain ${chainId} not supported`)
  }
  const request = {
    userAddress: userAddress.address,
    fromToken: tokenToRequest(qty.token, chainId),
    toToken: tokenToRequest(output, chainId),
    slippage,
    amount: qty.format(),
    isPrivacyEnabled: false,
    amountOut: 0,
  }

  const BASE = 'https://swap-api.defillama.com/dexAggregatorQuote'
  const response = await fetch(
    `${BASE}?api_key=zT82BQ38E5unVRDGswzgUzfM2yyaQBK8mFBrzTzX6s&protocol=Matcha/0x&chain=${
      CHAIN_SLUG[chainId]
    }&from=${
      userAddress.address
    }&to=${destination}&amount=${qty.amount.toString()}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
    }
  )
  const json = await response.json()
  return json as Quote
}

class DefillamaAction extends Action {
  constructor(
    public readonly request: Quote,
    public readonly quantityIn: TokenQuantity,
    output: Token,
    public readonly universe: Universe,
    public readonly slippage: number
  ) {
    super(
      Address.from(request.tokenApprovalAddress),
      [quantityIn.token],
      [output],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [
        new Approval(
          quantityIn.token,
          Address.from(request.tokenApprovalAddress)
        ),
      ]
    )
  }
  async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
    const amount = BigInt(this.request.amountReturned)
    const minOut = amount - (amount / 10000n) * BigInt(this.slippage)
    const out = this.output[0].from(minOut)
    return [out]
  }
  gasEstimate(): bigint {
    return BigInt(this.request.rawQuote.estimatedGas)
  }
  async encode(inputs: TokenQuantity[], __: Address): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(this.request.rawQuote.data),
      Address.from(this.request.rawQuote.to),
      0n,
      this.gasEstimate(),
      `Kyberswap(${this.address}) (${inputs.join(',')}) -> (${await this.quote(
        inputs
      )})`
    )
  }
}

export const createDefillama = (
  aggregatorName: string,
  universe: Universe,
  slippage: number
) => {
  return new DexAggregator(
    aggregatorName,
    async (_, destination, input, output, __) => {
      const req = await fetchQuote({
        userAddress: universe.config.addresses.zapperAddress,
        destination,
        quantity: input,
        output,
        chainId: universe.chainId,
        slippage,
      })
      return await new SwapPlan(universe, [
        new DefillamaAction(req, input, output, universe, slippage),
      ]).quote([input], destination)
    }
  )
}
