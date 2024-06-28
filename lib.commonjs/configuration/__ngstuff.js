"use strict";
// type EdgeQuoteFunction = (
//     self: BaseAction,
//     input: TokenQuantity
//   ) => Promise<TokenQuantity>
Object.defineProperty(exports, "__esModule", { value: true });
//   enum ActionType {
//     MINT,
//     BURN,
//     SWAP,
//     WRAP,
//   }
//   type OUT = ReturnType<typeof Action>
//   type ActionDef = {
//     plan: (
//       self: InstanceType<OUT>,
//       planner: gen.Planner,
//       input: gen.Value,
//       destination: Address,
//       predictedInput: TokenQuantity,
//       outputNotUsed?: boolean
//     ) => Promise<Value>
//     quote?: EdgeQuoteFunction
//     gasEstimate: () => bigint
//     actionName: string
//   }
//   type ActionOptions = {
//     address?: Address
//     approvalAddress?: Address
//     actionType: ActionType
//     interactionType?: InteractionConvention
//     recipient?: DestinationOptions
//   }
//   const defineProtocol = async <const PROTO extends string>(
//     universe: Universe,
//     protocolName: PROTO,
//     protocolOptions: {
//       address?: Address
//       approvalAddress?: Address
//       interactionType?: InteractionConvention
//       recipient?: DestinationOptions
//     }
//   ) => {
//     abstract class ProtocolAction extends Action(protocolName) {
//       get universe() {
//         return universe
//       }
//     }
//     const defineAction = async (
//       definition: ActionDef,
//       options: ActionOptions
//     ) => {
//       const getOpt = (
//         opt: 'approvalAddress' | 'address' | 'interactionType' | 'recipient',
//         required: boolean
//       ) => {
//         let val = options[opt] ?? protocolOptions[opt]
//         if (opt === 'approvalAddress') {
//           val =
//             options[opt] ??
//             protocolOptions.approvalAddress ??
//             protocolOptions.address
//         }
//         if (val == null && required) {
//           throw new Error(`No ${opt} defined`)
//         }
//         return val
//       }
//       const interactionType = getOpt(
//         'interactionType',
//         true
//       ) as InteractionConvention
//       const recipient = getOpt('recipient', true) as DestinationOptions
//       const address = getOpt('address', false) as Address | null
//       const approvalAddress = getOpt(
//         'approvalAddress',
//         interactionType === InteractionConvention.ApprovalRequired
//       ) as Address
//       class DerivedAction extends ProtocolAction {
//         constructor(input: Token, output: Token) {
//           super(
//             address ?? Address.from(ethers.constants.AddressZero),
//             [input],
//             [output],
//             interactionType,
//             recipient,
//             interactionType == InteractionConvention.ApprovalRequired
//               ? [new Approval(input, approvalAddress)]
//               : []
//           )
//         }
//         toString(): string {
//           return `${this.inputToken[0]}.[${protocolName}.${definition.actionName}].${this.outputToken[0]}`
//         }
//         async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//           if (definition.quote == null) {
//             return [amountsIn.into(this.outputToken[0])]
//           }
//           return await definition
//             .quote(this, amountsIn)
//             .then((amountsOut) => [amountsOut.into(this.outputToken[0])])
//         }
//         gasEstimate(): bigint {
//           return definition.gasEstimate()
//         }
//         async plan(
//           planner: Planner,
//           inputs: Value[],
//           destination: Address,
//           predictedInputs: TokenQuantity[],
//           outputNotUsed?: boolean | undefined
//         ): Promise<Value[]> {
//           return [
//             await definition.plan(
//               this,
//               planner,
//               inputs[0],
//               destination,
//               predictedInputs[0],
//               outputNotUsed
//             ),
//           ]
//         }
//       }
//       return DerivedAction
//     }
//     return {
//       defineAction,
//       defineMint: async (
//         def: Pick<ActionDef, 'plan' | 'quote' | 'gasEstimate'> & {
//           actionName?: string
//         },
//         options: Omit<ActionOptions, 'actionType'>
//       ) => {
//         return await defineAction(
//           {
//             ...def,
//             actionName: def.actionName ?? 'mint',
//           },
//           {
//             ...options,
//             actionType: ActionType.MINT,
//           }
//         )
//       },
//     }
//   }
//   const setupAaveV3 = async (universe: ArbitrumUniverse, wrappers: Token[]) => {
//     const poolInst = IPool__factory.connect(
//       PROTOCOL_CONFIGS.aaveV3.pool,
//       universe.provider
//     )
//     const loadTokens = async (universe: Universe) => {
//       const reserveTokens = await Promise.all(
//         (
//           await poolInst.getReservesList()
//         ).map(async (i) => universe.getToken(Address.from(i)))
//       )
//       return await Promise.all(
//         reserveTokens.map(async (token) => {
//           const reserveData = await poolInst.getReserveData(token.address.address)
//           const { aTokenAddress, variableDebtTokenAddress, ...data } = reserveData
//           const [aToken, variableDebtToken] = await Promise.all([
//             universe.getToken(Address.from(aTokenAddress)),
//             universe.getToken(Address.from(variableDebtTokenAddress)),
//           ])
//           const aTokenInst = IAToken__factory.connect(
//             aTokenAddress,
//             universe.provider
//           )
//           return {
//             reserveData: data,
//             reserveToken: token,
//             aToken: aToken,
//             aTokenInst,
//             variableDebtToken: variableDebtToken,
//             intoAssets: async (shares: TokenQuantity) => {
//               const factor = await poolInst.getReserveNormalizedIncome(
//                 token.address.address
//               )
//               return token.from(rayMul(shares.amount, factor.toBigInt()))
//             },
//           }
//         })
//       )
//     }
//     const reserves = await loadTokens(universe)
//     const reserveTokenToReserve = new Map<Token, (typeof reserves)[0]>(
//       reserves.map((r) => [r.reserveToken, r])
//     )
//     const aaveV3 = await defineProtocol(universe, 'aaveV3', {
//       address: Address.from(poolInst.address),
//     })
//     const txGen = {
//       poolInst: gen.Contract.createContract(poolInst, gen.CommandFlags.CALL),
//     }
//     const aaveV3Actions = {
//       SupplyAction: await aaveV3.defineMint(
//         {
//           plan: async (self, planner, input, destination) => {
//             planner.add(
//               txGen.poolInst.supply(
//                 self.inputToken[0].address.address,
//                 input,
//                 destination.address,
//                 0
//               )
//             )
//             return input
//           },
//           gasEstimate: () => 250000n,
//         },
//         {
//           interactionType: InteractionConvention.ApprovalRequired,
//           recipient: DestinationOptions.Recipient,
//         }
//       ),
//       WithdrawAction: await aaveV3.defineMint(
//         {
//           plan: async (self, planner, input, destination) => {
//             planner.add(
//               txGen.poolInst.withdraw(
//                 self.outputToken[0].address.address,
//                 input,
//                 destination.address
//               )
//             )
//             return input
//           },
//           quote: async (self, input) => {
//             const reserve = reserveTokenToReserve.get(self.outputToken[0])
//             if (reserve == null) {
//               throw new Error('No reserve found')
//             }
//             return await reserve.intoAssets(input)
//           },
//           actionName: 'withdraw',
//           gasEstimate: () => 250000n,
//         },
//         {
//           interactionType: InteractionConvention.None,
//           recipient: DestinationOptions.Recipient,
//         }
//       ),
//     }
//     const aaveV3ActionsStatic = {
//       SupplyAction: await aaveV3.defineMint(
//         {
//           plan: async (self, planner, input, destination) => {
//             planner.add(
//               txGen.poolInst.supply(
//                 self.inputToken[0].address.address,
//                 input,
//                 destination.address,
//                 0
//               )
//             )
//             return input
//           },
//           actionName: 'deposit',
//           gasEstimate: () => 250000n,
//         },
//         {
//           interactionType: InteractionConvention.ApprovalRequired,
//           recipient: DestinationOptions.Recipient,
//         }
//       ),
//       WithdrawAction: await aaveV3.defineMint(
//         {
//           plan: async (self, planner, input, destination) => {
//             planner.add(
//               txGen.poolInst.withdraw(
//                 self.outputToken[0].address.address,
//                 input,
//                 destination.address
//               )
//             )
//             return input
//           },
//           quote: async (self, input) => {
//             const reserve = reserveTokenToReserve.get(self.outputToken[0])
//             if (reserve == null) {
//               throw new Error('No reserve found')
//             }
//             return await reserve.intoAssets(input)
//           },
//           actionName: 'withdraw',
//           gasEstimate: () => 250000n,
//         },
//         {
//           interactionType: InteractionConvention.None,
//           recipient: DestinationOptions.Recipient,
//         }
//       ),
//     }
//     for (const res of reserves) {
//       const { reserveToken, aToken } = res
//       const supplyAction = new aaveV3Actions.SupplyAction(reserveToken, aToken)
//       const withdrawAction = new aaveV3Actions.WithdrawAction(
//         aToken,
//         reserveToken
//       )
//       universe.defineMintable(supplyAction, withdrawAction)
//     }
//     for (const wrapper of wrappers) {
//       const wrapperAddr = IStaticAV3TokenLM__factory.connect(
//         wrapper.address.address,
//         universe.provider
//       )
//     }
//   }
//# sourceMappingURL=__ngstuff.js.map