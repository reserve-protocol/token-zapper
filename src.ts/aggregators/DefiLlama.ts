// import { type Universe } from '../Universe'
// import {
//   Action,
//   DestinationOptions,
//   InteractionConvention,
// } from '../action/Action'
// import { Address } from '../base/Address'
// import { Approval } from '../base/Approval'

// import { GAS_TOKEN_ADDRESS, ZERO } from '../base/constants'
// import { parseHexStringIntoBuffer } from '../base/utils'
// import { ZapperExecutor__factory } from '../contracts/factories/contracts/Zapper.sol/ZapperExecutor__factory'
// import { type Token, type TokenQuantity } from '../entities/Token'
// import { SwapPlan } from '../searcher/Swap'
// import { Planner, Value } from '../tx-gen/Planner'
// import { DexRouter } from './DexAggregator'

// const CHAIN_SLUG: Record<number, string> = {
//   1: 'ethereum',
//   8453: 'base',
// }

// const tokenToDefillameAddress = (token: Token) => {
//   if (token.address.address === GAS_TOKEN_ADDRESS) {
//     // Remap to address 0
//     return ZERO
//   }
//   return token.address.address.toLowerCase()
// }

// const tokenToRequest = (universe: Universe, token: Token, chainId: number) => {
//   const address = tokenToDefillameAddress(token)
//   const out = {
//     volume24h: 145686469.40093708,
//     address: address,
//     chainId: chainId,
//     name: token.name,
//     symbol: token.symbol,
//     decimals: token.decimals,
//     label: token.symbol,
//     value: address,
//     logoURI:
//       'https://token-icons.llamao.fi/icons/tokens/1/' + address + '?h=20&w=20',
//     logoURI2: 'https://token-icons.llamao.fi/icons/tokens/1/' + address,
//     tags: ['tokens'],
//     geckoId: null,
//     wrappedNative: universe.config.addresses.wrappedNative === token.address,
//   }

//   if (out.wrappedNative === false) {
//     delete (out as any).wrappedNative
//   }

//   return out
// }

// export const protocol = {
//   Matcha: 'Matcha/0x',
//   Hashflow: 'Hashflow',
// } as const

// export type PROTOCOLS = {
//   [K in keyof typeof protocol]: (typeof protocol)[K]
// }[keyof typeof protocol]

// interface Quote {
//   amountReturned: string
//   amountIn: string
//   estimatedGas: string
//   tokenApprovalAddress: string
//   rawQuote: {
//     chainId: number
//     price: string
//     guaranteedPrice: string
//     estimatedPriceImpact: string
//     to: string
//     data: string
//     value: string
//     gas: string
//     estimatedGas: string
//     from: string
//     gasPrice: string
//     protocolFee: string
//     minimumProtocolFee: string
//     buyTokenAddress: string
//     sellTokenAddress: string
//     buyAmount: string
//     sellAmount: string
//     allowanceTarget: string
//     decodedUniqueId: string
//     sellTokenToEthRate: string
//     buyTokenToEthRate: string
//     grossPrice: string
//     grossBuyAmount: string
//     grossSellAmount: string
//     gasLimit: string
//   }
// }

// export const fetchQuote = async (
//   protocol: PROTOCOLS,
//   universe: Universe,
//   {
//     userAddress,
//     destination,
//     quantity: qty,
//     output,
//     chainId,
//     slippage,
//   }: {
//     userAddress: Address
//     destination: Address
//     quantity: TokenQuantity
//     output: Token
//     chainId: number
//     slippage: number
//   }
// ) => {
//   if (CHAIN_SLUG[chainId] == null) {
//     throw new Error(`Chain ${chainId} not supported`)
//   }
//   const feeData = await universe.provider.getFeeData()
//   const request = {
//     gasPriceData: {
//       formatted: {
//         gasPrice: feeData.gasPrice?.toString(),
//         maxFeePerGas: feeData.maxFeePerGas?.toString(),
//         maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
//       },
//       ...feeData,
//     },
//     userAddress: userAddress.address.toLowerCase(),
//     fromToken: tokenToRequest(universe, qty.token, chainId),
//     toToken: tokenToRequest(universe, output, chainId),
//     slippage: slippage / 10000,
//     amount: qty.format(),
//     isPrivacyEnabled: false,
//     amountOut: 0,
//   }

