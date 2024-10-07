"use strict";
// import { Address } from '../base/Address'
// import { type Token, type TokenQuantity } from '../entities/Token'
// import { type Universe } from '../Universe'
// import { Action, DestinationOptions, InteractionConvention } from './Action'
Object.defineProperty(exports, "__esModule", { value: true });
// import { Approval } from '../base/Approval'
// import { Planner, Value } from '../tx-gen/Planner'
// // OneInch actions should only be dynamically generated by the Searcher and not be added to the exchange-graph
// export class OneInchAction extends Action('1inch') {
//   async plan(
//     planner: Planner,
//     _: Value[],
//     destination: Address
//   ): Promise<Value[]> {
//     throw new Error('Method not implemented.')
//   }
//   gasEstimate() {
//     return BigInt(this.actionQuote.tx.gas)
//   }
//   toString() {
//     return `OneInch(path=[...])`
//   }
//   private readonly outputQty: TokenQuantity
//   async quote(_: TokenQuantity[]): Promise<TokenQuantity[]> {
//     return [this.outputQty]
//   }
//   private constructor(
//     readonly universe: Universe,
//     inputToken: Token,
//     outputToken: Token,
//     private readonly actionQuote: OneInchSwapResponse,
//     slippagePercent: number
//   ) {
//     super(
//       Address.fromHexString(actionQuote.tx.to),
//       [inputToken],
//       [outputToken],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Recipient,
//       [new Approval(inputToken, Address.fromHexString(actionQuote.tx.to))]
//     )
//     this.outputQty = outputToken
//       .fromBigInt(BigInt(this.actionQuote.toAmount))
//       .mul(outputToken.fromDecimal((100 - slippagePercent) / 100))
//   }
//   static createAction(
//     universe: Universe,
//     input: Token,
//     output: Token,
//     quote: OneInchSwapResponse,
//     slippagePercent: number
//   ) {
//     return new OneInchAction(universe, input, output, quote, slippagePercent)
//   }
// }
//# sourceMappingURL=OneInch.js.map