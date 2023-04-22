// import { Approval } from '../base'
// import curve from '@curvefi/api'
// import { PoolTemplate } from '@curvefi/api/lib/pools'
// import { ExternalProvider, JsonRpcProvider } from '@ethersproject/providers'
// class CurvePool {
//   [Symbol.toStringTag] = 'CurvePool'
//   constructor(
//     readonly address: Address,
//     readonly tokens: Token[],
//     readonly underlyingTokens: Token[],
//     readonly meta: PoolTemplate
//   ) {}
//   toString() {
//     let out = `CurvePool(name=${this.meta.name},tokens=${this.tokens.join(
//       ', '
//     )}`
//     if (this.underlyingTokens.length > 0) {
//       out += `,underlying=${this.underlyingTokens.join(', ')}`
//     }
//     return out + ')'
//   }
// }
export const loadCurvePools = async (universe) => {
    // const p = universe.provider as JsonRpcProvider
    // await curve.init(
    //   'Web3',
    //   {
    //     externalProvider: {
    //       sendAsync: (
    //         request: { method: string; params?: Array<any> },
    //         callback: (error: any, response: any) => void
    //       ) => {
    //         p.send(request.method, request.params ?? [])
    //           .then((r) => callback(null, r))
    //           .catch((e) => callback(e, null))
    //       },
    //       send: (
    //         request: { method: string; params?: Array<any> },
    //         callback: (error: any, response: any) => void
    //       ) => {
    //         p.send(request.method, request.params ?? [])
    //           .then((r) => callback(null, r))
    //           .catch((e) => callback(e, null))
    //       },
    //       request: async (request: {
    //         method: string
    //         params?: Array<any>
    //       }): Promise<any> => {
    //         return await p.send(request.method, request.params ?? [])
    //       },
    //     } as ExternalProvider,
    //   },
    //   {
    //     chainId: universe.chainId,
    //   }
    // ) // In this case JsonRpc url, privateKey, fee data and chainId will be specified automatically
    // await curve.cryptoFactory.fetchPools(true)
    // await curve.factory.fetchPools(true)
    // const poolNames = curve
    //   .getPoolList()
    //   .concat(curve.factory.getPoolList())
    //   .concat(curve.cryptoFactory.getPoolList())
    // const pools = poolNames
    //   .map((name) => {
    //     return curve.getPool(name)
    //   })
    //   .filter(
    //     (pool) =>
    //       pool.underlyingDecimals.every((i) => i !== 0) &&
    //       pool.wrappedDecimals.every((i) => i !== 0)
    //   )
    // const tokenAddresses = [
    //   ...new Set(
    //     pools
    //       .map((pool) =>
    //         pool.wrappedCoinAddresses
    //           .concat(pool.underlyingCoinAddresses)
    //           .map((a) => Address.from(a))
    //       )
    //       .flat()
    //   ),
    // ]
    // const badTokens = new Set<string>()
    // await Promise.all(
    //   tokenAddresses.map(async (address) =>
    //     universe.getToken(address).catch((e) => {
    //       badTokens.add(address.address.toString())
    //     })
    //   )
    // )
    // const curvePools = await Promise.all(
    //   pools
    //     .filter((pool) => {
    //       for (const addr of pool.wrappedCoinAddresses) {
    //         if (!universe.tokens.has(Address.from(addr))) {
    //           return false
    //         }
    //       }
    //       for (const addr of pool.underlyingCoinAddresses) {
    //         if (!universe.tokens.has(Address.from(addr))) {
    //           return false
    //         }
    //       }
    //       return true
    //     })
    //     .map(async (pool) => {
    //       const tokens = pool.wrappedCoinAddresses.map(
    //         (a) => universe.tokens.get(Address.from(a))!
    //       )
    //       const underlying = pool.underlyingCoinAddresses.map(
    //         (a) => universe.tokens.get(Address.from(a))!
    //       )
    //       return new CurvePool(
    //         Address.from(pool.address),
    //         tokens,
    //         underlying,
    //         pool
    //       )
    //     })
    // )
    // return curvePools
    return [];
};
// export const addCurvePoolEdges = async (
//   universe: Universe,
//   pools: CurvePool[]
// ) => {
//   // for (const pool of pools) {
//   //   let missingTok = false
//   //   for (const token of pool.tokens) {
//   //     if (!universe.tokens.has(token.address)) {
//   //       missingTok = true
//   //       break
//   //     }
//   //   }
//   //   for (const token of pool.underlyingTokens) {
//   //     if (!universe.tokens.has(token.address)) {
//   //       missingTok = true
//   //       break
//   //     }
//   //   }
//   //   if (missingTok) {
//   //     continue
//   //   }
//   //   for (let aTokenIdx = 0; aTokenIdx < pool.tokens.length; aTokenIdx++) {
//   //     for (
//   //       let bTokenIdx = aTokenIdx + 1;
//   //       bTokenIdx < pool.tokens.length;
//   //       bTokenIdx++
//   //     ) {
//   //       const edgeI_J = new CurveSwap(
//   //         pool,
//   //         aTokenIdx,
//   //         pool.tokens[aTokenIdx],
//   //         bTokenIdx,
//   //         pool.tokens[bTokenIdx],
//   //         false
//   //       )
//   //       const edgeJ_I = new CurveSwap(
//   //         pool,
//   //         bTokenIdx,
//   //         pool.tokens[bTokenIdx],
//   //         aTokenIdx,
//   //         pool.tokens[aTokenIdx],
//   //         false
//   //       )
//   //       universe.addAction(edgeI_J)
//   //       universe.addAction(edgeJ_I)
//   //     }
//   //   }
//   //   for (
//   //     let aTokenIdx = 0;
//   //     aTokenIdx < pool.underlyingTokens.length;
//   //     aTokenIdx++
//   //   ) {
//   //     for (
//   //       let bTokenIdx = aTokenIdx + 1;
//   //       bTokenIdx < pool.underlyingTokens.length;
//   //       bTokenIdx++
//   //     ) {
//   //       const edgeI_J = new CurveSwap(
//   //         pool,
//   //         aTokenIdx,
//   //         pool.underlyingTokens[aTokenIdx],
//   //         bTokenIdx,
//   //         pool.underlyingTokens[bTokenIdx],
//   //         true
//   //       )
//   //       const edgeJ_I = new CurveSwap(
//   //         pool,
//   //         bTokenIdx,
//   //         pool.underlyingTokens[bTokenIdx],
//   //         aTokenIdx,
//   //         pool.underlyingTokens[aTokenIdx],
//   //         true
//   //       )
//   //       universe.addAction(edgeI_J)
//   //       universe.addAction(edgeJ_I)
//   //     }
//   //   }
//   // }
// }
// export class CurveSwap extends Action {
//   gasEstimate() {
//     return BigInt(250000n)
//   }
//   async encode(
//     [amountsIn]: TokenQuantity[],
//     destination: Address
//   ): Promise<ContractCall> {
//     throw new Error('not implemented')
//     // if (this.exchangeUnderlying) {
//     //   curve.router.getBestRouteAndOutput
//     //   await this.pool.meta.wallet.underlyingCoinBalances()
//     //   const out = await this.pool.meta.swapExpected(
//     //     this.tokenInIdx,
//     //     this.tokenOutIdx,
//     //     amountsIn.amount.toString()
//     //   )
//     //   throw new Error('not implemented')
//     // } else {
//     //   await this.pool.meta.wallet.wrappedCoinBalances()
//     //   const out = await this.pool.meta.swapWrappedExpected(
//     //     this.tokenInIdx,
//     //     this.tokenOutIdx,
//     //     amountsIn.amount.toString()
//     //   )
//     //   throw new Error('not implemented')
//     // }
//   }
//   /**
//    * @node V2Actions can quote in both directions!
//    * @returns
//    */
//   async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     try {
//       if (this.exchangeUnderlying) {
//         await this.pool.meta.wallet.underlyingCoinBalances()
//         const out = await this.pool.meta.swapExpected(
//           this.tokenInIdx,
//           this.tokenOutIdx,
//           amountsIn.format()
//         )
//         return [this.output[0].from(out)]
//       } else {
//         await this.pool.meta.wallet.wrappedCoinBalances()
//         const out = await this.pool.meta.swapWrappedExpected(
//           this.tokenInIdx,
//           this.tokenOutIdx,
//           amountsIn.format()
//         )
//         return [this.output[0].from(out)]
//       }
//     } catch (e) {
//       return [this.output[0].zero]
//     }
//   }
//   constructor(
//     readonly pool: CurvePool,
//     readonly tokenInIdx: number,
//     tokenIn: Token,
//     readonly tokenOutIdx: number,
//     tokenOut: Token,
//     readonly exchangeUnderlying: boolean
//   ) {
//     super(
//       pool.address,
//       [tokenIn],
//       [tokenOut],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Callee,
//       [
//         new Approval(
//           !exchangeUnderlying
//             ? pool.tokens[tokenInIdx]
//             : pool.underlyingTokens[tokenInIdx],
//           pool.address
//         ),
//       ]
//     )
//   }
//   toString(): string {
//     return `Crv(${this.input[0]}.${this.pool.meta.name}.${this.output[0]})`
//   }
// }
//# sourceMappingURL=Curve.js.map