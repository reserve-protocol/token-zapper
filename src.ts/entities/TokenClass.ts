import { Universe } from '../Universe'
import { Token } from './Token'

export enum TokenType {
  // stETH, wstETH, Reth, sfrxeth, ETHx etc.
  ETHLST = 'LST',

  Asset = 'Asset',

  // any lp token
  LPToken = 'LPToken',

  // RTokens
  RToken = 'RToken',

  // Other tokens we should be able to mint
  OtherMintable = 'OtherMintable',
}

export const isMintable = (
  tokenType: TokenType
): tokenType is
  | TokenType.RToken
  | TokenType.LPToken
  | TokenType.ETHLST
  | TokenType.OtherMintable => {
  return (
    tokenType === TokenType.OtherMintable ||
    tokenType === TokenType.RToken ||
    tokenType === TokenType.LPToken ||
    tokenType === TokenType.ETHLST
  )
}

export const isUnwrappable = (
  tokenType: TokenType
): tokenType is
  | TokenType.RToken
  | TokenType.LPToken
  | TokenType.OtherMintable => {
  return (
    tokenType === TokenType.OtherMintable ||
    tokenType === TokenType.RToken ||
    tokenType === TokenType.LPToken
  )
}

export const isAsset = (tokenType: TokenType): tokenType is TokenType.Asset => {
  return tokenType === TokenType.Asset
}

export enum ActionType {
  Trade = 'Trade',
  Wrap = 'Wrap',
  Unwrap = 'Unwrap', // Unwrap to underlying
}

interface TokenInfo {
  token: Token
  type: TokenType
  tokenClass: Token
  underlyingToken: Token
  underlyingTokens: Token[]
}

export const getTokenInfo = async (
  token: Token,
  universe: Universe
): Promise<TokenInfo> => {
  const tokenType = await universe.tokenType.get(token)
  const tokenClass =
    tokenType === TokenType.ETHLST
      ? universe.wrappedNativeToken
      : await universe.tokenClass.get(token)
  const underlyingToken =
    tokenType === TokenType.ETHLST
      ? universe.wrappedNativeToken
      : await universe.underlyingToken.get(token)

  const underlyingTokens: Token[] = [underlyingToken]
  if (tokenType === TokenType.LPToken) {
    underlyingTokens.push(...universe.lpTokens.get(token)!.poolTokens)
  }
  if (tokenType === TokenType.RToken) {
    underlyingTokens.push(...universe.getRTokenDeployment(token).basket)
  }
  return {
    token,
    type: tokenType,
    tokenClass,
    underlyingToken,
    underlyingTokens,
  }
}

const isStandardToken = (info: TokenInfo): boolean => {
  return !(info.type === TokenType.RToken || info.type === TokenType.ETHLST)
}

class Step {
  constructor(public readonly type: ActionType, public readonly dest: Token) {}

  toString() {
    return `${this.type} ${this.dest.symbol}`
  }
}

export class OverallRoutePlan {
  constructor(
    public readonly input: Token,
    public readonly steps: Step[] = []
  ) {}
  public trade(token: Token) {
    this.steps.push(new Step(ActionType.Trade, token))
    return this
  }
  public wrap(token: Token) {
    this.steps.push(new Step(ActionType.Wrap, token))
    return this
  }
  public unwrap(token: Token) {
    this.steps.push(new Step(ActionType.Unwrap, token))
    return this
  }
  toString() {
    return (
      `${this.input} => ` + this.steps.map((i) => i.toString()).join(' -> ')
    )
  }
}

/**
 * General rules:
 *  - if tokenClasses are different, we usually need to put a trade between input and output
 *  - if from is an unwrappable token and we need to do a trade, we should unwrap first
 *  -
 */
