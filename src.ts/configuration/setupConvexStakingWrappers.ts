import { ParamType } from '@ethersproject/abi'
import { Universe } from '..'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { CurveApi } from '../action/Curve'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import {
  ConvexStakingWrapper as ConvexStakingWrapperEthers,
  ConvexStakingWrapper__factory,
  IBooster,
  IBooster__factory,
} from '../contracts'
import { Token, TokenQuantity } from '../entities/Token'
import { UniverseWithERC20GasTokenDefined } from '../searcher/UniverseWithERC20GasTokenDefined'
import {
  Contract,
  FunctionCall,
  Planner,
  Value,
  encodeArg,
} from '../tx-gen/Planner'
import { EthereumUniverse } from './ethereum'
import { CurveIntegration, CurvePool } from './setupCurve'
import {
  BasketTokenSourcingRuleApplication,
  PostTradeAction,
} from './setupCurveOnEthereum'
import { setupCurveStableSwapNGPool } from '../action/CurveStableSwapNG'
import { curve } from '../curve-js/src/curve'
import { RouterAction } from '../action/RouterAction'

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
    return 1n
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
    readonly universe: UniverseWithERC20GasTokenDefined,
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
    readonly universe: UniverseWithERC20GasTokenDefined,
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
    readonly universe: UniverseWithERC20GasTokenDefined,
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
    readonly universe: UniverseWithERC20GasTokenDefined,
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
    return `ConvexStakingWrapper(${this.curvePool.lpToken}(${this.curvePool.lpToken.token.address}) => ${this.wrapperToken}(${this.wrapperToken.address}))`
  }
  public readonly curveLpToWrapper: CurveLpToWrapper
  public readonly convexDepositToWrapper: ConvexDepositToWrapper
  public readonly unwrapToCurveLp: WrapperToCurveLp
  public readonly unwrapToConvexDeposit: WrapperToConvexDeposit
  private constructor(
    public readonly curveApi: CurveApi,
    public readonly universe: EthereumUniverse,
    public readonly wrapperToken: Token,
    public readonly curveToken: Token,
    public readonly convexToken: Token,
    public readonly convexPoolAddress: Address,
    public readonly curvePool: CurvePool,
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
    this.curveLpToWrapper = new CurveLpToWrapper(this.curvePool.universe, this)
    this.convexDepositToWrapper = new ConvexDepositToWrapper(
      this.curvePool.universe,
      this
    )
    this.unwrapToCurveLp = new WrapperToCurveLp(this.curvePool.universe, this)
    this.unwrapToConvexDeposit = new WrapperToConvexDeposit(
      this.curvePool.universe,
      this
    )
  }

  public async attachToUniverse() {
    const universe = this.universe
    const lpToken = this.curvePool.lpToken.token
    const goodInputs = new Set([
      ...this.curvePool.underlyingTokens.map((i) => i.token),
      ...this.curvePool.poolTokens.map((i) => i.token),
    ])

    console.log(`${lpToken} => ${[...goodInputs].join(', ')}`)

    if (this.curvePool.isBasePool) {
      for (const goodInput of this.curvePool.poolTokens) {
        if (goodInput.isBasePoolLpToken) {
          continue
        }
        const swapIn = await universe.integrations.curve!.createTradeEdge(
          goodInput.token,
          lpToken
        )
        const swapOut = await universe.integrations.curve!.createTradeEdge(
          lpToken,
          goodInput.token
        )
        if (swapIn) {
          universe.addAction(swapIn)
        }
        if (swapOut) {
          universe.addAction(swapOut)
        }
      }
    } else {
      for (const goodInput of this.curvePool.underlyingTokens) {
        if (goodInput.isBasePoolLpToken) {
          continue
        }
        const swapIn = await universe.integrations.curve!.createTradeEdge(
          goodInput.token,
          lpToken
        )
        const swapOut = await universe.integrations.curve!.createTradeEdge(
          lpToken,
          goodInput.token
        )
        if (swapIn) {
          universe.addAction(swapIn)
        }
        if (swapOut) {
          universe.addAction(swapOut)
        }
      }
    }

    const ngPools = new Map([
      [
        universe.commonTokens.PYUSDUSDC,
        await setupCurveStableSwapNGPool(
          universe,
          universe.commonTokens.PYUSDUSDC
        ),
      ],
    ])

    const curvePool = this.curvePool
    const curveApi = this.curveApi

    universe.defineTokenSourcingRule(
      this.wrapperToken,
      async (input, unitAmount, searcher) => {
        const curveKnowsAboutPool = this.curveApi.getPoolByLPMap.has(lpToken)

        if (input === this.curveToken) {
          return BasketTokenSourcingRuleApplication.singleBranch(
            [unitAmount.into(this.curveToken)],
            [PostTradeAction.fromAction(this.curveLpToWrapper)]
          )
        }
        if (input === this.convexToken) {
          return BasketTokenSourcingRuleApplication.singleBranch(
            [unitAmount.into(this.convexToken)],
            [PostTradeAction.fromAction(this.convexDepositToWrapper)]
          )
        }
        if (goodInputs.has(input)) {
          const possibleActions = await universe.createTradeEdge(input, lpToken)
          return BasketTokenSourcingRuleApplication.singleBranch(
            [unitAmount],
            [
              PostTradeAction.fromMultipleChoices(possibleActions),
              PostTradeAction.fromAction(this.curveLpToWrapper),
            ]
          )
        }

        let bestToken = universe.commonTokens.USDC
        if (curvePool.assetType.assetType === 'eth') {
          bestToken = universe.commonTokens.WETH
        }
        if (curvePool.assetType.assetType === 'usd') {
          bestToken = universe.commonTokens.USDC
        }
        if (curvePool.assetType.assetType === 'btc') {
          bestToken = universe.commonTokens.WBTC
        }
        if (curvePool.assetType.assetType === 'sameTypeCrypto') {
          bestToken = curvePool.poolTokens[0].token
        }

        const tradeInput = unitAmount.into(bestToken)

        if (curveKnowsAboutPool) {
          return BasketTokenSourcingRuleApplication.singleBranch(
            [tradeInput],
            [
              PostTradeAction.fromAction(
                await curveApi.createRouterEdge(
                  tradeInput,
                  bestToken,
                  universe.config.defaultInternalTradeSlippage
                ),
                true // Cause the Zapper to recalculate the inputs of the mints for the next step
              ),
              PostTradeAction.fromAction(this.mint),
            ]
          )
        } else {
          const ngPool = ngPools.get(lpToken)
          if (!ngPool) {
            throw new Error(`Could not find ng pool for ${lpToken}`)
          }

          const precursor = goodInputs.has(input) ? input : bestToken
          return BasketTokenSourcingRuleApplication.singleBranch(
            [unitAmount.into(precursor)],
            [
              PostTradeAction.fromAction(
                ngPool.getAddLiquidityAction(input),
                true // Cause the Zapper to recalculate the inputs of the mints for the next step
              ),
              PostTradeAction.fromAction(this.mint),
            ]
          )
        }
      }
    )

    universe.defineMintable(this.mint, this.burn)
  }

  public static async fromConfigAddress(
    universe: EthereumUniverse,
    curve: CurveApi,
    curveIntegration: CurveIntegration,
    boosterInst: IBooster,
    {
      wrapperAddress,
      name,
    }: {
      wrapperAddress: ConvexStakingWrapperAddresss
      name: ConvexStakingWrapperName
    }
  ) {
    const wrapperTokenInst = ConvexStakingWrapper__factory.connect(
      wrapperAddress,
      universe.provider
    )

    const [
      wrapperToken,
      curveToken,
      convexToken,
      convexPoolId,
      convexPoolAddress,
    ] = await Promise.all([
      universe.getToken(Address.from(wrapperAddress)),
      wrapperTokenInst.callStatic
        .curveToken()
        .then(Address.from)
        .then(async (a) => await universe.getToken(a)),
      wrapperTokenInst.callStatic
        .convexToken()
        .then(Address.from)
        .then(async (a) => await universe.getToken(a)),
      wrapperTokenInst.callStatic.convexPoolId().then(Number),
      wrapperTokenInst.callStatic.convexPool().then(Address.from),
    ])
    const poolInfo = await boosterInst.callStatic.poolInfo(convexPoolId)
    const lpToken = await universe.getToken(Address.from(poolInfo.lptoken))

    const pool = curveIntegration.byLpToken.get(lpToken)
    if (!pool) {
      throw new Error(
        `Could not find curve pool for token ${wrapperToken} ${curveToken} ${curveToken.address} ${convexPoolAddress} ${convexPoolId}`
      )
    }

    const out = new ConvexStakingWrapper(
      curve,
      universe,
      wrapperToken,
      curveToken,
      convexToken,
      convexPoolAddress,
      pool,
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
  universe: EthereumUniverse,
  curveIntegration: CurveIntegration,
  curve: CurveApi,
  config: IConvexConfig
) => {
  const boosterAddress = Address.from(config.boosterAddress)

  const boosterInst = IBooster__factory.connect(
    boosterAddress.address,
    universe.provider
  )
  // Load all the convex wrapper tokens
  const convexWrappers = await Promise.all(
    Object.entries(config.wrappers).map(([name, wrapperAddress]) =>
      ConvexStakingWrapper.fromConfigAddress(
        universe,
        curve,
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

  return new ReserveConvex(convexWrappers)
}
