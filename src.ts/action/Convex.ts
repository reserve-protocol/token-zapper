import { Action, DestinationOptions, InteractionConvention } from './Action'
import { Universe } from '../Universe'
import { Address } from '../base/Address'
import { Token, TokenQuantity } from '../entities/Token'
import { Approval } from '../base/Approval'

import { Planner, Value } from '../tx-gen/Planner'
import { IBooster__factory, IRewardStaking__factory } from '../contracts'

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

export class ConvexStakeAction extends ConvexBase {
  public get actionName(): string {
    return 'stake'
  }

  async plan(planner: Planner, inputs: Value[], destination: Address) {
    const lib = this.gen.Contract.createContract(
      IRewardStaking__factory.connect(
        this.crvRewards.address,
        this.universe.provider
      )
    )
    planner.add(lib.stakeFor(destination.address, inputs[0]), this.toString())

    return null
  }

  public get returnsOutput(): boolean {
    return false
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [this.crvToken.from(amountsIn.amount)]
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
    public readonly crvToken: Token,
    readonly crvRewards: Address
  ) {
    super(
      crvToken.address,
      [underlying],
      [crvToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Recipient,
      [new Approval(underlying, crvRewards)]
    )
  }
}

type ConvexConfig = {
  boosterAddress: string
  pidToCrvTokens: Record<number, string>
}

export const setupConvex = async (universe: Universe, config: ConvexConfig) => {
  const { boosterAddress, pidToCrvTokens } = config

  const convexBooster = IBooster__factory.connect(
    boosterAddress,
    universe.provider
  )

  for (const [pid, crvTokenAddress] of Object.entries(pidToCrvTokens)) {
    const info = await convexBooster.poolInfo(Number(pid))

    const lpToken = await universe.getToken(Address.from(info.lptoken))
    const cvxToken = await universe.getToken(Address.from(info.token))
    const crvToken = await universe.getToken(Address.from(crvTokenAddress))

    const depositAction = new ConvexDepositAction(
      universe,
      lpToken,
      cvxToken,
      Address.from(boosterAddress),
      Number(pid)
    )

    const stakeAction = new ConvexStakeAction(
      universe,
      cvxToken,
      crvToken,
      Address.from(info.crvRewards)
    )

    universe.addAction(depositAction)
    universe.addAction(stakeAction)

    // cvxToken price
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

    // crvToken price
    universe.addSingleTokenPriceSource({
      token: crvToken,
      priceFn: async () => {
        const lpPrice = await universe.fairPrice(lpToken.one)
        if (lpPrice == null) {
          throw Error(
            `Failed to price ${crvToken.symbol}: Missing price for ${lpToken.symbol}`
          )
        }
        return lpPrice
      },
    })
  }
}
