import { ParamType } from '@ethersproject/abi'
import { Universe } from '../Universe'
import {
  Action,
  DestinationOptions,
  InteractionConvention,
} from '../action/Action'
import { Address } from '../base/Address'
import { Approval } from '../base/Approval'
import {
  IComet__factory,
  ICusdcV3Wrapper,
  ICusdcV3Wrapper__factory,
  IERC20__factory,
} from '../contracts'
import { TokenQuantity, type Token } from '../entities/Token'
import { Contract, Planner, Value, encodeArg } from '../tx-gen/Planner'

export abstract class BaseCometAction extends Action('CompV3') {
  public get outputSlippage(): bigint {
    return 0n
  }
  get returnsOutput(): boolean {
    return true
  }
  get supportsDynamicInput(): boolean {
    return true
  }
  get oneUsePrZap(): boolean {
    return false
  }
  toString(): string {
    return `${this.protocol}.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }
  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.outputToken[0].from(amountsIn.into(this.outputToken[0]).amount - 1n),
    ]
  }
  get universe() {
    return this.comet.universe
  }

  gasEstimate() {
    return BigInt(250000n)
  }
  constructor(
    public readonly mainAddress: Address,
    public readonly comet: Comet,
    public readonly actionName: string,
    opts: {
      inputToken: Token[]
      outputToken: Token[]
      interaction: InteractionConvention
      destination: DestinationOptions
      approvals: Approval[]
    }
  ) {
    super(
      mainAddress,
      opts.inputToken,
      opts.outputToken,
      opts.interaction,
      opts.destination,
      opts.approvals
    )
  }
  async plan(
    planner: Planner,
    [input]: Value[],
    destination: Address
  ): Promise<null | Value[]> {
    const out = await this.planAction(planner, destination, input)!
    if (out) {
      return [out]
    }
    return null
  }
  abstract planAction(
    planner: Planner,
    destination: Address,
    input: Value
  ): Promise<Value | null>
}
class MintCometAction extends BaseCometAction {
  constructor(comet: Comet) {
    super(comet.comet.address, comet, 'supply', {
      inputToken: [comet.borrowToken],
      outputToken: [comet.comet],
      interaction: InteractionConvention.ApprovalRequired,
      destination: DestinationOptions.Callee,
      approvals: [new Approval(comet.borrowToken, comet.comet.address)],
    })
  }
  async planAction(planner: Planner, _: Address, input: Value) {
    planner.add(
      this.comet.cometLibrary.supply(this.inputToken[0].address.address, input)
    )
    return input
  }
}

class MintCometWrapperAction extends BaseCometAction {
  public get outputSlippage(): bigint {
    return 30n
  }
  constructor(public readonly cometWrapper: CometWrapper) {
    super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'deposit', {
      inputToken: [cometWrapper.cometToken],
      outputToken: [cometWrapper.wrapperToken],
      interaction: InteractionConvention.ApprovalRequired,
      destination: DestinationOptions.Callee,
      approvals: [
        new Approval(
          cometWrapper.cometToken,
          cometWrapper.wrapperToken.address
        ),
      ],
    })
  }

  toString(): string {
    return `CometWrapper.${this.actionName}(${this.inputToken.join(
      ', '
    )} -> ${this.outputToken.join(', ')})`
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.outputToken[0].from(
        await this.cometWrapper.cometWrapperInst.convertDynamicToStatic(
          amountsIn.amount
        )
      ),
    ]
  }

  async planAction(planner: Planner, _: Address, input: Value) {
    planner.add(this.cometWrapper.cometWrapperLibrary.deposit(input))
    return this.outputBalanceOf(this.universe, planner)[0]
  }
}
class BurnCometAction extends BaseCometAction {
  get returnsOutput(): boolean {
    return false
  }
  get supportsDynamicInput(): boolean {
    return true
  }
  constructor(comet: Comet) {
    super(comet.comet.address, comet, 'burn', {
      inputToken: [comet.comet],
      outputToken: [comet.borrowToken],
      interaction: InteractionConvention.ApprovalRequired,
      destination: DestinationOptions.Callee,
      approvals: [
        new Approval(comet.borrowToken, comet.comet.address),
      ],
    })
  }
  async planAction(planner: Planner, _: Address, input: Value) {
    planner.add(
      this.comet.cometLibrary.withdraw(
        this.comet.borrowToken.address.address,
        input
      )
    )
    return null
  }
}
class BurnCometWrapperAction extends BaseCometAction {
  public get outputSlippage(): bigint {
    return 10n
  }
  get returnsOutput(): boolean {
    return false
  }

  constructor(public readonly cometWrapper: CometWrapper) {
    super(cometWrapper.wrapperToken.address, cometWrapper.comet, 'withdraw', {
      inputToken: [cometWrapper.wrapperToken],
      outputToken: [cometWrapper.cometToken],
      interaction: InteractionConvention.None,
      destination: DestinationOptions.Callee,
      approvals: [],
    })
  }

  async quote([amountsIn]: TokenQuantity[]): Promise<TokenQuantity[]> {
    return [
      this.cometWrapper.comet.comet.from(
        await this.cometWrapper.cometWrapperInst.convertStaticToDynamic(
          amountsIn.amount
        )
      ),
    ]
  }

  private get wrappedCommitLib() {
    return this.cometWrapper.cometWrapperLibrary
  }
  async planAction(planner: Planner, _: Address, __: Value) {
    const cometBalance = planner.add(
      this.wrappedCommitLib.underlyingBalanceOf(
        this.universe.execAddress.address
      )
    )!
    planner.add(this.wrappedCommitLib.withdraw(cometBalance))
    return cometBalance
  }
}
class CometAssetInfo {
  public constructor(
    readonly offset: number,
    readonly asset: Token,
    readonly priceFeed: Address,
    readonly scale: bigint,
    readonly borrowCollateralFactor: bigint,
    readonly liquidateCollateralFactor: bigint,
    readonly liquidationFactor: bigint,
    readonly supplyCap: bigint
  ) {}

  public static async load(universe: Universe, comet: Token, index: number) {
    const cometInst = IComet__factory.connect(
      comet.address.address,
      universe.provider
    )
    const {
      asset,
      priceFeed,
      scale,
      borrowCollateralFactor,
      liquidateCollateralFactor,
      liquidationFactor,
      supplyCap,
    } = await cometInst.getAssetInfo(index)
    return new CometAssetInfo(
      index,
      await universe.getToken(Address.from(asset)),
      Address.from(priceFeed),
      scale.toBigInt(),
      borrowCollateralFactor.toBigInt(),
      liquidateCollateralFactor.toBigInt(),
      liquidationFactor.toBigInt(),
      supplyCap.toBigInt()
    )
  }

  toString() {
    return `CometAssetInfo(${this.asset},priceFeed:${this.priceFeed})`
  }
}
class CometWrapper {
  public readonly mintAction
  public readonly burnAction

  public readonly cometWrapperLibrary: Contract

  get universe() {
    return this.comet.compound.universe
  }
  get cometToken() {
    return this.comet.comet
  }
  public constructor(
    public readonly cometWrapperInst: ICusdcV3Wrapper,
    public readonly comet: Comet,
    public readonly wrapperToken: Token
  ) {
    this.cometWrapperLibrary = Contract.createContract(
      ICusdcV3Wrapper__factory.connect(
        this.wrapperToken.address.address,
        this.universe.provider
      )
    )
    this.mintAction = new MintCometWrapperAction(this)
    this.burnAction = new BurnCometWrapperAction(this)
  }

  toString() {
    return `CometWrapper(token=${this.wrapperToken},comet=${this.comet.comet})`
  }

  public static async load(
    compound: CompoundV3Deployment,
    wrapperToken: Token
  ) {
    const cometWrapperInst = ICusdcV3Wrapper__factory.connect(
      wrapperToken.address.address,
      compound.universe.provider
    )
    const cometToken = await compound.universe.getToken(
      Address.from(await cometWrapperInst.underlyingComet())
    )
    const comet = await compound.getComet(cometToken)
    return new CometWrapper(cometWrapperInst, comet, wrapperToken)
  }
}
class Comet {
  get universe() {
    return this.compound.universe
  }
  public readonly mintAction
  public readonly burnAction
  public constructor(
    public readonly cometLibrary: Contract,
    public readonly borrowTokenAsERC20: Contract,
    readonly compound: CompoundV3Deployment,
    readonly comet: Token,
    readonly borrowToken: Token,
    readonly collateralTokens: CometAssetInfo[]
  ) {
    this.mintAction = new MintCometAction(this)
    this.burnAction = new BurnCometAction(this)
  }

  public static async load(compound: CompoundV3Deployment, poolToken: Token) {
    const cometInst = IComet__factory.connect(
      poolToken.address.address,
      compound.universe.provider
    )
    const [baseToken, assetCount] = await Promise.all([
      compound.universe.getToken(Address.from(await cometInst.baseToken())),
      await cometInst.numAssets(),
    ])

    const collateralTokens = await Promise.all(
      [...new Array(assetCount)].map(async (_, i) => {
        return await CometAssetInfo.load(compound.universe, poolToken, i)
      })
    )

    const comet = new Comet(
      Contract.createContract(cometInst),
      Contract.createContract(
        IERC20__factory.connect(
          baseToken.address.address,
          compound.universe.provider
        )
      ),
      compound,
      poolToken,
      baseToken,
      collateralTokens
    )
    console.log(`Loaded comet ${comet}`)
    return comet
  }

  toString() {
    return `Comet(token=${this.comet},base=${
      this.borrowToken
    },collateral=${this.collateralTokens.map((i) => i.asset).join()}`
  }
}
export class CompoundV3Deployment {
  public readonly comets: Comet[] = []
  public readonly cometWrappers: CometWrapper[] = []
  public readonly cometByBaseToken: Map<Token, Comet> = new Map()
  public readonly cometByPoolToken: Map<Token, Comet> = new Map()
  public readonly cometWrapperByWrapperToken: Map<Address, CometWrapper> =
    new Map()
  public readonly cometWrapperByCometToken: Map<Token, CometWrapper> = new Map()

  public constructor(
    public readonly protocolName: string,
    public readonly universe: Universe
  ) {}

  async getComet(poolToken: Token) {
    if (this.cometByPoolToken.has(poolToken)) {
      return this.cometByPoolToken.get(poolToken)!
    }
    const comet = await Comet.load(this, poolToken)
    this.cometByPoolToken.set(poolToken, comet)
    this.comets.push(comet)
    this.cometByBaseToken.set(comet.borrowToken, comet)
    this.cometByPoolToken.set(poolToken, comet)
    this.universe.defineMintable(comet.mintAction, comet.burnAction)
    return comet
  }

  async getCometWrapper(wrapperToken: Token) {
    if (this.cometWrapperByWrapperToken.has(wrapperToken.address)) {
      return this.cometWrapperByWrapperToken.get(wrapperToken.address)!
    }
    const wrapper = await CometWrapper.load(this, wrapperToken)
    this.cometWrapperByWrapperToken.set(wrapperToken.address, wrapper)
    this.cometWrappers.push(wrapper)
    this.cometWrapperByCometToken.set(wrapper.cometToken, wrapper)
    this.universe.defineMintable(wrapper.mintAction, wrapper.burnAction)
    console.log(wrapper.toString())
    return wrapper
  }

  public static async load(
    protocolName: string,
    universe: Universe,
    config: {
      comets: Token[]
      cTokenWrappers: Token[]
    }
  ) {
    const compoundV3 = new CompoundV3Deployment(protocolName, universe)
    await Promise.all(
      config.comets.map(async (cometToken) => {
        await compoundV3.getComet(cometToken)
      })
    )
    await Promise.all(
      config.cTokenWrappers.map(async (wrapper) => {
        await compoundV3.getCometWrapper(wrapper)
      })
    )
    return compoundV3
  }

  toString() {
    return `${this.protocolName}(markets=[${this.comets.join(
      ', '
    )}],wrappers=[${this.cometWrappers.join(', ')}])`
  }
}
interface CompV3Config {
  comets: string[]
  wrappers: string[]
}
export const setupCompoundV3 = async (
  protocolName: string,
  universe: Universe,
  config: CompV3Config
) => {
  const [comets, wrappers] = await Promise.all([
    Promise.all(config.comets.map((i) => universe.getToken(Address.from(i)))),
    Promise.all(config.wrappers.map((i) => universe.getToken(Address.from(i)))),
  ])
  return await CompoundV3Deployment.load(protocolName, universe, {
    comets,
    cTokenWrappers: wrappers,
  })
}
