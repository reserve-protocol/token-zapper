"use strict";
// import { ParaSwap, NetworkID, APIError, Transaction } from "paraswap";
// import { DexRouter } from "../DexAggregator";
// import { SwapPlan } from "../../searcher/Swap";
// import { Universe } from "../..";
// import { OptimalRate } from "paraswap-core";
// import { ParaswapAction } from "../../action/ParaswapAction";
// const API_URL = "https://apiv5.paraswap.io";
// export const createParaswap = (
//   aggregatorName: string,
//   universe: Universe
// ) => {
//   const client = new ParaSwap(
//     universe.chainId as NetworkID,
//     API_URL,
//     universe.provider
//   )
//   return new DexRouter(
//     aggregatorName,
//     async (_, destination, input, output, slippage) => {
//       let rate = await client.getRate(
//         input.token.address.address,
//         output.address.address,
//         input.amount.toString(),
//         undefined,
//         undefined,
//         {
//           maxImpact: slippage,
//         }
//       )
//       if ((rate as APIError).message != null) {
//         throw new Error(rate.toString())
//       }
//       rate = rate as OptimalRate
//       const tx = await client.buildTx(
//         input.token.address.address,
//         output.address.address,
//         input.amount.toString(),
//         rate.destAmount.toString(),
//         rate,
//         destination.address
//       )
//       if ((tx as APIError).message != null) {
//         throw new Error(rate.toString())
//       }
//       return await new SwapPlan(universe, [
//         ParaswapAction.createAction(
//           universe,
//           input,
//           output.from(rate.destAmount),
//           tx as Transaction,
//         ),
//       ]).quote([input], destination)
//     })
// }
//# sourceMappingURL=Paraswap.js.map