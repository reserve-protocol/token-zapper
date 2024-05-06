import { ParamType } from '@ethersproject/abi'
import { type Universe } from '../Universe'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import { BlockCache } from '../base/BlockBasedCache'
import {
  CEther,
  CTokenWrapper,
  CTokenWrapper__factory,
  ICToken,
  IComptroller,
  IComptroller__factory,
} from '../contracts'

import { CEther__factory } from '../contracts/factories/contracts/ICToken.sol/CEther__factory'
import { ICToken__factory } from '../contracts/factories/contracts/ICToken.sol/ICToken__factory'
import { type Token, type TokenQuantity } from '../entities/Token'
import {
  Contract,
  FunctionCall,
  Planner,
  Value,
  encodeArg,
} from '../tx-gen/Planner'
import { Action, DestinationOptions, InteractionConvention } from './Action'
import { DefaultMap } from '../base/DefaultMap'

const ONEFP18 = 10n ** 18n

class CompoundV2Market {
  toString() {
    return `Market[${this.deployment.name}](${
      this.burn.input.one
    } = ${this.burn.quoteAction(
      this.storagedRate,
      this.burn.input.one
    )}, wrappers: [${this.wrappers_.join(', ')}]`
  }
  public mint: MintCTokenAction
  public burn: BurnCTokenAction

  public readonly instICToken: ICToken
  public readonly instCEther: CEther

  public readonly instICTokenLib: Contract
  public readonly instCEtherLib: Contract

  private readonly wrappers_: ReserveCTokenWrapper[] = []

  private constructor(
    public readonly deployment: CompoundV2Deployment,
    public readonly cTokenInst: ICToken | CEther,
    public readonly cToken: Token,
    public readonly underlying: Token,
    private storagedRate: bigint
  ) {
    this.instICToken = ICToken__factory.connect(
      this.cToken.address.address,
      this.universe.provider
    )
    this.instICTokenLib = Contract.createContract(this.instICToken)
    this.instCEther = CEther__factory.connect(
      this.cToken.address.address,
      this.universe.provider
    )
    this.instCEtherLib = Contract.createContract(this.instCEther)
    this.mint = new MintCTokenAction(this, underlying, cToken)
    this.burn = new BurnCTokenAction(this, cToken, underlying)

    deployment.universe.defineMintable(this.mint, this.burn, false)
  }

  public createCTokenWrapper(wrapperToken: Token): ReserveCTokenWrapper {
    const wrapper = ReserveCTokenWrapper.fromMarket(this, wrapperToken)
    this.wrappers_.push(wrapper)
    return wrapper
  }

  public async getCurrenRate(): Promise<bigint> {
    return await this.deployment.getCurrentRate(this)
  }

  get universe() {
    return this.deployment.universe
  }

  get rateScale() {
    return ONEFP18 * this.underlying.scale
  }

  public static async create(
    deployment: CompoundV2Deployment,
    cToken: Token
  ): Promise<CompoundV2Market> {
    const marketAddr = cToken.address
    const universe = deployment.universe
    let underlying: Token
    let tokenInst: ICToken | CEther
    try {
      const cTokenInst = ICToken__factory.connect(
        marketAddr.address,
        universe.provider
      )
      underlying = await cTokenInst.callStatic
        .underlying()
        .then(Address.from)
        .then(async (a) => await universe.getToken(a))
      tokenInst = cTokenInst
    } catch (e) {
      const cEther = CEther__factory.connect(
        marketAddr.address,
        universe.provider
      )
      underlying = universe.nativeToken
      tokenInst = cEther
    }
    const initialRate = await tokenInst.callStatic
      .exchangeRateCurrent()
      .then((rate) => rate.toBigInt())
    return new CompoundV2Market(
      deployment,
      tokenInst,
      cToken,
      underlying,
      initialRate
    )
  }
}
export class CompoundV2Deployment {
  private markets_: Map<Token, CompoundV2Market> | null = null
  private cTokenRateCache: BlockCache<CompoundV2Market, bigint>
  private constructor(
    public readonly universe: Universe,
    public readonly comptroller: {
      address: Address
      instance: IComptroller
    },
    public readonly name: string
  ) {
    this.cTokenRateCache = universe.createCache<CompoundV2Market, bigint>(
      async (market) => {
        try {
          const out = await market.cTokenInst.callStatic
            .exchangeRateCurrent()
            .then((rate) => rate.toBigInt())
          return out
        } catch (e) {
          return 0n
        }
      },
      universe.config.requoteTolerance
    )
  }
  public async getCurrentRate(market: CompoundV2Market): Promise<bigint> {
    return await this.cTokenRateCache.get(market)
  }
  private async initialize() {
    const markets = await this.comptroller.instance.callStatic
      .getAllMarkets()
      .then((markets) => markets.map(Address.from))
      .then((marketAddrs) =>
        Promise.all(
          marketAddrs.map(async (marketAddr) => {
            const cToken = await this.universe.getToken(marketAddr)
            return await CompoundV2Market.create(this, cToken)
          })
        )
      )
    this.markets_ = new Map<Token, CompoundV2Market>(
      markets.map((market) => [market.cToken, market] as const)
    )
    this.cTokens_ = markets.map((market) => market.cToken)
  }

