import { Universe } from '../Universe'
import {
  MintCometWrapperAction,
  BurnCometWrapperAction,
  MintCometAction,
  BurnCometAction,
} from '../action/CompoundV3'
import { Address } from '../base/Address'
import {
  IComet__factory,
  ICusdcV3Wrapper,
  ICusdcV3Wrapper__factory,
} from '../contracts'
import { TokenQuantity, type Token } from '../entities/Token'
import { Contract } from '../tx-gen/Planner'

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
export class CometWrapper {
  public readonly mintAction
  public readonly burnAction

  public readonly cometWrapperLibrary: Contract

  get universe() {
    return this.comet.compound.universe
  }
  get cometToken() {
    return this.comet.comet
  }

  async quoteMint(amountsIn: TokenQuantity): Promise<TokenQuantity[]> {
    const out = this.wrapperToken.from(
      await this.cometWrapperInst.convertDynamicToStatic(amountsIn.amount)
    )
    return [out]
  }

  async quoteBurn(amountsIn: TokenQuantity): Promise<TokenQuantity[]> {
    const out = this.cometToken.from(
      await this.cometWrapperInst.convertStaticToDynamic(amountsIn.amount)
    )
    return [out]
  }
  public constructor(
    public readonly cometWrapperInst: ICusdcV3Wrapper,
    public readonly comet: Comet,
    public readonly wrapperToken: Token
  ) {
    const mintInputSize = comet.comet.from(1000000.0)
    const burnInputSize = mintInputSize.into(this.wrapperToken)
    const mintRate = comet.universe.createCachedProducer(async () => {
      return (await this.quoteMint(mintInputSize))[0].div(burnInputSize)
    }, 12000)
    const burnRate = comet.universe.createCachedProducer(async () => {
      return (await this.quoteBurn(burnInputSize))[0].div(mintInputSize)
    }, 12000)

    this.mintAction = new MintCometWrapperAction(this, mintRate)
    this.burnAction = new BurnCometWrapperAction(this, burnRate)
    this.cometWrapperLibrary = Contract.createContract(
      ICusdcV3Wrapper__factory.connect(
        this.wrapperToken.address.address,
        this.universe.provider
      )
    )
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
export class Comet {
  get universe() {
    return this.compound.universe
  }
  public readonly mintAction
  public readonly burnAction
  public constructor(
    public readonly cometLibrary: Contract,
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

    return new Comet(
      Contract.createContract(cometInst),
      compound,
      poolToken,
      baseToken,
      collateralTokens
    )
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
  public readonly cometWrapperByWrapperToken: Map<Token, CometWrapper> =
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
    this.universe.defineMintable(comet.mintAction, comet.burnAction, true)
    this.comets.push(comet)
    this.cometByBaseToken.set(comet.borrowToken, comet)
    this.cometByPoolToken.set(poolToken, comet)
    return comet
  }

  async getCometWrapper(wrapperToken: Token) {
    if (this.cometWrapperByWrapperToken.has(wrapperToken)) {
      return this.cometWrapperByWrapperToken.get(wrapperToken)!
    }
    const wrapper = await CometWrapper.load(this, wrapperToken)
    this.universe.defineMintable(wrapper.mintAction, wrapper.burnAction, true)
    this.cometWrappers.push(wrapper)
    this.cometWrapperByWrapperToken.set(wrapperToken, wrapper)
    this.cometWrapperByCometToken.set(wrapper.cometToken, wrapper)
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
  comets: Record<string, string>
  wrappers: string[]
}
export const setupCompoundV3 = async (
  protocolName: string,
  universe: Universe,
  config: CompV3Config
) => {
  const [comets, wrappers] = await Promise.all([
    Promise.all(
      Object.values(config.comets).map((i) =>
        universe.getToken(Address.from(i))
      )
    ),
    Promise.all(config.wrappers.map((i) => universe.getToken(Address.from(i)))),
  ])
  return await CompoundV3Deployment.load(protocolName, universe, {
    comets,
    cTokenWrappers: wrappers,
  })
}