export const routeActions = async (
  universe: Universe,
  inputTokens: Token[],
  tokenTo: Token
): Promise<OverallRoutePlan[]> => {
  if (inputTokens.includes(tokenTo)) {
    return []
  }

  const actions: OverallRoutePlan[] = []
  for (const tokenFrom of inputTokens) {
    const option = () => {
      const out = new OverallRoutePlan(tokenFrom)
      actions.push(out)
      return out
    }
    const tokenFromInfo = await getTokenInfo(tokenFrom, universe)
    const tokenToInfo = await getTokenInfo(tokenTo, universe)

    if (
      (inputTokens.includes(universe.nativeToken) ||
        inputTokens.includes(universe.wrappedNativeToken)) &&
      tokenToInfo.type === TokenType.ETHLST
    ) {
      option().wrap(tokenTo)
      return actions
    }

    if (tokenFromInfo.type === TokenType.ETHLST) {
      if (tokenToInfo.type === TokenType.ETHLST) {
      } else if (isMintable(tokenToInfo.type)) {
        if (tokenToInfo.underlyingTokens.includes(tokenFrom)) {
          option().wrap(tokenTo)
        }
      }
    } else if (tokenFromInfo.type === TokenType.RToken) {
      if (tokenToInfo.type === TokenType.RToken) {
        option().trade(tokenTo)
        if (tokenFromInfo.tokenClass !== tokenToInfo.tokenClass) {
          option()
            .unwrap(tokenFromInfo.underlyingToken)
            .trade(tokenToInfo.tokenClass)
            .wrap(tokenTo)
        } else {
          option().unwrap(tokenFromInfo.underlyingToken).wrap(tokenTo)
        }
      } else if (isMintable(tokenToInfo.type)) {
        if (tokenToInfo.underlyingTokens.includes(tokenFromInfo.token)) {
          option().wrap(tokenTo)
        }
      }
    } else if (isMintable(tokenToInfo.type)) {
      if (tokenFromInfo.underlyingToken === tokenTo) {
        actions.length = 0
        option().unwrap(tokenTo)
        return actions
      } else {
        const mainOption = option()
        let fromInfo = tokenFromInfo
        if (
          isUnwrappable(tokenFromInfo.type) &&
          fromInfo.token !== tokenToInfo.underlyingToken
        ) {
          if (
            tokenToInfo.type !== TokenType.RToken ||
            (tokenToInfo.type === TokenType.RToken &&
              !universe
                .getRTokenDeployment(tokenToInfo.token)
                .basket.includes(fromInfo.token))
          ) {
            mainOption.unwrap(tokenFromInfo.underlyingToken)
            fromInfo = await getTokenInfo(
              tokenFromInfo.underlyingToken,
              universe
            )
          }
        }
        if (tokenToInfo.type === TokenType.ETHLST) {
          if (
            fromInfo.token !== universe.wrappedNativeToken &&
            tokenFrom !== universe.nativeToken
          ) {
            mainOption.trade(universe.wrappedNativeToken)
          } else {
            option().wrap(tokenTo)
          }
        }
        if (
          tokenToInfo.type === TokenType.LPToken ||
          tokenToInfo.type === TokenType.RToken
        ) {
          for (const underlying of tokenToInfo.underlyingTokens) {
            if (underlying === fromInfo.token) {
              option().wrap(tokenTo)
            } else {
              const routes = await routeActions(
                universe,
                [fromInfo.token],
                underlying
              )
              for (const route of routes) {
                route.wrap(tokenTo)
                actions.push(route)
              }
            }
          }
        } else if (isAsset(fromInfo.type)) {
          if (isStandardToken(tokenToInfo)) {
            if (tokenFromInfo.underlyingToken !== tokenToInfo.underlyingToken) {
              mainOption.trade(tokenToInfo.underlyingToken)
            }
          } else {
            if (tokenToInfo.tokenClass !== fromInfo.tokenClass) {
              mainOption.trade(tokenToInfo.tokenClass)
            }
          }
        } else {
          if (tokenToInfo.tokenClass !== fromInfo.tokenClass) {
            mainOption.trade(tokenToInfo.tokenClass)
          }
        }
        mainOption.wrap(tokenTo)
      }
    } else if (isAsset(tokenToInfo.type) && isAsset(tokenFromInfo.type)) {
      option().trade(tokenTo)
    } else {
      console.log(
        `unhandled: from: ${tokenFromInfo.token} to: ${tokenToInfo.token}`
      )
    }
  }
  return actions
}