  get markets(): Map<Token, CompoundV2Market> {
    if (!this.markets_) {
      throw new Error('Deployment not initialized')
    }
    return this.markets_
  }

  public async createCTokenWrapper(
    wrapperToken: Token
  ): Promise<ReserveCTokenWrapper> {
    const wrapper = await ReserveCTokenWrapper.create(this, wrapperToken)
    return wrapper
  }

  public getMarket(token: Token): CompoundV2Market | undefined {
    return this.markets.get(token)
  }
  private cTokens_: Token[] | null = null
  get cTokens(): Token[] {
    if (!this.cTokens_) {
      throw new Error('Deployment not initialized')
    }
    return this.cTokens_
  }
  public static async create(
    universe: Universe,
    comptroller: Address,
    name: string
  ): Promise<CompoundV2Deployment> {
    const compInstance = IComptroller__factory.connect(
      comptroller.address,
      universe.provider
    )
    const deployment = new CompoundV2Deployment(
      universe,
      {
        address: comptroller,
        instance: compInstance,
      },
      name
    )
    await deployment.initialize()

    return deployment
  }

  public toString() {
    return `CompV2[${this.name}](${[...this.markets.values()].join(', ')})`
  }
}

abstract class CompV2Action extends Action('CompV2') {
  get returnsOutput() {
    return false
  }
  get outputSlippage(): bigint {
    return 1n
  }

  public async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPredicted]: TokenQuantity[]
  ) {
    planner.add(
      this.planAction(
        input ?? encodeArg(inputPredicted.amount, ParamType.from('uint256'))
      )
    )
    return null
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    const rate = await this.market.getCurrenRate()
    return [this.quoteAction(rate, amountsIn)]
  }
  public abstract quoteAction(
    rate: bigint,
    amountsIn: TokenQuantity
  ): TokenQuantity

  public abstract planAction(input: Value): FunctionCall
  constructor(
    readonly market: CompoundV2Market,
    readonly input: Token,
    readonly output: Token
  ) {
    super(
      market.cToken.address,
      [input],
      [output],
      input === market.universe.nativeToken
        ? InteractionConvention.None
        : InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      input === market.universe.nativeToken
        ? []
        : [new Approval(input, output.address)]
    )
  }
}

export class MintCTokenAction extends CompV2Action {
  gasEstimate() {
    return BigInt(150000n)
  }
  public quoteAction(rate: bigint, amountsIn: TokenQuantity) {
    let out =
      (amountsIn.amount * this.market.rateScale) / rate / this.input.scale
    return this.output.fromBigInt(out)
  }
  public planAction(input: Value): FunctionCall {
    if (this.market.cToken === this.market.universe.nativeToken) {
      return this.market.instCEtherLib.mint().withValue(input)
    }
    return this.market.instICTokenLib.mint(input)
  }

  constructor(
    public readonly market: CompoundV2Market,
    input: Token,
    output: Token
  ) {
    super(market, input, output)
  }
}

export class BurnCTokenAction extends CompV2Action {
  get actionName() {
    return 'redeem'
  }
  gasEstimate() {
    return BigInt(150000n)
  }
  public quoteAction(rate: bigint, amountsIn: TokenQuantity) {
    const out =
      (amountsIn.amount * rate * this.market.underlying.scale) /
      this.market.rateScale
    return this.output.fromBigInt(out)
  }

  public planAction(input: Value): FunctionCall {
    if (this.market.underlying === this.market.universe.nativeToken) {
      return this.market.instCEtherLib.redeem(input)
    }
    return this.market.instICTokenLib.redeem(input)
  }
  constructor(
    public readonly market: CompoundV2Market,
    input: Token,
    output: Token
  ) {
    super(market, input, output)
  }
}

