import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Planner, Value } from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class LPToken {
  public readonly mintAction: Action
  public readonly burnAction: Action
  constructor(
    public readonly token: Token,
    public readonly poolTokens: Token[],
    public readonly burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>,
    public readonly mint: (
      amountsIn: TokenQuantity[]
    ) => Promise<TokenQuantity>,
    public readonly planBurn?: (
      planner: Planner,
      inputs: Value[],
      destination: Address
    ) => Promise<Value[]>
  ) {
    this.mintAction = new LPTokenMint(this)
    this.burnAction = new LPTokenBurn(this)
  }

  toString() {
    return `LPToken(lp=${this.token},tokens=${this.poolTokens.join(',')})`
  }
}

export class LPTokenMint extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    throw new Error(
      `Method not implemented. For ${this.input.join(
        ', '
      )} -> ${this.output.join(', ')}`
    )
  }
  toString() {
    return `MintLP(${this.lpToken})`
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.lpToken.mint(amountsIn)]
  }
  gasEstimate(): bigint {
    return 200_000n
  }
  
  constructor(public readonly lpToken: LPToken) {
    super(
      lpToken.token.address,
      lpToken.poolTokens,
      [lpToken.token],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      lpToken.poolTokens.map(
        (token) => new Approval(token, lpToken.token.address)
      )
    )
  }
}
export class LPTokenBurn extends Action {
  async plan(
    planner: Planner,
    inputs: Value[],
    destination: Address
  ): Promise<Value[]> {
    if (this.lpToken.planBurn) {
      return await this.lpToken.planBurn(planner, inputs, destination)
    }
    throw new Error(
      `Method not implemented. For ${this.input.join(
        ', '
      )} -> ${this.output.join(', ')}`
    )
  }
  toString() {
    return `BurnLP(${this.lpToken})`
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await this.lpToken.burn(amountsIn[0])
  }
  gasEstimate(): bigint {
    return 200_000n
  }

  constructor(public readonly lpToken: LPToken) {
    super(
      lpToken.token.address,
      [lpToken.token],
      lpToken.poolTokens,
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}