//   const url = `https://swap-api.defillama.com/dexAggregatorQuote?protocol=${protocol}&chain=${
//     CHAIN_SLUG[chainId]
//   }&from=${qty.token.address.address.toLowerCase()}&to=${output.address.address.toLowerCase()}&amount=${qty.amount.toString()}&api_key=nsr_UYWxuvj1hOCgHxJhDEKZ0g30c4Be3I5fOMBtFAA`
//   const response = await fetch(url, {
//     method: 'POST',
//     credentials: 'omit',
//     headers: {
//       'User-Agent':
//         'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
//       Accept: '*/*',
//       'Accept-Language': 'en-GB,en;q=0.5',
//       'Content-Type': 'text/plain;charset=UTF-8',
//       'Sec-Fetch-Dest': 'empty',
//       'Sec-Fetch-Mode': 'cors',
//       'Sec-Fetch-Site': 'same-site',
//     },
//     referrer: 'https://swap.defillama.com/',
//     body: JSON.stringify(request),
//     mode: 'cors',
//   })
//   console.log(await response.text())
//   const p = response.json()
//   const json = await p
//   console.log(json)
//   return json as Quote
// }

// class DefillamaAction extends Action('Defillama') {
//   async plan(planner: Planner): Promise<Value[]> {
//     const zapperLib = this.gen.Contract.createContract(
//       ZapperExecutor__factory.connect(
//         this.universe.config.addresses.executorAddress.address,
//         this.universe.provider
//       )
//     )
//     planner.add(
//       zapperLib.rawCall(
//         this.request.rawQuote.to,
//         this.request.rawQuote.value,
//         this.request.rawQuote.data
//       )
//     )
//     const out = this.genUtils.erc20.balanceOf(
//       this.universe,
//       planner,
//       this.outputToken[0],
//       this.universe.config.addresses.executorAddress
//     )
//     return [out!]
//   }
//   public outputQuantity: TokenQuantity[] = []
//   constructor(
//     public readonly request: Quote,
//     public readonly quantityIn: TokenQuantity,
//     output: Token,
//     public readonly universe: Universe,
//     public readonly slippage: number,
//     public readonly externalProtocol: PROTOCOLS
//   ) {
//     super(
//       Address.from(request.tokenApprovalAddress),
//       [quantityIn.token],
//       [output],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Callee,
//       [
//         new Approval(
//           quantityIn.token,
//           Address.from(request.tokenApprovalAddress)
//         ),
//       ]
//     )

//     const amount = BigInt(this.request.amountReturned)
//     const minOut = amount - (amount / 10000n) * BigInt(this.slippage)
//     const out = this.outputToken[0].from(minOut)
//     this.outputQuantity = [out]
//   }
//   toString(): string {
//     return `DefiLama[${this.externalProtocol}](${this.quantityIn} => ${this.outputQuantity}})`
//   }
//   async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
//     return this.outputQuantity
//   }
//   gasEstimate(): bigint {
//     return BigInt(this.request.rawQuote.estimatedGas)
//   }
// }

// export const createDefillama = (
//   aggregatorName: string,
//   universe: Universe,
//   slippage: number,
//   protocol: PROTOCOLS
// ) => {
//   return new DexRouter(
//     aggregatorName,
//     async (_, destination, input, output, __) => {
//       const req = await fetchQuote(protocol, universe, {
//         userAddress: universe.config.addresses.zapperAddress,
//         destination,
//         quantity: input,
//         output,
//         chainId: universe.chainId,
//         slippage,
//       })
//       return await new SwapPlan(universe, [
//         new DefillamaAction(req, input, output, universe, slippage, protocol),
//       ]).quote([input], destination)
//     }
//   )
// }
