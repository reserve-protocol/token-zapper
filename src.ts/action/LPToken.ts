import { type Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { type ContractCall } from '../base/ContractCall'
import { type Token, type TokenQuantity } from '../entities/Token'
import { Action, DestinationOptions, InteractionConvention } from './Action'

export class LPToken {
  public readonly mintAction: Action
  public readonly burnAction: Action
  constructor(
    public readonly token: Token,
    public readonly poolTokens: Token[],
    public readonly burn: (amount: TokenQuantity) => Promise<TokenQuantity[]>,
    public readonly mint: (amountsIn: TokenQuantity[]) => Promise<TokenQuantity>
  ) {
    this.mintAction = new LPTokenMint(this)
    this.burnAction = new LPTokenBurn(this)
  }

  toString() {
    return `LPToken(lp=${this.token},tokens=${this.poolTokens.join(',')})`
  }
}

export class LPTokenMint extends Action {
  toString() {
    return `MintLP(${this.lpToken})`
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [await this.lpToken.mint(amountsIn)]
  }
  gasEstimate(): bigint {
    return 200_000n
  }
  encode(
    amountsIn: TokenQuantity[],
    destination: Address,
    bytes?: Buffer | undefined
  ): Promise<ContractCall> {
    throw new Error('Method not implemented.')
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
  toString() {
    return `BurnLP(${this.lpToken})`
  }
  async quote(amountsIn: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await this.lpToken.burn(amountsIn[0])
  }
  gasEstimate(): bigint {
    return 200_000n
  }
  encode(
    amountsIn: TokenQuantity[],
    destination: Address,
    bytes?: Buffer | undefined
  ): Promise<ContractCall> {
    throw new Error('Method not implemented.')
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
