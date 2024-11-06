import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Approval } from '../base/Approval'

import { Planner, Value } from '../tx-gen/Planner'
import { ConvexStakingWrapper__factory, IBooster__factory } from '../contracts'

class ConvexPool {
  constructor(
    public readonly convexBooster: Address,
    public readonly convexPoolId: bigint,
    public readonly curveLPToken: Token,
    public readonly convexDepositToken: Token,
    public readonly stakedConvexDepositToken: Token,
    public readonly rewardsAddress: Address
  ) {}

  toString() {
    return `ConvexPool(id=${this.convexPoolId})`
  }
}

export class ConvexDepositAndStake extends Action('Convex') {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      ConvexStakingWrapper__factory.connect(
        this.convexPool.stakedConvexDepositToken.address.address,
        this.universe.provider
      )
    )
    planner.add(
      lib.deposit(inputs[0], destination.address),
      'ConvexDepositAndStake.deposit'
    )
    return [inputs[0]]
  }
  toString(): string {
    return `ConvexDepositAndStake(${this.convexPool})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountIn.into(this.outputToken[0])]
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(readonly universe: Universe, readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.curveLPToken],
      [convexPool.stakedConvexDepositToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [
        new Approval(
          convexPool.curveLPToken,
          convexPool.stakedConvexDepositToken.address
        ),
      ]
    )
  }
}

export class ConvexUnstakeAndWithdraw extends Action('Convex') {
  public get outputSlippage(): bigint {
    return 0n
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [predicted]: TokenQuantity[]
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      ConvexStakingWrapper__factory.connect(
        this.convexPool.stakedConvexDepositToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.withdrawAndUnwrap(input ?? predicted.amount))

    return this.outputBalanceOf(this.universe, planner)
  }
  toString(): string {
    return `ConvexUnstakeAndWithdraw(${this.convexPool})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountIn.into(this.outputToken[0])]
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(readonly universe: Universe, readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.stakedConvexDepositToken],
      [convexPool.curveLPToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

/**
 * Sets up all the edges associated with a convex pool.
 * This also sets up the minting of the convex deposit token, despite this token not being that useful.
 * @param universe
 * @param stakedConvexToken The staked convex lp token
 */
export const setupConvexEdges = async (
  universe: Universe,
  stakedConvexToken: Token,
  convexBoosterAddress: Address
) => {
  const convexBooster = IBooster__factory.connect(
    convexBoosterAddress.address,
    universe.provider
  )
  const stkCVXTokenInst = ConvexStakingWrapper__factory.connect(
    stakedConvexToken.address.address,
    universe.provider
  )

  const curveLPToken = await universe.getToken(
    Address.from(await stkCVXTokenInst.curveToken())
  )
  const convexDepositToken = await universe.getToken(
    Address.from(await stkCVXTokenInst.convexToken())
  )
  const convexPoolId = await stkCVXTokenInst.callStatic.convexPoolId()

  const info = await convexBooster.poolInfo(convexPoolId.toBigInt())

  const crvRewards = Address.from(info.crvRewards)

  const convexPool = new ConvexPool(
    convexBoosterAddress,
    convexPoolId.toBigInt(),
    curveLPToken,
    convexDepositToken,
    stakedConvexToken,
    crvRewards
  )

  // Add one step actions that are actually used for the most part
  const depositAndStakeAction = new ConvexDepositAndStake(universe, convexPool)
  const unstakeAndWithdrawAction = new ConvexUnstakeAndWithdraw(
    universe,
    convexPool
  )
  universe.defineMintable(depositAndStakeAction, unstakeAndWithdrawAction)

  return {
    pool: convexPool,
    depositAndStakeAction,
    unstakeAndWithdrawAction,
  }
}
