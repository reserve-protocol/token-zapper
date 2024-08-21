import { ParamType } from '@ethersproject/abi'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
  isMultiChoiceEdge,
} from '../action/Action'
import { CurveStableSwapNGPool } from '../action/CurveStableSwapNG'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import {
  ConvexStakingWrapper as ConvexStakingWrapperEthers,
  ConvexStakingWrapper__factory,
  IBooster,
  IBooster__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import {
  BasketTokenSourcingRuleApplication,
  PostTradeAction,
} from '../searcher/BasketTokenSourcingRules'
import { UniverseWithCommonBaseTokens } from '../searcher/UniverseWithERC20GasTokenDefined'
import {
  Contract,
  FunctionCall,
  Planner,
  Value,
  encodeArg,
} from '../tx-gen/Planner'
import { CurveIntegration, CurvePool } from './setupCurve'

type ConvexStakingWrapperAddresss = string
type ConvexStakingWrapperName = string
interface IConvexConfig {
  boosterAddress: string
  wrappers: {
    [tokenName: ConvexStakingWrapperName]: ConvexStakingWrapperAddresss
  }
}

abstract class BaseConvexStakingWrapper extends Action('ConvexStakingWrapper') {
  toString() {
    return `ConvexStakingWrapper.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
  public get supportsDynamicInput() {
    return true
  }
  public get oneUsePrZap() {
    return false
  }
  public get returnsOutput() {
    return false
  }
  get outputSlippage() {
    return 0n
  }

  async quote(amountsIn: TokenQuantity[]) {
    return amountsIn.map((tok, i) => tok.into(this.outputToken[i]))
  }
  abstract planAction(input: Value): FunctionCall
  abstract get actionName(): string

  async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPredicted]: TokenQuantity[]
  ): Promise<Value[] | null> {
    planner.add(
      this.planAction(
        input ?? encodeArg(inputPredicted.amount, ParamType.from('uint256'))
      )
    )
    return null
  }
}

class CurveLpToWrapper extends BaseConvexStakingWrapper {
  planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weiroll.wrapperToken.deposit(
      input,
      this.universe.execAddress.address
    )
  }
  get actionName(): string {
    return 'deposit'
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(
    readonly universe: UniverseWithCommonBaseTokens,
    readonly wrapper: ConvexStakingWrapper
  ) {
    super(
      wrapper.wrapperToken.address,
      [wrapper.curveToken],
      [wrapper.wrapperToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(wrapper.curveToken, wrapper.wrapperToken.address)]
    )
  }
}

class ConvexDepositToWrapper extends BaseConvexStakingWrapper {
  planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weiroll.wrapperToken.stake(
      input,
      this.universe.execAddress.address
    )
  }
  get actionName(): string {
    return 'stake'
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(
    readonly universe: UniverseWithCommonBaseTokens,
    readonly wrapper: ConvexStakingWrapper
  ) {
    super(
      wrapper.wrapperToken.address,
      [wrapper.convexToken],
      [wrapper.wrapperToken],
      InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      [new Approval(wrapper.convexToken, wrapper.wrapperToken.address)]
    )
  }
}

class WrapperToCurveLp extends BaseConvexStakingWrapper {
  planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weiroll.wrapperToken.withdrawAndUnwrap(input)
  }
  get actionName(): string {
    return 'withdrawAndUnwrap'
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(
    readonly universe: UniverseWithCommonBaseTokens,
    readonly wrapper: ConvexStakingWrapper
  ) {
    super(
      wrapper.wrapperToken.address,
      [wrapper.wrapperToken],
      [wrapper.curveToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class WrapperToConvexDeposit extends BaseConvexStakingWrapper {
  planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weiroll.wrapperToken.withdraw(input)
  }
  get actionName(): string {
    return 'withdraw'
  }
  gasEstimate(): bigint {
    return 250000n
  }
  constructor(
    readonly universe: UniverseWithCommonBaseTokens,
    readonly wrapper: ConvexStakingWrapper
  ) {
    super(
      wrapper.wrapperToken.address,
      [wrapper.wrapperToken],
      [wrapper.convexToken],
      InteractionConvention.None,
      DestinationOptions.Callee,
      []
    )
  }
}

class ConvexStakingWrapper {
  toString() {
    return `ConvexStakingWrapper(${this.curvePool.lpToken}(${this.curvePool.lpToken.address}) => ${this.wrapperToken}(${this.wrapperToken.address}))`
  }
  public readonly curveLpToWrapper: CurveLpToWrapper
  public readonly convexDepositToWrapper: ConvexDepositToWrapper
  public readonly unwrapToCurveLp: WrapperToCurveLp
  public readonly unwrapToConvexDeposit: WrapperToConvexDeposit
  public get universe() {
    return this.curve.universe
  }
  private constructor(
    public readonly curve: CurveIntegration,
    public readonly wrapperToken: Token,
    public readonly curveToken: Token,
    public readonly convexToken: Token,
    public readonly convexPoolAddress: Address,
    public readonly curvePool: CurvePool | CurveStableSwapNGPool,
    public readonly convexPoolId: number,
    public readonly contracts: {
      contracts: {
        wrapperTokenInst: ConvexStakingWrapperEthers
        boosterInst: IBooster
      }
      weiroll: {
        wrapperToken: Contract
        boosterInst: Contract
      }
    }
  ) {
    this.curveLpToWrapper = new CurveLpToWrapper(this.universe, this)
    this.convexDepositToWrapper = new ConvexDepositToWrapper(
      this.universe,
      this
    )
    this.unwrapToCurveLp = new WrapperToCurveLp(this.universe, this)
    this.unwrapToConvexDeposit = new WrapperToConvexDeposit(this.universe, this)
  }

  public async attachToUniverse() {
    const curvePool = this.curvePool
    this.universe.defineMintable(this.curveLpToWrapper, this.unwrapToCurveLp)

    // Define token sourcing rule for the curve pool

    const curveLpToken = curvePool.lpToken

    const convexDepositToken = this.convexToken

    const handlers = new Map<
      Token,
      (unit: TokenQuantity) => Promise<BasketTokenSourcingRuleApplication>
    >()

    handlers.set(curveLpToken, async (unit) =>
      BasketTokenSourcingRuleApplication.singleBranch(
        [unit.into(curveLpToken)],
        [PostTradeAction.fromAction(this.curveLpToWrapper)]
      )
    )

    handlers.set(convexDepositToken, async (unit) =>
      BasketTokenSourcingRuleApplication.singleBranch(
        [unit.into(this.convexToken)],
        [PostTradeAction.fromAction(this.convexDepositToWrapper)]
      )
    )

    for (const token of curvePool.allPoolTokens) {
      if (token == curveLpToken) {
        continue
      }

      handlers.set(token, async (unit) => {
        const edge = await this.curve.findDepositAction(token.one, curveLpToken)
        const out = await edge.quote([token.one])

        const inputQty = unit.div(out[0]).into(token)
        return BasketTokenSourcingRuleApplication.singleBranch(
          [inputQty],
          [
            PostTradeAction.fromAction(edge, true),
            PostTradeAction.fromAction(this.curveLpToWrapper, true),
          ]
        )
      })
    }

    this.universe.addSingleTokenPriceSource({
      token: this.wrapperToken,
      priceFn: async () => {
        return (
          (await this.universe.fairPrice(this.curvePool.lpToken.one)) ??
          this.universe.usd.zero
        )
      },
      priceToken: this.universe.usd,
    })

    const pickBestPrecursorToken = (toks: Token[]): Token => {
      const t = toks.find((i) => !this.universe.rTokensInfo.tokens.has(i))
      return t ?? toks[0]
    }

    this.universe.defineTokenSourcingRule(
      this.wrapperToken,
      async (token, unit) => {
        const handler = handlers.get(token)
        if (handler == null) {
          if (this.curvePool instanceof CurveStableSwapNGPool) {
            const randInput = pickBestPrecursorToken([
              ...this.curvePool.underlying,
            ])
            return await handlers.get(randInput)!(unit)
          } else {
            const randInput = pickBestPrecursorToken([
              ...this.curvePool.assetType.bestInputTokens,
            ])
            return await handlers.get(randInput)!(unit)
          }
        }
        return await handler(unit)
      }
    )

    for (const baseTok of this.curvePool.allPoolTokens) {
      try {
        if (
          !this.universe.rTokensInfo.tokens.has(baseTok) &&
          this.universe.wrappedTokens.has(baseTok)
        ) {
          continue
        }
        const act = await this.universe.createTradeEdge(curveLpToken, baseTok)
        if (isMultiChoiceEdge(act)) {
          for (const a of act.choices) {
            this.universe.addAction(a)
          }
        } else {
          this.universe.addAction(act)
        }
      } catch (e) {}
    }
  }

  public static async fromConfigAddress(
    curveIntegration: CurveIntegration,
    boosterInst: IBooster,
    {
      wrapperAddress,
      name,
    }: {
      wrapperAddress: string
      name: string
    }
  ) {
    const wrapperTokenInst = ConvexStakingWrapper__factory.connect(
      wrapperAddress,
      curveIntegration.universe.provider
    )

    const [
      wrapperToken,
      curveToken,
      convexToken,
      convexPoolId,
      convexPoolAddress,
    ] = await Promise.all([
      curveIntegration.universe.getToken(Address.from(wrapperAddress)),
      wrapperTokenInst.callStatic
        .curveToken()
        .then(Address.from)
        .then(async (a) => await curveIntegration.universe.getToken(a)),
      wrapperTokenInst.callStatic
        .convexToken()
        .then(Address.from)
        .then(async (a) => await curveIntegration.universe.getToken(a)),
      wrapperTokenInst.callStatic.convexPoolId().then(Number),
      wrapperTokenInst.callStatic.convexPool().then(Address.from),
    ])
    const poolInfo = await boosterInst.callStatic.poolInfo(convexPoolId)
    const lpToken = await curveIntegration.universe.getToken(
      Address.from(poolInfo.lptoken)
    )

    const stdPool =
      curveIntegration.curvePools.poolByLPToken.get(lpToken)! ??
      curveIntegration.curvePools.poolByPoolAddress.get(lpToken.address)!
    const ngPool =
      curveIntegration.specialCasePools.poolByLPToken.get(lpToken)! ??
      curveIntegration.specialCasePools.poolByPoolAddress.get(lpToken.address)!

    if (stdPool == null && ngPool == null) {
      throw new Error(
        `Could not find curve pool for token ${wrapperToken} ${curveToken} ${curveToken.address} ${convexPoolAddress} ${convexPoolId}`
      )
    }

    const out = new ConvexStakingWrapper(
      curveIntegration,
      wrapperToken,
      curveToken,
      convexToken,
      convexPoolAddress,
      stdPool ?? ngPool,
      convexPoolId,
      {
        contracts: {
          wrapperTokenInst: wrapperTokenInst,
          boosterInst: boosterInst,
        },
        weiroll: {
          wrapperToken: Contract.createContract(wrapperTokenInst),
          boosterInst: Contract.createContract(boosterInst),
        },
      }
    )

    await out.attachToUniverse()
    return out
  }
}

export class ReserveConvex {
  constructor(public readonly wrapperTokens: ConvexStakingWrapper[]) {}

  toString() {
    return `ReserveConvex(${this.wrapperTokens.join(', ')})`
  }
}

export const setupConvexStakingWrappers = async (
  universe: UniverseWithCommonBaseTokens,
  curveIntegration: CurveIntegration,
  config: IConvexConfig
) => {
  const boosterAddress = Address.from(config.boosterAddress)

  const boosterInst = IBooster__factory.connect(
    boosterAddress.address,
    universe.provider
  )

  // Load all the convex wrapper tokens
  const convexWrappers = await Promise.all(
    Object.entries(config.wrappers).map(
      async ([name, wrapperAddress]) =>
        await ConvexStakingWrapper.fromConfigAddress(
          curveIntegration,
          boosterInst,
          {
            name,
            wrapperAddress,
          }
        ).catch((e) => {
          console.log(e)
          return null!
        })
    )
  )

  return new ReserveConvex(
    convexWrappers.filter((x) => x != null) as ConvexStakingWrapper[]
  )
}
