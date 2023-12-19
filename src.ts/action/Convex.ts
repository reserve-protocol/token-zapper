import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Approval } from '../base/Approval'
import { ContractCall } from '../base/ContractCall'
import { parseHexStringIntoBuffer } from '../base/utils'
import { IConvexWrapper__factory } from '../contracts/factories/contracts/IConvexWrapper__factory'
import { IBooster__factory } from '../contracts/factories/contracts/IBooster__factory'
import { Planner, Value } from '../tx-gen/Planner'

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

const wrapperInterface = IConvexWrapper__factory.createInterface()

export class ConvexDepositAndStake extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      IConvexWrapper__factory.connect(
        this.convexPool.stakedConvexDepositToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.deposit(inputs[0], destination.address))
    return [inputs[0]]
  }
  toString(): string {
    return `ConvexDepositAndStake(${this.convexPool})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountIn.into(this.output[0])]
  }
  gasEstimate(): bigint {
    return 250000n
  }
  async encode(
    [amountsIn]: TokenQuantity[],
    destination: Address
  ): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        wrapperInterface.encodeFunctionData('deposit', [
          amountsIn.amount,
          destination.address,
        ])
      ),
      this.convexPool.stakedConvexDepositToken.address,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`
    )
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

export class ConvexUnstakeAndWithdraw extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    const lib = this.gen.Contract.createContract(
      IConvexWrapper__factory.connect(
        this.convexPool.stakedConvexDepositToken.address.address,
        this.universe.provider
      )
    )
    planner.add(lib.withdrawAndUnwrap(inputs[0], destination.address))
    return [inputs[0]]
  }
  toString(): string {
    return `ConvexUnstakeAndWithdraw(${this.convexPool})`
  }
  async quote([amountIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [amountIn.into(this.output[0])]
  }
  gasEstimate(): bigint {
    return 250000n
  }
  async encode([amountsIn]: TokenQuantity[]): Promise<ContractCall> {
    return new ContractCall(
      parseHexStringIntoBuffer(
        wrapperInterface.encodeFunctionData('withdrawAndUnwrap', [
          amountsIn.amount,
        ])
      ),
      this.convexPool.stakedConvexDepositToken.address,
      0n,
      this.gasEstimate(),
      `Unstake ${amountsIn} from rewards pool (${this.convexPool.rewardsAddress}), and withdraw from Convex returning ${this.output[0]} to caller`
    )
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
  convex: Address
) => {
  const convexBooster = IBooster__factory.connect(
    convex.address,
    universe.provider
  )
  const stkCVXTokenInst = IConvexWrapper__factory.connect(
    stakedConvexToken.address.address,
    universe.provider
  )

  const curveLPToken = await universe.getToken(
    Address.from(await stkCVXTokenInst.curveToken())
  )
  const convexDepositToken = await universe.getToken(
    Address.from(await stkCVXTokenInst.convexToken())
  )
  const convexPoolId = await stkCVXTokenInst.convexPoolId()

  const info = await convexBooster.poolInfo(convexPoolId.toBigInt())

  const crvRewards = Address.from(info.crvRewards)

  const convexPool = new ConvexPool(
    convex,
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
  universe.addAction(unstakeAndWithdrawAction)
  universe.addAction(depositAndStakeAction)

  return {
    pool: convexPool,
    depositAndStakeAction,
    unstakeAndWithdrawAction,
  }
}
