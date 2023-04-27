import { Action, DestinationOptions, InteractionConvention } from '.'
import { Universe } from '..'
import {
  Address,
  Approval,
  ContractCall,
  parseHexStringIntoBuffer,
} from '../base'
import {
  IBooster__factory,
  IConvexBaseRewardsPool__factory,
  IConvexWrapper__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities'

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

const boosterInterface = IBooster__factory.createInterface()
const baseRewardsPoolInterface =
  IConvexBaseRewardsPool__factory.createInterface()

export class ConvexDepositAndStake extends Action {
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
        boosterInterface.encodeFunctionData('deposit', [
          this.convexPool.convexPoolId,
          amountsIn.amount,
          true,
        ])
      ),
      destination,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} on Convex and stake on ${this.convexPool.rewardsAddress}`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.curveLPToken],
      [convexPool.stakedConvexDepositToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(convexPool.curveLPToken, convexPool.convexBooster)]
    )
  }
}

export class ConvexDeposit extends Action {
  toString(): string {
    return `ConvexDeposit(${this.convexPool})`
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
        boosterInterface.encodeFunctionData('deposit', [
          this.convexPool.convexPoolId,
          amountsIn.amount,
          false,
        ])
      ),
      this.convexPool.convexBooster,
      0n,
      this.gasEstimate(),
      `Deposit ${amountsIn} on Convex`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
    super(
      convexPool.convexDepositToken.address,
      [convexPool.curveLPToken],
      [convexPool.convexDepositToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(convexPool.curveLPToken, convexPool.convexBooster)]
    )
  }
}

export class ConvexStake extends Action {
  toString(): string {
    return `ConvexStake(${this.convexPool})`
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
        baseRewardsPoolInterface.encodeFunctionData('stakeFor', [
          destination.address,
          amountsIn.amount,
        ])
      ),
      this.convexPool.rewardsAddress,
      0n,
      this.gasEstimate(),
      `Stake ${amountsIn} on ${this.convexPool.rewardsAddress}, sending ${this.output[0]} to ${destination}`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.convexDepositToken],
      [convexPool.stakedConvexDepositToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(convexPool.convexDepositToken, convexPool.rewardsAddress)]
    )
  }
}

export class ConvexUnstake extends Action {
  toString(): string {
    return `ConvexUnstake(${this.convexPool})`
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
        baseRewardsPoolInterface.encodeFunctionData('withdraw', [
          amountsIn.amount,
          false,
        ])
      ),
      this.convexPool.rewardsAddress,
      0n,
      this.gasEstimate(),
      `Unstake ${amountsIn} on ${this.convexPool.rewardsAddress}, returning deposit token (${this.convexPool.convexDepositToken}) to caller`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.stakedConvexDepositToken],
      [convexPool.convexDepositToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class ConvexWithdraw extends Action {
  toString(): string {
    return `ConvexWithdraw(${this.convexPool})`
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
        boosterInterface.encodeFunctionData('withdraw', [
          this.convexPool.convexPoolId,
          amountsIn.amount,
        ])
      ),
      this.convexPool.convexBooster,
      0n,
      this.gasEstimate(),
      `Withdraw ${amountsIn} from Convex returning curve LP token (${this.convexPool.curveLPToken}) to caller`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
    super(
      convexPool.stakedConvexDepositToken.address,
      [convexPool.convexDepositToken],
      [convexPool.curveLPToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

export class ConvexUnstakeAndWithdraw extends Action {
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
        baseRewardsPoolInterface.encodeFunctionData('withdrawAndUnwrap', [
          amountsIn.amount,
          false,
        ])
      ),
      this.convexPool.rewardsAddress,
      0n,
      this.gasEstimate(),
      `Unstake ${amountsIn} from rewards pool (${this.convexPool.rewardsAddress}), and withdraw from Convex returning ${this.output[0]} to caller`
    )
  }
  constructor(readonly convexPool: ConvexPool) {
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
  stakedConvexToken: Token
) => {
  const convexBooster = IBooster__factory.connect(
    universe.config.addresses.convex.address,
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
    universe.config.addresses.convex,
    convexPoolId.toBigInt(),
    curveLPToken,
    convexDepositToken,
    stakedConvexToken,
    crvRewards
  )

  // Define canonical way mint deposit token
  const depositAction = new ConvexDeposit(convexPool)
  const withdrawAction = new ConvexWithdraw(convexPool)
  universe.defineMintable(depositAction, withdrawAction)

  // Define canonical way to mint staked token
  const stakeAction = new ConvexStake(convexPool)
  const unstakeAction = new ConvexUnstake(convexPool)
  universe.defineMintable(stakeAction, unstakeAction)

  // Add one step actions that are actually used for the most part
  const depositAndStakeAction = new ConvexDepositAndStake(convexPool)
  const unstakeAndWithdrawAction = new ConvexUnstakeAndWithdraw(convexPool)
  universe.addAction(unstakeAndWithdrawAction)
  universe.addAction(depositAndStakeAction)

  return {
    pool: convexPool,
    depositAction,
    withdrawAction,
    stakeAction,
    unstakeAction,
    depositAndStakeAction,
    unstakeAndWithdrawAction,
  }
}
