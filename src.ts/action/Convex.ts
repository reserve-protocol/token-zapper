import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Approval } from '../base/Approval'

import { Planner, Value } from '../tx-gen/Planner'
import { IBooster__factory } from '../contracts'

abstract class ConvexBase extends Action('Convex') {
  abstract get actionName(): string

  toString(): string {
    return `Convex.${this.actionName}(${this.inputToken.join(
      ','
    )} => ${this.outputToken.join(',')}))`
  }
}

export class ConvexDepositAction extends ConvexBase {
  public get actionName(): string {
    return 'deposit'
  }

  async plan(planner: Planner, inputs: Value[]) {
    const lib = this.gen.Contract.createContract(
      IBooster__factory.connect(
        this.boosterAddress.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(this.pid, inputs[0], false), this.toString())

    return null
  }

  public get returnsOutput(): boolean {
    return false
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.cvxToken.from(amountsIn.amount)]
  }

  gasEstimate() {
    return BigInt(250000n)
  }

  get outputSlippage() {
    return 0n
  }

  constructor(
    readonly universe: Universe,
    readonly underlying: Token,
    public readonly cvxToken: Token,
    readonly boosterAddress: Address,
    readonly pid: number
  ) {
    super(
      cvxToken.address,
      [underlying],
      [cvxToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(underlying, boosterAddress)]
    )
  }
}

type ConvexConfig = {
  boosterAddress: string
  pids: number[]
}

export const setupConvex = async (universe: Universe, config: ConvexConfig) => {
  const convexBooster = IBooster__factory.connect(
    config.boosterAddress,
    universe.provider
  )

  for (const pid of config.pids) {
    const info = await convexBooster.poolInfo(pid)

    const lpToken = await universe.getToken(Address.from(info.lptoken))
    const cvxToken = await universe.getToken(Address.from(info.token))

    const depositAction = new ConvexDepositAction(
      universe,
      lpToken,
      cvxToken,
      Address.from(config.boosterAddress),
      pid
    )

    universe.addSingleTokenPriceSource({
      token: cvxToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)
        if (lpPrice == null) {
          throw Error(
            `Failed to price ${cvxToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }
        return lpPrice
      },
    })

    universe.addAction(depositAction)
  }
}

// export class ConvexDepositAndStake extends Action('Convex') {
//   async plan(
//     planner: Planner,
//     inputs: Value[],
//     destination: Address
//   ): Promise<Value[]> {
//     const lib = this.gen.Contract.createContract(
//       ConvexStakingWrapper__factory.connect(
//         this.convexPool.stakedConvexDepositToken.address.address,
//         this.universe.provider
//       )
//     )
//     planner.add(
//       lib.deposit(inputs[0], destination.address),
//       'ConvexDepositAndStake.deposit'
//     )
//     return [inputs[0]]
//   }
//   toString(): string {
//     return `ConvexDepositAndStake(${this.convexPool})`
//   }
//   async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     return [amountIn.into(this.outputToken[0])]
//   }
//   gasEstimate(): bigint {
//     return 250000n
//   }
//   constructor(readonly universe: Universe, readonly convexPool: ConvexPool) {
//     super(
//       convexPool.stakedConvexDepositToken.address,
//       [convexPool.curveLPToken],
//       [convexPool.stakedConvexDepositToken],
//       InteractionConvention.ApprovalRequired,
//       DestinationOptions.Callee,
//       [
//         new Approval(
//           convexPool.curveLPToken,
//           convexPool.stakedConvexDepositToken.address
//         ),
//       ]
//     )
//   }
// }

// export class ConvexUnstakeAndWithdraw extends Action('Convex') {
//   public get outputSlippage(): bigint {
//     return 0n
//   }
//   async plan(
//     planner: Planner,
//     [input]: Value[],
//     _: Address,
//     [predicted]: TokenQuantity[]
//   ): Promise<Value[]> {
//     const lib = this.gen.Contract.createContract(
//       ConvexStakingWrapper__factory.connect(
//         this.convexPool.stakedConvexDepositToken.address.address,
//         this.universe.provider
//       )
//     )
//     planner.add(lib.withdrawAndUnwrap(input ?? predicted.amount))

//     return this.outputBalanceOf(this.universe, planner)
//   }
//   toString(): string {
//     return `ConvexUnstakeAndWithdraw(${this.convexPool})`
//   }
//   async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
//     return [amountIn.into(this.outputToken[0])]
//   }
//   gasEstimate(): bigint {
//     return 250000n
//   }
//   constructor(readonly universe: Universe, readonly convexPool: ConvexPool) {
//     super(
//       convexPool.stakedConvexDepositToken.address,
//       [convexPool.stakedConvexDepositToken],
//       [convexPool.curveLPToken],
//       InteractionConvention.None,
//       DestinationOptions.Callee,
//       []
//     )
//   }
// }

// /**
//  * Sets up all the edges associated with a convex pool.
//  * This also sets up the minting of the convex deposit token, despite this token not being that useful.
//  * @param universe
//  * @param stakedConvexToken The staked convex lp token
//  */
// export const setupConvexEdges = async (
//   universe: Universe,
//   stakedConvexToken: Token,
//   convexBoosterAddress: Address
// ) => {
//   const convexBooster = IBooster__factory.connect(
//     convexBoosterAddress.address,
//     universe.provider
//   )
//   const stkCVXTokenInst = ConvexStakingWrapper__factory.connect(
//     stakedConvexToken.address.address,
//     universe.provider
//   )

//   const curveLPToken = await universe.getToken(
//     Address.from(await stkCVXTokenInst.curveToken())
//   )
//   const convexDepositToken = await universe.getToken(
//     Address.from(await stkCVXTokenInst.convexToken())
//   )
//   const convexPoolId = await stkCVXTokenInst.callStatic.convexPoolId()

//   const info = await convexBooster.poolInfo(convexPoolId.toBigInt())

//   const crvRewards = Address.from(info.crvRewards)

//   const convexPool = new ConvexPool(
//     convexBoosterAddress,
//     convexPoolId.toBigInt(),
//     curveLPToken,
//     convexDepositToken,
//     stakedConvexToken,
//     crvRewards
//   )

//   // Add one step actions that are actually used for the most part
//   const depositAndStakeAction = new ConvexDepositAndStake(universe, convexPool)
//   const unstakeAndWithdrawAction = new ConvexUnstakeAndWithdraw(
//     universe,
//     convexPool
//   )
//   universe.defineMintable(depositAndStakeAction, unstakeAndWithdrawAction)

//   return {
//     pool: convexPool,
//     depositAndStakeAction,
//     unstakeAndWithdrawAction,
//   }
// }