export class ReserveCTokenWrapper {
  public readonly mint: MintCTokenWrapperAction
  public readonly burn: BurnCTokenWrapperAction
  private constructor(
    public readonly market: CompoundV2Market,
    public readonly wrapperToken: Token,
    public readonly contracts: {
      instWrapper: CTokenWrapper
      weirollWrapper: Contract
    }
  ) {
    this.mint = new MintCTokenWrapperAction(this)
    this.burn = new BurnCTokenWrapperAction(this)

    market.universe.defineMintable(this.mint, this.burn, false)
  }

  public static fromMarket(
    market: CompoundV2Market,
    wrapperToken: Token
  ): ReserveCTokenWrapper {
    const instWrapper = CTokenWrapper__factory.connect(
      wrapperToken.address.address,
      market.universe.provider
    )
    const weirollWrapper = Contract.createContract(instWrapper)
    return new ReserveCTokenWrapper(market, wrapperToken, {
      instWrapper,
      weirollWrapper,
    })
  }

  public static async create(
    deployment: CompoundV2Deployment,
    cTokenWrapperToken: Token
  ) {
    const instWrapper = CTokenWrapper__factory.connect(
      cTokenWrapperToken.address.address,
      deployment.universe.provider
    )
    const cToken = await instWrapper.callStatic
      .underlying()
      .then(Address.from)
      .then(async (t) => await deployment.universe.getToken(t))
    const weirollWrapper = Contract.createContract(instWrapper)
    const market = deployment.getMarket(cToken)
    if (!market) {
      throw new Error('Market not found')
    }
    return new ReserveCTokenWrapper(market, cTokenWrapperToken, {
      instWrapper,
      weirollWrapper,
    })
  }

  public toString() {
    return `CTokenWrapper(${this.wrapperToken}, proto=${this.market.deployment.name},token=${this.market.cToken})`
  }
}

abstract class CTokenWrapperAction extends Action('Reserve.CTokenWrapper') {
  abstract get actionName(): string
  public toString(): string {
    return `CTokenWrapper.${this.actionName}(${this.input} => ${this.output})`
  }
  get returnsOutput() {
    return true
  }
  get outputSlippage(): bigint {
    return 50n
  }
  public async plan(
    planner: Planner,
    [input]: Value[],
    _: Address,
    [inputPredicted]: TokenQuantity[]
  ) {
    const inp =
      input ?? encodeArg(inputPredicted.amount, ParamType.from('uint256'))

    planner.add(this.planAction(inp))

    return [input]
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return await Promise.resolve([this.quoteAction(amountsIn)])
  }
  public quoteAction(amountsIn: TokenQuantity) {
    return amountsIn.into(this.output)
  }
  public abstract planAction(input: Value): FunctionCall
  constructor(
    public readonly wrapper: ReserveCTokenWrapper,
    public readonly input: Token,
    public readonly output: Token
  ) {
    super(
      wrapper.wrapperToken.address,
      [input],
      [output],
      input === wrapper.wrapperToken
        ? InteractionConvention.None
        : InteractionConvention.ApprovalRequired,
      DestinationOptions.Callee,
      input === wrapper.wrapperToken
        ? []
        : [new Approval(input, output.address)]
    )
  }
}

export class MintCTokenWrapperAction extends CTokenWrapperAction {
  gasEstimate() {
    return BigInt(250000n)
  }
  public planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weirollWrapper.deposit(
      input,
      this.wrapper.market.universe.execAddress.address
    )
  }
  get actionName() {
    return 'deposit'
  }
  constructor(public readonly wrapper: ReserveCTokenWrapper) {
    super(wrapper, wrapper.market.cToken, wrapper.wrapperToken)
  }
}

export class BurnCTokenWrapperAction extends CTokenWrapperAction {
  gasEstimate() {
    return BigInt(250000n)
  }

  public planAction(input: Value): FunctionCall {
    return this.wrapper.contracts.weirollWrapper.withdraw(
      input,
      this.wrapper.market.universe.execAddress.address
    )
  }
  get actionName() {
    return 'withdraw'
  }
  constructor(public readonly wrapper: ReserveCTokenWrapper) {
    super(wrapper, wrapper.wrapperToken, wrapper.market.cToken)
  }
}

export interface ConfigDefinition {
  comptroller: string
  wrappers: string[]
}
export const loadCompV2Deployment = async (
  protocolName: string,
  universe: Universe,
  definition: ConfigDefinition
) => {
  const comptroller = Address.from(definition.comptroller)

  const deployment = await CompoundV2Deployment.create(
    universe,
    comptroller,
    protocolName
  )
  await Promise.all(
    definition.wrappers.map(async (wrapper) => {
      const token = await universe.getToken(Address.from(wrapper))
      await deployment.createCTokenWrapper(token)
    })
  )
  return deployment
}
